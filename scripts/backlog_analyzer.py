#!/usr/bin/env python3
"""
Jira 백로그 버그 분석기
- DEN 보드 31의 백로그에서 버그 티켓을 조회
- 발생 빈도로 필터링 (Always만 분석 대상)
- 코드베이스 분석으로 해결 가능성 판단
- Slack으로 알림 전송
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# 설정
JIRA_URL = "https://imagoworks.atlassian.net"
BOARD_ID = 31
PROJECT_PATH = os.path.expanduser("~/Works/devops/dentbird-solutions")
REPORT_DIR = Path(__file__).parent.parent / "reports"

# 환경 변수
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK", "")

# 제외할 발생 빈도
EXCLUDE_FREQUENCIES = ["Random", "Once", "Sometimes"]

def check_env():
    """환경 변수 확인"""
    missing = []
    if not JIRA_EMAIL:
        missing.append("JIRA_EMAIL")
    if not JIRA_API_TOKEN:
        missing.append("JIRA_API_TOKEN")
    if not SLACK_WEBHOOK:
        missing.append("SLACK_WEBHOOK")

    if missing:
        print(f"❌ 환경 변수 누락: {', '.join(missing)}")
        return False

    print("✅ 환경 변수 확인 완료")
    return True


def get_auth_header():
    """Basic 인증 헤더 생성"""
    auth = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
    return f"Basic {auth}"


def fetch_backlog():
    """백로그 티켓 조회 (최신 생성순)"""
    url = f"{JIRA_URL}/rest/agile/1.0/board/{BOARD_ID}/backlog?maxResults=50&fields=key,summary,priority,status,created"

    req = urllib.request.Request(url, headers={
        "Authorization": get_auth_header(),
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            issues = data.get("issues", [])

            # 최신 생성순 정렬 후 상위 15개
            issues.sort(key=lambda x: x["fields"].get("created", ""), reverse=True)
            return issues[:15]
    except urllib.error.HTTPError as e:
        print(f"❌ Jira API 에러: {e.code} - {e.reason}")
        return []
    except Exception as e:
        print(f"❌ 백로그 조회 실패: {e}")
        return []


def fetch_issue_detail(issue_key):
    """티켓 상세 정보 조회"""
    url = f"{JIRA_URL}/rest/api/3/issue/{issue_key}"

    req = urllib.request.Request(url, headers={
        "Authorization": get_auth_header(),
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  ⚠️ {issue_key} 상세 조회 실패: {e}")
        return None


def extract_text_from_adf(adf):
    """ADF(Atlassian Document Format)에서 텍스트 추출"""
    if not adf:
        return ""

    if isinstance(adf, str):
        return adf

    texts = []

    def traverse(node):
        if isinstance(node, dict):
            if node.get("type") == "text":
                texts.append(node.get("text", ""))
            for child in node.get("content", []):
                traverse(child)
        elif isinstance(node, list):
            for item in node:
                traverse(item)

    traverse(adf)
    return " ".join(texts)


def analyze_issue(issue_data):
    """티켓 분석"""
    fields = issue_data.get("fields", {})

    # 기본 정보
    key = issue_data.get("key", "")
    summary = fields.get("summary", "")
    priority = fields.get("priority", {}).get("name", "Unknown")
    created = fields.get("created", "")[:10]  # YYYY-MM-DD만

    # 발생 빈도 (customfield_10091)
    frequency_field = fields.get("customfield_10091", {})
    frequency = frequency_field.get("value", "Unknown") if frequency_field else "Unknown"

    # 기능 영역 (customfield_10095)
    feature_area_field = fields.get("customfield_10095", {})
    feature_area = feature_area_field.get("value", "") if feature_area_field else ""

    # 재현 단계 (customfield_10084)
    repro_steps = extract_text_from_adf(fields.get("customfield_10084"))

    # 상세 설명
    description = extract_text_from_adf(fields.get("description"))

    # 라벨
    labels = fields.get("labels", [])

    return {
        "key": key,
        "summary": summary,
        "priority": priority,
        "created": created,
        "frequency": frequency,
        "feature_area": feature_area,
        "repro_steps": repro_steps,
        "description": description,
        "labels": labels,
        "url": f"{JIRA_URL}/browse/{key}"
    }


def search_codebase(keywords, feature_area):
    """코드베이스에서 키워드 검색"""
    if not os.path.exists(PROJECT_PATH):
        return {"error": "프로젝트 경로 없음", "files": []}

    found_files = []

    # 기능 영역 → 디렉토리 매핑
    area_dirs = {
        "My Designs": ["apps/*/my-designs", "libs/*design*"],
        "Export": ["apps/*/export", "libs/*export*"],
        "Case Viewer": ["apps/*/case-viewer", "libs/*viewer*"],
        "Login / Sign up": ["apps/*/auth", "libs/*auth*"],
    }

    search_dirs = [PROJECT_PATH]
    if feature_area and feature_area in area_dirs:
        # 특정 영역 우선 검색
        pass

    # 키워드로 grep 검색 (간단 구현)
    for keyword in keywords[:3]:  # 상위 3개 키워드만
        try:
            import subprocess
            result = subprocess.run(
                ["grep", "-r", "-l", "--include=*.ts", "--include=*.tsx", keyword, PROJECT_PATH],
                capture_output=True, text=True, timeout=10
            )
            for line in result.stdout.strip().split("\n"):
                if line and line not in found_files:
                    found_files.append(line.replace(PROJECT_PATH + "/", ""))
        except Exception:
            pass

    return {"files": found_files[:5]}  # 상위 5개 파일만


def calculate_score(issue, code_analysis):
    """해결 가능성 점수 계산"""
    score = 0
    reasons = []

    # 코드에서 관련 파일 발견
    if code_analysis.get("files"):
        score += 3
        reasons.append("관련 파일 발견됨")

    # 특정 컴포넌트/기능에 한정
    if issue.get("feature_area"):
        score += 2
        reasons.append(f"기능 영역: {issue['feature_area']}")

    # 재현 단계가 명확함
    if issue.get("repro_steps"):
        score += 2
        reasons.append("재현 단계 존재")

    # 관련 파일이 3개 이하
    if len(code_analysis.get("files", [])) <= 3:
        score += 1
        reasons.append("범위가 좁음")

    # UI 버그
    ui_keywords = ["ui", "스타일", "레이아웃", "표시", "화면", "버튼", "아이콘"]
    if any(kw in issue.get("summary", "").lower() for kw in ui_keywords):
        score += 1
        reasons.append("UI 버그")

    # 난이도 분류
    if score >= 7:
        difficulty = "🟢 쉬움"
    elif score >= 4:
        difficulty = "🟡 보통"
    elif score >= 1:
        difficulty = "🔴 어려움"
    else:
        difficulty = "⚪ 분석 불가"

    return {
        "score": score,
        "difficulty": difficulty,
        "reasons": reasons
    }


def generate_report(analyzed_issues, excluded_issues, today):
    """마크다운 리포트 생성"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORT_DIR / f"backlog-analysis-{today}.md"

    # 난이도별 분류
    easy = [i for i in analyzed_issues if i["analysis"]["score"] >= 7]
    medium = [i for i in analyzed_issues if 4 <= i["analysis"]["score"] < 7]
    hard = [i for i in analyzed_issues if 1 <= i["analysis"]["score"] < 4]
    unknown = [i for i in analyzed_issues if i["analysis"]["score"] == 0]

    # 제외 티켓 분류
    excluded_by_freq = {"Random": [], "Once": [], "Sometimes": []}
    for issue in excluded_issues:
        freq = issue.get("frequency", "Unknown")
        if freq in excluded_by_freq:
            excluded_by_freq[freq].append(issue)

    report = f"""# 백로그 버그 분석 - {today}

## 요약
- 분석 대상: {len(analyzed_issues) + len(excluded_issues)}개 (최신 생성순)
- 해결 가능 (Always): {len(analyzed_issues)}개
- 제외됨: {len(excluded_issues)}개 (Random {len(excluded_by_freq['Random'])}, Once {len(excluded_by_freq['Once'])}, Sometimes {len(excluded_by_freq['Sometimes'])})

## 해결 가능한 버그 (Always)

"""

    def format_issue_section(issues, title):
        if not issues:
            return f"### {title}\n\n없음\n\n"

        section = f"### {title}\n\n"
        for issue in issues:
            files = issue.get("code_analysis", {}).get("files", [])
            files_str = "\n".join([f"  - `{f}`" for f in files[:3]]) if files else "  - 코드베이스 접근 불가"
            reasons = ", ".join(issue["analysis"]["reasons"]) if issue["analysis"]["reasons"] else "분석 정보 부족"

            section += f"""#### [{issue['key']}]({issue['url']}) {issue['summary']}
- **생성일**: {issue['created']}
- **Jira 우선순위**: {issue['priority']}
- **발생 빈도**: {issue['frequency']}
- **예상 수정 파일**:
{files_str}
- **분석 근거**: {reasons}

"""
        return section

    report += format_issue_section(easy, "🟢 쉬움 (1-2시간)")
    report += format_issue_section(medium, "🟡 보통 (반나절)")
    report += format_issue_section(hard, "🔴 어려움 (1일+)")
    if unknown:
        report += format_issue_section(unknown, "⚪ 분석 불가")

    # 제외된 티켓
    report += """## 제외된 티켓

"""

    for freq_name, freq_issues in excluded_by_freq.items():
        desc = {"Random": "간헐적 발생", "Once": "1회성 - 재현 어려움", "Sometimes": "가끔 발생"}
        report += f"### {freq_name} ({desc.get(freq_name, '')})\n\n"
        if freq_issues:
            report += "| 티켓 | 생성일 | 우선순위 | 제목 |\n"
            report += "|------|--------|----------|------|\n"
            for issue in freq_issues:
                report += f"| [{issue['key']}]({issue['url']}) | {issue['created']} | {issue['priority']} | {issue['summary'][:40]}... |\n"
        else:
            report += "없음\n"
        report += "\n"

    # 권장 처리 순서
    report += """## 권장 처리 순서

1. **즉시 처리** - 쉬움 + P1/P2 우선순위
2. **이번 스프린트** - 보통 난이도
3. **다음 스프린트** - 어려움 난이도
4. **추가 분석 필요** - 분석 불가 티켓
"""

    report_path.write_text(report, encoding="utf-8")
    print(f"📄 리포트 생성: {report_path}")

    return {
        "path": str(report_path),
        "easy": easy,
        "medium": medium,
        "hard": hard,
        "excluded": excluded_issues
    }


def send_slack_notification(report_data, today, dry_run=False):
    """Slack 알림 전송"""
    easy = report_data["easy"]
    medium = report_data["medium"]
    hard = report_data["hard"]
    excluded = report_data["excluded"]

    total = len(easy) + len(medium) + len(hard)

    def format_issues(issues, limit=5):
        if not issues:
            return "없음"
        lines = []
        for issue in issues[:limit]:
            files = issue.get("code_analysis", {}).get("files", [])
            file_hint = f"`{files[0].split('/')[-1]}`" if files else ""
            lines.append(f"• <{issue['url']}|{issue['key']}> {issue['summary'][:30]}...")
            if file_hint:
                lines.append(f"  └ {file_hint}")
        return "\n".join(lines)

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"🔍 백로그 버그 분석 - {today}"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*분석 결과*: {total + len(excluded)}개 중 {total}개 해결 가능 (Always)\n⏭️ 제외: {len(excluded)}개"
            }
        },
        {"type": "divider"}
    ]

    if easy:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*🟢 쉬움 ({len(easy)}개)*\n{format_issues(easy)}"
            }
        })

    if medium:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*🟡 보통 ({len(medium)}개)*\n{format_issues(medium)}"
            }
        })

    if hard:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*🔴 어려움 ({len(hard)}개)*\n{format_issues(hard)}"
            }
        })

    blocks.append({
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": f"📄 상세 분석: `reports/backlog-analysis-{today}.md`"
        }]
    })

    payload = json.dumps({"blocks": blocks}).encode("utf-8")

    if dry_run:
        print("\n📤 Slack 메시지 (dry-run, 실제 전송 안함):")
        print(json.dumps({"blocks": blocks}, indent=2, ensure_ascii=False))
        return True

    req = urllib.request.Request(SLACK_WEBHOOK, data=payload, headers={
        "Content-Type": "application/json; charset=utf-8"
    })

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("✅ Slack 알림 전송 완료")
            return True
    except Exception as e:
        print(f"❌ Slack 전송 실패: {e}")
        return False


def main():
    dry_run = "--dry-run" in sys.argv
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"🔍 백로그 버그 분석 시작 - {today}")
    print(f"   모드: {'분석만 (dry-run)' if dry_run else '분석 + Slack 전송'}")
    print()

    # 1. 환경 확인
    if not check_env():
        sys.exit(1)

    # 2. 백로그 조회
    print("\n📋 백로그 조회 중...")
    backlog = fetch_backlog()
    if not backlog:
        print("❌ 백로그가 비어있거나 조회 실패")
        sys.exit(1)
    print(f"   {len(backlog)}개 티켓 조회됨")

    # 3. 티켓 분석
    print("\n🔎 티켓 분석 중...")
    analyzed_issues = []
    excluded_issues = []

    for issue in backlog:
        key = issue.get("key", "")
        print(f"   {key} 분석 중...", end=" ")

        # 상세 정보 조회
        detail = fetch_issue_detail(key)
        if not detail:
            print("⚠️ 상세 조회 실패")
            continue

        # 분석
        analyzed = analyze_issue(detail)

        # 발생 빈도로 필터링
        if analyzed["frequency"] in EXCLUDE_FREQUENCIES:
            print(f"⏭️ 제외 ({analyzed['frequency']})")
            excluded_issues.append(analyzed)
            continue

        # 코드베이스 분석
        keywords = [analyzed["summary"]]
        if analyzed["feature_area"]:
            keywords.append(analyzed["feature_area"])

        code_analysis = search_codebase(keywords, analyzed["feature_area"])
        analyzed["code_analysis"] = code_analysis

        # 점수 계산
        analysis = calculate_score(analyzed, code_analysis)
        analyzed["analysis"] = analysis

        print(f"✅ {analysis['difficulty']}")
        analyzed_issues.append(analyzed)

    # 4. 리포트 생성
    print("\n📝 리포트 생성 중...")
    report_data = generate_report(analyzed_issues, excluded_issues, today)

    # 5. Slack 알림
    print("\n📤 Slack 알림 전송 중...")
    send_slack_notification(report_data, today, dry_run=dry_run)

    print("\n✅ 분석 완료!")


if __name__ == "__main__":
    main()
