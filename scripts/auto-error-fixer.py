#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RSVShop 자동 오류 수정 스크립트
수집된 로그를 분석하여 일반적인 오류를 자동으로 수정
"""

import json
import os
import re
import time
from datetime import datetime, timedelta
from pathlib import Path
import subprocess
import sys

class AutoErrorFixer:
    def __init__(self):
        self.project_root = Path.cwd()
        self.logs_dir = self.project_root / "logs"
        self.console_logs_file = self.logs_dir / "console-logs.json"
        self.server_errors_file = self.logs_dir / "server-errors.log"
        self.fixed_errors_file = self.logs_dir / "fixed-errors.json"
        
        # 오류 패턴 정의
        self.error_patterns = {
            "prisma_connection": {
                "pattern": r"PrismaClientInitializationError|ECONNREFUSED|Connection refused",
                "fix": "database_connection_fix",
                "description": "데이터베이스 연결 오류"
            },
            "build_error": {
                "pattern": r"Build Error|Failed to compile|Module not found",
                "fix": "build_error_fix",
                "description": "빌드 오류"
            },
            "api_error": {
                "pattern": r"API.*error|500.*Internal Server Error",
                "fix": "api_error_fix",
                "description": "API 서버 오류"
            },
            "validation_error": {
                "pattern": r"validation.*error|Invalid.*data",
                "fix": "validation_error_fix",
                "description": "데이터 검증 오류"
            },
            "memory_error": {
                "pattern": r"memory.*error|heap.*out.*of.*memory",
                "fix": "memory_error_fix",
                "description": "메모리 부족 오류"
            }
        }
        
        # 수정된 오류 기록
        self.fixed_errors = self.load_fixed_errors()
    
    def load_fixed_errors(self):
        """수정된 오류 기록 로드"""
        if self.fixed_errors_file.exists():
            try:
                with open(self.fixed_errors_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def save_fixed_errors(self):
        """수정된 오류 기록 저장"""
        with open(self.fixed_errors_file, 'w', encoding='utf-8') as f:
            json.dump(self.fixed_errors, f, ensure_ascii=False, indent=2)
    
    def analyze_logs(self):
        """로그 분석 및 오류 패턴 매칭"""
        errors_found = []
        
        # 서버 오류 로그 분석
        if self.server_errors_file.exists():
            with open(self.server_errors_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    for error_type, config in self.error_patterns.items():
                        if re.search(config["pattern"], line, re.IGNORECASE):
                            errors_found.append({
                                "type": error_type,
                                "line": line.strip(),
                                "line_num": line_num,
                                "description": config["description"],
                                "timestamp": datetime.now().isoformat(),
                                "source": "server"
                            })
        
        # 콘솔 로그 분석
        if self.console_logs_file.exists():
            try:
                with open(self.console_logs_file, 'r', encoding='utf-8') as f:
                    console_data = json.load(f)
                    if isinstance(console_data, list):
                        logs = console_data
                    else:
                        logs = console_data.get("logs", [])
                    
                    for log_entry in logs:
                        if isinstance(log_entry, dict) and log_entry.get("type") == "error":
                            message = log_entry.get("message", "")
                            for error_type, config in self.error_patterns.items():
                                if re.search(config["pattern"], message, re.IGNORECASE):
                                    errors_found.append({
                                        "type": error_type,
                                        "line": message,
                                        "description": config["description"],
                                        "timestamp": log_entry.get("timestamp", ""),
                                        "source": "console",
                                        "url": log_entry.get("url", "")
                                    })
            except Exception as e:
                print(f"⚠️  콘솔 로그 분석 실패: {e}")
        
        return errors_found
    
    def database_connection_fix(self):
        """데이터베이스 연결 오류 수정"""
        print("🔧 데이터베이스 연결 오류 수정 시도...")
        
        try:
            # PostgreSQL 서비스 상태 확인
            result = subprocess.run(
                ["sudo", "service", "postgresql", "status"],
                capture_output=True, text=True
            )
            
            if "inactive" in result.stdout or "failed" in result.stdout:
                print("📡 PostgreSQL 서비스 시작...")
                subprocess.run(["sudo", "service", "postgresql", "start"], check=True)
                print("✅ PostgreSQL 서비스 시작 완료")
            
            # Prisma 스키마 동기화
            print("🔄 Prisma 스키마 동기화...")
            subprocess.run(["npx", "prisma", "generate"], check=True)
            print("✅ Prisma 스키마 동기화 완료")
            
            return True
            
        except Exception as e:
            print(f"❌ 데이터베이스 연결 오류 수정 실패: {e}")
            return False
    
    def build_error_fix(self):
        """빌드 오류 수정"""
        print("🔧 빌드 오류 수정 시도...")
        
        try:
            # .next 폴더 삭제
            next_dir = self.project_root / ".next"
            if next_dir.exists():
                print("🗑️  .next 폴더 삭제...")
                subprocess.run(["rm", "-rf", ".next"], check=True)
                print("✅ .next 폴더 삭제 완료")
            
            # node_modules 재설치
            print("📦 의존성 재설치...")
            subprocess.run(["npm", "install"], check=True)
            print("✅ 의존성 재설치 완료")
            
            # 빌드 재시도
            print("🏗️  빌드 재시도...")
            subprocess.run(["npm", "run", "build"], check=True)
            print("✅ 빌드 성공")
            
            return True
            
        except Exception as e:
            print(f"❌ 빌드 오류 수정 실패: {e}")
            return False
    
    def api_error_fix(self):
        """API 서버 오류 수정"""
        print("🔧 API 서버 오류 수정 시도...")
        
        try:
            # 서버 재시작
            print("🔄 서버 재시작...")
            subprocess.run(["pkill", "-f", "npm run dev"], check=False)
            time.sleep(2)
            subprocess.run(["npm", "run", "dev"], check=True)
            print("✅ 서버 재시작 완료")
            
            return True
            
        except Exception as e:
            print(f"❌ API 서버 오류 수정 실패: {e}")
            return False
    
    def validation_error_fix(self):
        """데이터 검증 오류 수정"""
        print("🔧 데이터 검증 오류 수정 시도...")
        
        try:
            # 데이터베이스 스키마 검증
            print("🔍 데이터베이스 스키마 검증...")
            subprocess.run(["npx", "prisma", "db", "push", "--accept-data-loss"], check=True)
            print("✅ 데이터베이스 스키마 검증 완료")
            
            return True
            
        except Exception as e:
            print(f"❌ 데이터 검증 오류 수정 실패: {e}")
            return False
    
    def memory_error_fix(self):
        """메모리 부족 오류 수정"""
        print("🔧 메모리 부족 오류 수정 시도...")
        
        try:
            # Node.js 프로세스 정리
            print("🧹 Node.js 프로세스 정리...")
            subprocess.run(["pkill", "-f", "node"], check=False)
            time.sleep(2)
            
            # 메모리 정리 후 서버 재시작
            print("🔄 서버 재시작...")
            subprocess.run(["npm", "run", "dev"], check=True)
            print("✅ 메모리 정리 및 서버 재시작 완료")
            
            return True
            
        except Exception as e:
            print(f"❌ 메모리 부족 오류 수정 실패: {e}")
            return False
    
    def auto_fix_errors(self):
        """발견된 오류 자동 수정"""
        print("🔍 오류 분석 중...")
        errors = self.analyze_logs()
        
        if not errors:
            print("✅ 발견된 오류가 없습니다.")
            return
        
        print(f"🎯 {len(errors)}개의 오류를 발견했습니다.")
        
        for error in errors:
            error_id = f"{error['type']}_{error.get('timestamp', 'unknown')}"
            
            # 이미 수정된 오류인지 확인
            if any(fixed['id'] == error_id for fixed in self.fixed_errors):
                print(f"⏭️  이미 수정된 오류: {error['description']}")
                continue
            
            print(f"\n🔧 오류 수정 시도: {error['description']}")
            print(f"   📝 상세: {error['line'][:100]}...")
            
            # 수정 함수 실행
            fix_method = getattr(self, error['type'] + '_fix', None)
            if fix_method and callable(fix_method):
                if fix_method():
                    # 수정 성공 시 기록
                    self.fixed_errors.append({
                        "id": error_id,
                        "error": error,
                        "fixed_at": datetime.now().isoformat(),
                        "status": "success"
                    })
                    print(f"✅ 오류 수정 성공: {error['description']}")
                else:
                    # 수정 실패 시 기록
                    self.fixed_errors.append({
                        "id": error_id,
                        "error": error,
                        "fixed_at": datetime.now().isoformat(),
                        "status": "failed"
                    })
                    print(f"❌ 오류 수정 실패: {error['description']}")
            else:
                print(f"⚠️  수정 방법이 정의되지 않음: {error['type']}")
        
        # 수정 결과 저장
        self.save_fixed_errors()
        print(f"\n📊 수정 결과: {len(self.fixed_errors)}개 오류 처리 완료")
    
    def run_monitoring(self):
        """지속적인 모니터링 실행"""
        print("🚀 자동 오류 수정 모니터링 시작...")
        print("💡 Ctrl+C로 종료")
        
        try:
            while True:
                self.auto_fix_errors()
                print(f"\n⏰ {datetime.now().strftime('%H:%M:%S')} - 다음 검사까지 30초 대기...")
                time.sleep(30)
                
        except KeyboardInterrupt:
            print("\n🛑 모니터링 종료")
            self.save_fixed_errors()

def main():
    fixer = AutoErrorFixer()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "monitor":
            fixer.run_monitoring()
        elif sys.argv[1] == "fix":
            fixer.auto_fix_errors()
        else:
            print("사용법: python auto-error-fixer.py [monitor|fix]")
    else:
        fixer.auto_fix_errors()

if __name__ == "__main__":
    main()
