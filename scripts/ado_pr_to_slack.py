#!/usr/bin/env python3
import json
import os
import sys
import time
import base64
import urllib.parse
import urllib.request
from datetime import datetime, timezone


def env(name, default=None, required=False):
    val = os.environ.get(name, default)
    if required and not val:
        print(f"Missing required env var: {name}", file=sys.stderr)
        sys.exit(2)
    return val


def b64_pat(pat: str) -> str:
    token = f":{pat}".encode("utf-8")
    return base64.b64encode(token).decode("ascii")


def http_get(url: str, pat_b64: str):
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Basic {pat_b64}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_json(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def get_me_profile(org: str, pat_b64: str) -> dict:
    url = f"https://vssps.dev.azure.com/{org}/_apis/profile/profiles/me?api-version=7.1-preview.3"
    return http_get(url, pat_b64)


def fetch_my_prs(org: str, project: str, creator_id: str, pat_b64: str, status: str = "active", top: int = 50) -> list:
    params = {
        "searchCriteria.creatorId": creator_id,
        "searchCriteria.status": status,
        "$top": str(top),
        "api-version": "7.1-preview.1",
    }
    qs = urllib.parse.urlencode(params)
    url = f"https://dev.azure.com/{org}/{project}/_apis/git/pullrequests?{qs}"
    data = http_get(url, pat_b64)
    return data.get("value", [])


def prune_ref(ref: str) -> str:
    if not ref:
        return ref
    if ref.startswith("refs/heads/"):
        return ref[len("refs/heads/"):]
    return ref


def load_state(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"seen": []}
    except Exception as e:
        print(f"Failed to read state file: {e}", file=sys.stderr)
        return {"seen": []}


def save_state(path: str, state: dict):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f)
    os.replace(tmp, path)


def pr_link(org: str, project: str, repo: str, pr_id: int) -> str:
    # Standard Azure Repos PR URL format
    return f"https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{pr_id}"


def post_slack(webhook: str, text: str):
    payload = {"text": text}
    return http_post_json(webhook, payload)


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def main():
    org = env("AZDO_ORG", required=True)  # e.g., imagoworks
    project = env("AZDO_PROJECT", required=True)  # e.g., MyProject
    pat = env("AZDO_PAT", required=True)
    slack_webhook = env("SLACK_WEBHOOK", required=True)
    repos_filter = {r.strip() for r in env("AZDO_REPOS", "").split(",") if r.strip()}
    interval = int(env("POLL_INTERVAL", "60"))
    state_file = os.path.expanduser(env("STATE_FILE", "~/.ado-pr-notify/state.json"))

    pat_b64 = b64_pat(pat)

    # Resolve creator id (GUID) for the PAT owner
    me = get_me_profile(org, pat_b64)
    creator_id = me.get("id")
    if not creator_id:
        print("Failed to resolve current user profile id", file=sys.stderr)
        sys.exit(2)

    state = load_state(state_file)
    seen = set(state.get("seen", []))

    # First run seeding: avoid spamming for already existing PRs
    initial = fetch_my_prs(org, project, creator_id, pat_b64, status="active", top=100)
    if not state.get("initialized"):
        for pr in initial:
            seen.add(str(pr.get("pullRequestId")))
        state["seen"] = sorted(seen)
        state["initialized"] = True
        save_state(state_file, state)
        print(f"[{now_iso()}] Seeded state with {len(initial)} existing PRs. Monitoring for new ones...")

    while True:
        try:
            prs = fetch_my_prs(org, project, creator_id, pat_b64, status="active", top=50)
            # Sort by creation date ascending so notifications are chronological
            prs.sort(key=lambda x: x.get("creationDate") or x.get("createdDate") or "")

            for pr in prs:
                pr_id = str(pr.get("pullRequestId"))
                if pr_id in seen:
                    continue

                repo_name = (pr.get("repository") or {}).get("name") or ""
                if repos_filter and repo_name not in repos_filter:
                    continue

                title = pr.get("title") or "(no title)"
                src = prune_ref(pr.get("sourceRefName") or "")
                tgt = prune_ref(pr.get("targetRefName") or "")
                url = pr_link(org, project, repo_name, pr.get("pullRequestId"))
                author = ((pr.get("createdBy") or {}).get("displayName") or "you")

                text = f"PR created by {author}: {title}\nRepo: {repo_name} | {src} → {tgt}\n{url}"

                try:
                    post_slack(slack_webhook, text)
                    print(f"[{now_iso()}] Notified Slack for PR {pr_id}")
                except Exception as e:
                    print(f"[{now_iso()}] Failed to post to Slack for PR {pr_id}: {e}", file=sys.stderr)

                seen.add(pr_id)
                state["seen"] = sorted(seen)
                save_state(state_file, state)

        except Exception as e:
            print(f"[{now_iso()}] Poll error: {e}", file=sys.stderr)

        time.sleep(interval)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Exiting...")

