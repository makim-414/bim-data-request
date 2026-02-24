/**
 * BIM Data Request - Google Apps Script Backend v2
 * 
 * 설정 방법:
 * 1. script.google.com → 새 프로젝트 생성
 * 2. 이 코드 전체 붙여넣기
 * 3. TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, DRIVE_FOLDER_ID 설정
 * 4. 배포 → 새 배포 → 웹 앱
 *    - 실행 계정: 나(자신)
 *    - 액세스 권한: 모든 사용자 (익명 포함)
 * 5. 배포 URL을 App.tsx의 APPS_SCRIPT_URL에 붙여넣기
 * 
 * 권한: Drive(파일 쓰기), UrlFetch(텔레그램 알림)
 * 
 * v2 개선사항:
 * - JSON + base64 형식으로 파일 수신
 * - 같은 clientCompany + clientName이면 기존 폴더 재사용
 * - 폴더 생성 시 timestamp 제거 (중복 생성 방지)
 * - 명확한 JSON 응답 (status: "ok")
 */

// ============================================================
// 🔧 설정값 (여기만 수정)
// ============================================================
const CONFIG = {
  TELEGRAM_BOT_TOKEN: "7990316006:AAGn8YcfNIBVJ2yNZvICMFSmRt4sX-kFQk8", // OpenClaw 텔레그램 봇 토큰
  TELEGRAM_CHAT_ID:   "-1003743919131",   // 알림 받을 채팅 ID
  DRIVE_FOLDER_ID:    "1sLCGqvyCOHGWjAoq2AvOFG3g9yBGP3kk", // Google Drive 루트 폴더 ID
};
// ============================================================

/**
 * POST 요청 처리 (파일 업로드)
 * JSON 형식으로 파일을 base64로 인코딩하여 수신
 */
function doPost(e) {
  try {
    // JSON 파싱
    const payload = JSON.parse(e.postData.contents);
    const { clientName, clientCompany, sectionName, fileName, mimeType, fileBase64 } = payload;

    if (!clientName || !clientCompany || !fileName || !fileBase64) {
      return jsonResponse({ 
        status: "error", 
        message: "필수 파라미터 누락: clientName, clientCompany, fileName, fileBase64" 
      });
    }

    // Google Drive 루트 폴더 접근
    const rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    // 폴더명: {clientCompany}_{clientName} (timestamp 없음)
    const folderName = `${clientCompany}_${clientName}`;

    // 기존 폴더 찾기 또는 생성
    const folder = findOrCreateFolder(rootFolder, folderName);

    // 섹션별 서브폴더 생성 (선택사항, 현재는 사용하지 않음)
    // const sectionFolder = sectionName ? findOrCreateFolder(folder, sectionName) : folder;

    // Base64 디코딩 후 파일 생성
    const bytes = Utilities.base64Decode(fileBase64);
    const blob = Utilities.newBlob(bytes, mimeType || "application/octet-stream", fileName);
    const file = folder.createFile(blob);

    // 성공 응답
    return jsonResponse({ 
      status: "ok", 
      message: "파일 업로드 성공",
      fileId: file.getId(),
      fileName: fileName,
      folderUrl: folder.getUrl()
    });

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return jsonResponse({ 
      status: "error", 
      message: error.toString() 
    });
  }
}

/**
 * GET 요청 처리 (헬스 체크용)
 */
function doGet(e) {
  return jsonResponse({ 
    status: "ok", 
    service: "BIM Data Request v2",
    timestamp: new Date().toISOString()
  });
}

/**
 * 폴더 찾기 또는 생성
 */
function findOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    // 기존 폴더 반환
    return folders.next();
  } else {
    // 새 폴더 생성
    return parentFolder.createFolder(folderName);
  }
}

/**
 * JSON 응답 헬퍼
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 텔레그램 알림 전송 (선택사항 - 필요시 활성화)
 */
function sendTelegramNotification(clientName, clientCompany, fileName, folderUrl) {
  const message = `📥 *BIM 데이터 수집*\n\n` +
    `👤 담당자: ${escapeMarkdown(clientName)}\n` +
    `🏢 회사: ${escapeMarkdown(clientCompany)}\n` +
    `📄 파일: ${escapeMarkdown(fileName)}\n\n` +
    `🔗 [Drive 폴더 열기](${folderUrl})`;

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  try {
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (err) {
    Logger.log("Telegram notification failed: " + err.toString());
  }
}

/**
 * Markdown 특수문자 이스케이프
 */
function escapeMarkdown(text) {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}
