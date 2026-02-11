#!/bin/bash
# 크론잡 공통 유틸리티

# 네트워크 연결 확인 (단일 체크)
check_network() {
  curl -sf --max-time 5 -o /dev/null "https://dns.google/resolve?name=google.com" 2>/dev/null
}
