#!/usr/bin/env python3
"""일일 업무 수집 스크립트 - Jira 이슈 수집"""
import base64
import json
import os
import urllib.request

def fetch_jira_issues():
    email = os.environ.get('JIRA_EMAIL', '')
    token = os.environ.get('JIRA_API_TOKEN', '')

    if not email or not token:
        print(json.dumps({"error": "JIRA_EMAIL 또는 JIRA_API_TOKEN 미설정"}))
        return

    auth = base64.b64encode(f'{email}:{token}'.encode()).decode()
    url = 'https://imagoworks.atlassian.net/rest/api/3/search/jql'
    payload = {
        'jql': 'project = D1 AND assignee = currentUser() AND updated >= startOfDay()',
        'fields': ['key', 'summary', 'status']
    }
    data = json.dumps(payload).encode()

    req = urllib.request.Request(url, data=data, headers={
        'Authorization': f'Basic {auth}',
        'Content-Type': 'application/json'
    })

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read().decode())
        issues = []
        for issue in result.get('issues', []):
            issues.append({
                'key': issue['key'],
                'summary': issue['fields']['summary'],
                'status': issue['fields']['status']['name']
            })
        print(json.dumps(issues, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    fetch_jira_issues()
