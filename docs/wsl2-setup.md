## WSL2 + systemd + Nginx + UFW 구성 가이드

이 문서는 Windows(WSL2)에서 RSVShop을 "외부에서 강제 종료에 강한" 방식으로 운영하기 위한 최소 구성입니다.

- 구성 요약: WSL2 Ubuntu + systemd 서비스(`rsvshop.service`) + Nginx 리버스 프록시(80→4900) + UFW(80/443만 허용)
- 권장 경로: 프로젝트를 WSL 리눅스 파일시스템(예: `/home/rsvshop/rsvshop`)에 두세요. 윈도우 경로(`/mnt/c/...`)는 I/O가 느립니다.

### 1) systemd 활성화
WSL2 Ubuntu에서 아래 스크립트를 실행:

```bash
sudo bash ./scripts/wsl-enable-systemd.sh
```

실행 후 Windows PowerShell에서:

```powershell
wsl --shutdown
```

다시 WSL 터미널을 열고 `systemctl is-system-running` 이 `running` 또는 `degraded` 면 활성화됨.

### 2) 기본 설치 (Nginx/Node/UFW)

```bash
sudo bash ./scripts/wsl-setup.sh
```

- 설치 내용: Nginx, UFW, Node.js 20 LTS, 사용자 `rsvshop` 생성
- UFW: `Nginx Full`만 허용(80/443)

### 3) 프로젝트 배치 및 의존성 설치

```bash
sudo -u rsvshop bash -lc '
  mkdir -p /home/rsvshop && cd /home/rsvshop
  [ -d rsvshop ] || cp -r /mnt/c/codist/rsvshop /home/rsvshop/
  cd /home/rsvshop/rsvshop
  npm ci
'
```

WSL 경로로 복사 후 작업하세요.

### 4) systemd 서비스 설치/시작

```bash
sudo cp scripts/systemd/rsvshop.service /etc/systemd/system/rsvshop.service
sudo systemctl daemon-reload
sudo systemctl enable --now rsvshop
sudo systemctl status rsvshop --no-pager
```

- 기본 포트: 4900 (서비스 환경변수에서 설정)
- 개발 모드: `npm run dev` 실행. 운영 전환 시 `npm run build && npm run start`로 서비스 파일 수정

### 5) Nginx 프록시 설정

```bash
sudo cp scripts/nginx-rsvshop.conf /etc/nginx/sites-available/rsvshop
sudo ln -sf /etc/nginx/sites-available/rsvshop /etc/nginx/sites-enabled/rsvshop
sudo nginx -t && sudo systemctl reload nginx
```

- 외부 접속: http://<Windows-호스트-IP> 또는 http://localhost (브라우저는 Windows에서)

### 6) 방화벽(UFW)

```bash
sudo ufw status verbose
# 필요 시: sudo ufw allow 'Nginx Full'
```

Windows 방화벽도 80/443만 허용 권장.

### 7) 확인/운영

- 서비스 로그: `journalctl -u rsvshop -f`
- 앱 상태: `curl -I http://localhost/`
- 재시작: `sudo systemctl restart rsvshop`

### Kill 방어 관점
- Windows `taskkill`은 WSL 내부 프로세스에 직접 접근 불가 → 외부 터미널에서 Node를 강제 종료하기 어려움
- 서비스는 `Restart=always`로 자동 복구, 프록시는 Nginx가 노출

### 트러블슈팅
- 4900 포트 충돌: `sudo ss -ltnp | grep :4900`
- Nginx 테스트: `sudo nginx -t`
- systemd 에러: `journalctl -u rsvshop --no-pager -n 200`
