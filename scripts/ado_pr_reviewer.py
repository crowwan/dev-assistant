#!/usr/bin/env python3
import base64
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple


def env(name: str, default: Optional[str] = None, required: bool = False) -> str:
    val = os.environ.get(name, default)
    if required and not val:
        print(f"Missing required env var: {name}", file=sys.stderr)
        sys.exit(2)
    return val or ""


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


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


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


def pr_web_link(org: str, project: str, repo: str, pr_id: int) -> str:
    return f"https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{pr_id}"


def prune_ref(ref: str) -> str:
    if ref.startswith("refs/heads/"):
        return ref[len("refs/heads/"):]
    return ref


def run(cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
    p = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = p.communicate()
    return p.returncode, out, err


def git_fetch_branches(repo_dir: str, remote: str, src_ref: str, tgt_ref: str, local_src: str, local_tgt: str):
    # Create local refs for source and target
    run(["git", "fetch", remote, f"{src_ref}:{local_src}"], cwd=repo_dir)
    run(["git", "fetch", remote, f"{tgt_ref}:{local_tgt}"], cwd=repo_dir)


def git_diff_names(repo_dir: str, base_ref: str, head_ref: str) -> List[Tuple[str, str]]:
    # Returns list of (status, path). Uses --name-status for simplicity.
    code, out, err = run(["git", "diff", "--name-status", base_ref, head_ref], cwd=repo_dir)
    if code != 0:
        raise RuntimeError(f"git diff failed: {err}")
    changes: List[Tuple[str, str]] = []
    for line in out.splitlines():
        parts = line.strip().split("\t")
        if not parts:
            continue
        status = parts[0]
        path = parts[-1]
        changes.append((status, path))
    return changes


def read_file(repo_dir: str, path: str, ref: Optional[str] = None) -> Optional[str]:
    if ref:
        code, out, err = run(["git", "show", f"{ref}:{path}"], cwd=repo_dir)
        if code != 0:
            return None
        return out
    try:
        with open(os.path.join(repo_dir, path), "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return None


@dataclass
class Finding:
    severity: str  # INFO/WARN/ERROR
    title: str
    details: Optional[str] = None


def check_lockfile(changes: List[Tuple[str, str]]) -> List[Finding]:
    findings: List[Finding] = []
    pkg_dirs: Set[str] = set()
    lock_touched: Set[str] = set()
    for st, p in changes:
        if p.endswith("package.json"):
            pkg_dirs.add(os.path.dirname(p) or ".")
        if p.endswith("package-lock.json") or p.endswith("pnpm-lock.yaml") or p.endswith("yarn.lock"):
            lock_touched.add(os.path.dirname(p) or ".")
    for d in sorted(pkg_dirs):
        if d not in lock_touched:
            findings.append(Finding(
                "WARN",
                f"{d or '.'}: package.json changed without lockfile update",
                "Update lockfile (npm/pnpm/yarn) or commit the change if intentional.",
            ))
    return findings


def check_barrel_export(repo_dir: str, changes: List[Tuple[str, str]], head_ref: str) -> List[Finding]:
    findings: List[Finding] = []
    idx_path = "src/index.ts"
    idx = read_file(repo_dir, idx_path, ref=head_ref)
    if idx is None:
        return findings
    idx_text = idx
    new_ts_files = [p for st, p in changes if st.startswith("A") and p.startswith("src/") and p.endswith((".ts", ".tsx")) and os.path.basename(p) != "index.ts"]
    if not new_ts_files:
        return findings
    missing: List[str] = []
    for f in new_ts_files:
        rel = f[len("src/") :]
        rel_noext = re.sub(r"\.(tsx|ts)$", "", rel)
        # match paths like ./foo or ./foo/bar
        pattern = re.escape(rel_noext)
        if not re.search(rf"from\s+['\"]\.?/?{pattern}['\"]|export\s+\*\s+from\s+['\"]\.?/?{pattern}['\"]", idx_text):
            missing.append(rel_noext)
    if missing:
        details = "\n".join(f"- src/{m}" for m in missing)
        findings.append(Finding(
            "WARN",
            "New modules may be missing from src/index.ts exports",
            details,
        ))
    return findings


def check_tests(repo_dir: str, changes: List[Tuple[str, str]], head_ref: str) -> List[Finding]:
    findings: List[Finding] = []
    changed_src: List[str] = [p for st, p in changes if p.startswith("src/") and p.endswith((".ts", ".tsx", ".js", ".jsx"))]
    changed_tests: Set[str] = {p for st, p in changes if re.search(r"(\.test\.|\.spec\.)", p) or "/__tests__/" in p}
    if not changed_src:
        return findings
    no_test_for: List[str] = []
    for p in changed_src:
        base = re.sub(r"\.(tsx|ts|jsx|js)$", "", p)
        # check typical colocated tests
        candidates = [
            f"{base}.test.ts",
            f"{base}.spec.ts",
            f"{base}.test.tsx",
            f"{base}.spec.tsx",
            f"{base}.test.js",
            f"{base}.spec.js",
        ]
        if any(c in changed_tests for c in candidates):
            continue
        # check __tests__ sibling
        dirn = os.path.dirname(p)
        bn = os.path.basename(base)
        sibling = [
            os.path.join(dirn, "__tests__", f"{bn}.test.ts"),
            os.path.join(dirn, "__tests__", f"{bn}.spec.ts"),
            os.path.join(dirn, "__tests__", f"{bn}.test.tsx"),
            os.path.join(dirn, "__tests__", f"{bn}.spec.tsx"),
        ]
        if any(s in changed_tests for s in sibling):
            continue
        no_test_for.append(p)
    if no_test_for:
        details = "\n".join(f"- {p}" for p in no_test_for[:20])
        more = max(0, len(no_test_for) - 20)
        if more:
            details += f"\n... and {more} more"
        findings.append(Finding(
            "INFO",
            "Changed modules without accompanying test changes",
            details,
        ))
    return findings


def check_prisma(changes: List[Tuple[str, str]]) -> List[Finding]:
    findings: List[Finding] = []
    schema_changed = any(p == "prisma/schema.prisma" for _, p in changes)
    migrations_changed = any(p.startswith("prisma/migrations/") for _, p in changes)
    if schema_changed and not migrations_changed:
        findings.append(Finding(
            "WARN",
            "Prisma schema changed without migrations",
            "Generate and commit a migration if applicable.",
        ))
    return findings


def summarize_findings(findings: List[Finding]) -> Tuple[str, str]:
    if not findings:
        return ("No issues detected.", "No additional actions suggested.")
    counts: Dict[str, int] = {"ERROR": 0, "WARN": 0, "INFO": 0}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1
    header = f"Findings — WARN: {counts['WARN']} | INFO: {counts['INFO']} | ERROR: {counts['ERROR']}"
    lines = []
    for f in findings:
        line = f"- {f.severity}: {f.title}"
        if f.details:
            line += f"\n{f.details}"
        lines.append(line)
    return header, "\n".join(lines)


def post_slack(webhook: str, text: str):
    payload = {"text": text}
    return http_post_json(webhook, payload)


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


def main():
    org = env("AZDO_ORG", required=True)  # ImagoWorks
    project = env("AZDO_PROJECT", required=True)  # dentbird-solutions
    pat = env("AZDO_PAT", required=True)
    slack_webhook = env("SLACK_WEBHOOK", required=True)
    repo_name = env("TARGET_REPO", "dentbird-solutions")
    repo_dir = os.path.expanduser(env("REPO_DIR", f"~/pr-review/{repo_name}"))
    remote = env("GIT_REMOTE", "origin")
    interval = int(env("POLL_INTERVAL", "90"))
    state_file = os.path.expanduser(env("STATE_FILE", "~/.ado-pr-review/state.json"))

    pat_b64 = b64_pat(pat)
    me = get_me_profile(org, pat_b64)
    creator_id = me.get("id")
    if not creator_id:
        print("Failed to resolve current user id", file=sys.stderr)
        sys.exit(2)

    state = load_state(state_file)
    seen: Set[str] = set(state.get("seen", []))

    # Initial seed to avoid blasting old PRs
    if not state.get("initialized"):
        prs = fetch_my_prs(org, project, creator_id, pat_b64, status="active", top=100)
        for pr in prs:
            if pr.get("repository", {}).get("name") == repo_name:
                seen.add(str(pr.get("pullRequestId")))
        state["seen"] = sorted(seen)
        state["initialized"] = True
        save_state(state_file, state)
        print(f"[{now_iso()}] Seeded with existing PRs. Monitoring new ones...")

    while True:
        try:
            prs = fetch_my_prs(org, project, creator_id, pat_b64, status="active", top=50)
            prs.sort(key=lambda x: x.get("creationDate") or x.get("createdDate") or "")
            for pr in prs:
                pr_id = str(pr.get("pullRequestId"))
                if pr_id in seen:
                    continue
                repo = pr.get("repository", {}).get("name") or ""
                if repo != repo_name:
                    continue
                src_ref = pr.get("sourceRefName") or ""
                tgt_ref = pr.get("targetRefName") or ""
                src = prune_ref(src_ref)
                tgt = prune_ref(tgt_ref)
                title = pr.get("title") or "(no title)"
                url = pr_web_link(org, project, repo, pr.get("pullRequestId"))

                # Prepare local refs and diff
                local_src = f"refs/heads/__pr_src_{pr_id}"
                local_tgt = f"refs/heads/__pr_tgt_{pr_id}"

                # Ensure repository exists
                if not os.path.isdir(os.path.join(repo_dir, ".git")):
                    raise RuntimeError(f"Repo not found at {repo_dir}. Clone it first.")

                git_fetch_branches(repo_dir, remote, src_ref, tgt_ref, local_src, local_tgt)
                changes = git_diff_names(repo_dir, local_tgt, local_src)

                # Heuristics
                findings: List[Finding] = []
                findings += check_lockfile(changes)
                findings += check_barrel_export(repo_dir, changes, local_src)
                findings += check_tests(repo_dir, changes, local_src)
                findings += check_prisma(changes)

                header, body = summarize_findings(findings)
                summary = f"PR Review — {title}\nRepo: {repo} | {src} → {tgt}\n{url}\n\n{header}\n{body}"

                try:
                    post_slack(slack_webhook, summary)
                    print(f"[{now_iso()}] Posted review to Slack for PR {pr_id}")
                except Exception as e:
                    print(f"[{now_iso()}] Failed to post Slack review for PR {pr_id}: {e}", file=sys.stderr)

                seen.add(pr_id)
                state["seen"] = sorted(seen)
                save_state(state_file, state)

        except Exception as e:
            print(f"[{now_iso()}] Loop error: {e}", file=sys.stderr)

        time.sleep(interval)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Exiting...")

