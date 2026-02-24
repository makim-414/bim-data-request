# 🚀 BIM 데이터 수집 폼 배포 가이드

## 개요
이 문서는 BIM 데이터 수집 폼의 안정성 개선 배포 가이드입니다.

## ✅ 완료된 개선 사항

### React 폼 (src/App.tsx)
1. ✅ **localStorage 자동저장** - 입력 중 5초마다 자동 저장
2. ✅ **오류 발생 시 복구 버튼** - 이전 데이터 복구 기능
3. ✅ **파일 업로드 Sequential** - 병렬 → 순차 업로드로 변경
4. ✅ **진행률 표시** - X/Y 파일 업로드 중... 표시
5. ✅ **재시도 로직** - 실패 시 3회까지 자동 재시도
6. ✅ **성공 후 폼 유지** - 업로드 성공 시 "새로운 제출하기" 버튼

### Apps Script v2 (upload-handler-v2.gs)
1. ✅ **JSON + base64 방식** - multipart 대신 JSON 형식
2. ✅ **폴더 재사용** - 같은 clientCompany + clientName이면 기존 폴더 재사용
3. ✅ **Timestamp 제거** - 폴더명에서 timestamp 제거 (중복 생성 방지)
4. ✅ **명확한 응답** - status: "ok" 형식의 JSON 응답

## 📋 배포 순서

### 1. GitHub Push ✅
```bash
cd /Users/makim/projects/bim-data-request
git add -A
git commit -m "feat: 폼 안정성 개선"
git push origin main
```
**상태**: 완료 (2026-02-24 12:27)

### 2. Vercel 자동 배포 확인
Vercel은 GitHub Push 시 자동으로 배포됩니다.

**확인 방법**:
1. https://vercel.com/makim-414 접속
2. `bim-data-request` 프로젝트 클릭
3. Deployments 탭에서 최신 배포 상태 확인
4. ✅ 배포 성공 시 → Production URL 클릭하여 테스트

### 3. Apps Script v2 재배포 ⚠️ **필수**

Apps Script는 코드 변경 시 **수동 재배포**가 필요합니다.

**재배포 방법**:

1. **Apps Script 에디터 열기**
   ```
   https://script.google.com/home
   ```

2. **기존 프로젝트 열기**
   - "BIM Data Request" 프로젝트 찾기

3. **코드 교체**
   - 기존 Code.gs 내용 삭제
   - `google-apps-script/upload-handler-v2.gs` 내용 복사
   - 붙여넣기

4. **설정 확인**
   ```javascript
   const CONFIG = {
     TELEGRAM_BOT_TOKEN: "7990316006:AAGn8YcfNIBVJ2yNZvICMFSmRt4sX-kFQk8",
     TELEGRAM_CHAT_ID:   "-1003743919131",
     DRIVE_FOLDER_ID:    "1sLCGqvyCOHGWjAoq2AvOFG3g9yBGP3kk",
   };
   ```

5. **재배포**
   - 상단 메뉴: 배포 → 배포 관리
   - 기존 배포 옆 ✏️ 아이콘 클릭
   - "버전" → "새 버전"
   - 설명: "v2 - 폴더 재사용 + JSON 방식"
   - **배포** 클릭

6. **배포 URL 확인**
   - 배포 완료 후 URL 확인
   - 현재 URL: `https://script.google.com/macros/s/AKfycby0tLtVBhwigAzixF_v3ZmQ0Vwt3ewNg48jL_P2MKGKTIbTkzDwEUmW2KHbCnf6uuj3MQ/exec`
   - URL이 변경되었다면 `src/App.tsx`의 `APPS_SCRIPT_URL` 업데이트 필요

### 4. QA 테스트

**테스트 시나리오**:

1. **자동저장 테스트**
   - 담당자 이름 입력
   - 5초 대기
   - 페이지 새로고침
   - "이전에 작성하던 데이터가 있습니다" 메시지 확인
   - "복구하기" 버튼 클릭 → 데이터 복구 확인

2. **파일 업로드 테스트**
   - 파일 3~5개 첨부
   - "데이터 전송" 클릭
   - 진행률 표시 확인 (1/5, 2/5, ...)
   - "제출 완료" 메시지 확인

3. **폴더 재사용 테스트**
   - Google Drive에서 `주식회사 미리디_조지은` 폴더 확인
   - 다시 "조지은" 이름으로 파일 제출
   - 같은 폴더에 파일 추가되는지 확인 (새 폴더 생성 안 됨)

4. **재시도 로직 테스트** (선택)
   - 네트워크를 일시적으로 차단
   - 파일 업로드 시도
   - 3회 재시도 후 에러 메시지 확인

### 5. 조지은님께 안내

**메시지 템플릿**:

```
안녕하세요 조지은님,

BIM 데이터 수집 폼의 안정성 개선이 완료되었습니다! 🎉

개선 사항:
✅ 입력 중 자동저장 (5초마다)
✅ 오류 발생 시 이전 데이터 복구 가능
✅ 파일 업로드 진행률 표시
✅ 업로드 실패 시 자동 재시도 (3회)
✅ 폴더 중복 생성 문제 해결

이제 안심하고 사용하실 수 있습니다!
혹시 문제가 있으면 바로 알려주세요.

폼 URL: [Vercel Production URL]
```

## 🐛 트러블슈팅

### Vercel 배포 실패 시
1. Vercel 대시보드에서 에러 로그 확인
2. 빌드 에러인 경우:
   ```bash
   npm install
   npm run build
   ```
3. 로컬에서 에러 확인 후 수정

### Apps Script 오류 시
1. Apps Script 에디터 → 실행 → `doGet` 테스트
2. 로그 확인: 보기 → 로그
3. 권한 오류 시: 재인증 필요

### 파일 업로드 실패 시
1. 브라우저 개발자 도구 (F12) → Console 탭
2. Network 탭에서 POST 요청 확인
3. Response에서 에러 메시지 확인

## 📝 체크리스트

배포 전:
- [x] React 폼 수정 완료
- [x] Apps Script v2 작성 완료
- [x] GitHub Push 완료
- [ ] Vercel 배포 확인
- [ ] Apps Script 재배포
- [ ] QA 테스트 완료
- [ ] 조지은님께 안내

## 📞 문의
문제 발생 시 Mark 3 그룹 또는 Telegram으로 연락주세요!
