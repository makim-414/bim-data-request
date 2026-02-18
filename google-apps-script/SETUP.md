# BIM 앱 백엔드 설정 가이드 (Google Apps Script)

## 1단계: Google Drive 폴더 생성

1. drive.google.com 접속
2. 새 폴더 생성: "BIM 데이터 수집" (또는 원하는 이름)
3. 폴더 URL에서 ID 복사:
   `https://drive.google.com/drive/folders/**FOLDER_ID_HERE**`

## 2단계: Apps Script 프로젝트 생성

1. [script.google.com](https://script.google.com) 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름: "BIM Data Request"
4. `Code.gs` 파일의 전체 내용 붙여넣기 (기존 내용 전부 교체)

## 3단계: 설정값 입력

`Code.gs` 상단 `CONFIG` 객체 수정:

```js
const CONFIG = {
  TELEGRAM_BOT_TOKEN: "7xxxxxxxxx:AAF...",   // OpenClaw 봇 토큰
  TELEGRAM_CHAT_ID:   "-1003743919131",       // Mark 3 그룹 ID (또는 개인 chat ID)
  DRIVE_FOLDER_ID:    "1ABC...XYZ",           // 1단계에서 복사한 ID
};
```

> **텔레그램 봇 토큰**: OpenClaw config에서 확인 가능 (`openclaw config.get`)
> **Chat ID**: Mark 3 그룹 ID는 `-1003743919131`

## 4단계: 웹 앱 배포

1. **배포** 버튼 → **새 배포**
2. 유형: **웹 앱** 선택
3. 설명: "BIM Data Request v1"
4. 실행 계정: **나(자신)**
5. 액세스 권한: **모든 사용자 (익명 포함)**
6. **배포** 클릭
7. 권한 승인 → Google 계정 로그인 → 허용
8. **배포 URL 복사** (형태: `https://script.google.com/macros/s/AKfycb.../exec`)

## 5단계: App.tsx URL 업데이트

```
/Users/makim/.openclaw/workspace/projects/bim-data-request/src/App.tsx
```

`APPS_SCRIPT_URL_PLACEHOLDER`를 복사한 URL로 교체:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec"
```

그 후:
```bash
cd /Users/makim/.openclaw/workspace/projects/bim-data-request
git add -A && git commit -m "feat: add Google Apps Script backend URL"
git push origin main
# → Vercel 자동 배포 됨
```

## 확인

1. https://bim-data-request.vercel.app 접속
2. 담당자명 입력, 파일 1개 업로드
3. "데이터 전송" 클릭
4. Drive 폴더에 파일 생성 확인
5. 텔레그램 알림 수신 확인

---

**작성**: 2026-02-19 02:44 KST  
**담당**: OpenClaw
