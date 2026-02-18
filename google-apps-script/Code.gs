/**
 * BIM Data Request - Google Apps Script Backend
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
 */

// ============================================================
// 🔧 설정값 (여기만 수정)
// ============================================================
const CONFIG = {
  TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN_HERE", // OpenClaw 텔레그램 봇 토큰
  TELEGRAM_CHAT_ID:   "YOUR_CHAT_ID_HERE",   // 알림 받을 채팅 ID (Mark 3 그룹 등)
  DRIVE_FOLDER_ID:    "YOUR_FOLDER_ID_HERE", // Google Drive 폴더 ID
  //  Drive URL에서 /folders/XXXX 부분이 ID
};
// ============================================================

/**
 * POST 요청 처리 (파일 업로드)
 */
function doPost(e) {
  try {
    const submitter = e.parameter.submitter || "이름 없음";
    const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    // Google Drive 폴더 접근
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    // 서브폴더 생성 (제출자명_날짜)
    const subFolderName = `${submitter}_${Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd_HHmm")}`;
    const subFolder = folder.createFolder(subFolderName);

    // 업로드된 파일 처리
    const uploadedFiles = [];
    const params = e.parameters;

    // 파일 파라미터 찾기 (section별로 여러 파일)
    for (const key in params) {
      if (key.startsWith("file_")) {
        // 파일 데이터는 e.postData로 multipart 처리
        // → 아래 parseMultipartForm 사용
      }
    }

    // Multipart 파일 처리
    const contentType = e.postData.type;
    if (contentType && contentType.includes("multipart/form-data")) {
      const boundary = contentType.split("boundary=")[1];
      const parsed = parseMultipartForm(e.postData.contents, boundary);

      parsed.files.forEach(fileData => {
        if (fileData.filename && fileData.bytes && fileData.bytes.length > 0) {
          const blob = Utilities.newBlob(fileData.bytes, fileData.mimeType || "application/octet-stream", fileData.filename);
          subFolder.createFile(blob);
          uploadedFiles.push(fileData.filename);
        }
      });

      // 제출자 정보 텍스트 파일 저장
      const infoText = `제출 시각: ${timestamp}\n제출자: ${submitter}\n업로드 파일 수: ${uploadedFiles.length}\n\n파일 목록:\n${uploadedFiles.join("\n")}`;
      subFolder.createFile(Utilities.newBlob(infoText, "text/plain", "제출정보.txt"));
    }

    // 텔레그램 알림
    sendTelegramNotification(submitter, timestamp, uploadedFiles, subFolder.getUrl());

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, fileCount: uploadedFiles.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 처리 (헬스 체크용)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", service: "BIM Data Request" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 텔레그램 알림 전송
 */
function sendTelegramNotification(submitter, timestamp, files, folderUrl) {
  const fileList = files.length > 0
    ? files.slice(0, 10).map(f => `  • ${f}`).join("\n") + (files.length > 10 ? `\n  ...외 ${files.length - 10}개` : "")
    : "  (파일 없음)";

  const message = `📥 *BIM 데이터 수집 - 새 제출*\n\n` +
    `👤 제출자: ${escapeMarkdown(submitter)}\n` +
    `🕐 시각: ${timestamp}\n` +
    `📁 파일: ${files.length}개\n\n` +
    `${fileList}\n\n` +
    `🔗 [Drive 폴더 열기](${folderUrl})`;

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

/**
 * Markdown 특수문자 이스케이프
 */
function escapeMarkdown(text) {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Multipart form-data 파싱
 */
function parseMultipartForm(rawData, boundary) {
  const result = { fields: {}, files: [] };
  if (!rawData || !boundary) return result;

  const bytes = typeof rawData === "string"
    ? Utilities.newBlob(rawData).getBytes()
    : rawData;

  const boundaryBytes = Utilities.newBlob("--" + boundary).getBytes();
  const parts = splitBytes(bytes, boundaryBytes);

  parts.forEach(part => {
    if (part.length === 0) return;

    // 헤더와 바디 분리 (CRLF CRLF)
    const separatorIdx = findSequence(part, [13, 10, 13, 10]);
    if (separatorIdx === -1) return;

    const headerBytes = part.slice(0, separatorIdx);
    const bodyBytes = part.slice(separatorIdx + 4);

    const headerStr = Utilities.newBlob(headerBytes).getDataAsString();
    const cdMatch = headerStr.match(/Content-Disposition:.*name="([^"]+)"(?:.*filename="([^"]+)")?/i);

    if (!cdMatch) return;

    const fieldName = cdMatch[1];
    const fileName = cdMatch[2];

    // 끝의 CRLF 제거
    const body = bodyBytes.slice(0, bodyBytes.length - 2);

    if (fileName) {
      const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
      result.files.push({
        field: fieldName,
        filename: fileName,
        mimeType: ctMatch ? ctMatch[1].trim() : "application/octet-stream",
        bytes: body,
      });
    } else {
      result.fields[fieldName] = Utilities.newBlob(body).getDataAsString();
    }
  });

  return result;
}

function findSequence(arr, seq) {
  outer: for (let i = 0; i <= arr.length - seq.length; i++) {
    for (let j = 0; j < seq.length; j++) {
      if (arr[i + j] !== seq[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function splitBytes(arr, sep) {
  const parts = [];
  let start = 0;
  let idx;
  while ((idx = findSequenceFrom(arr, sep, start)) !== -1) {
    parts.push(arr.slice(start, idx));
    start = idx + sep.length;
  }
  parts.push(arr.slice(start));
  return parts;
}

function findSequenceFrom(arr, seq, fromIdx) {
  outer: for (let i = fromIdx; i <= arr.length - seq.length; i++) {
    for (let j = 0; j < seq.length; j++) {
      if (arr[i + j] !== seq[j]) continue outer;
    }
    return i;
  }
  return -1;
}
