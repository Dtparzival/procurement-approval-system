# Request/Response 資料驗證與轉換深度分析

## 概述

本文件將深入探討 `feature/generate-document-api` 分支中，從前端發送請求 (Request) 到接收並處理響應 (Response) 的過程中，資料如何進行**驗證 (Validation)** 與 **轉換 (Transformation)**。此分析基於前一份報告的基礎，旨在提供更精細的技術細節。

---

## 請求 (Request) 階段的資料驗證與轉換

在向後端 API 發送請求之前，前端應用程式會執行多層次的資料驗證與轉換，以確保請求的正確性與完整性。

### 1. 使用者輸入驗證 (前端應用層)

**位置**: `js/app.js` - `handleGenerate()` 方法

在觸發 API 呼叫前，系統會先進行最基本的輸入驗證。

```javascript
const userInput = document.getElementById(\'userInput\')?.value.trim();

if (!userInput) {
    UI.showToast(\'請輸入採購需求描述\', \'error\');
    return;
}
```

- **轉換**: 使用 `.trim()` 方法移除使用者輸入文字的前後空白，避免傳送無意義的空字串。
- **驗證**: 檢查 `userInput` 是否為空。如果為空，則中斷流程並透過 `UI.showToast()` 向使用者顯示錯誤提示，不會發起 API 請求。

### 2. 附件檔案驗證 (前端應用層)

**位置**: `js/app.js` - `handleFileUpload()` 方法

當使用者上傳附件時，系統會進行檔案大小的驗證。

```javascript
const file = files[0];
const maxSize = 10 * 1024 * 1024; // 10MB

if (file.size > maxSize) {
    UI.showToast(\'檔案大小不能超過 10MB\', \'error\');
    return;
}
```

- **驗證**: 檢查檔案大小是否超過 10MB。此處的驗證邏輯雖然存在，但 `api.js` 中的 `validateFile` 方法提供了更全面的檔案類型與副檔名驗證，而在目前的 `handleFileUpload` 流程中並未直接呼叫 `validateFile`，這是一個可改進之處。

### 3. 請求資料組裝與轉換 (API 模組層)

**位置**: `js/api.js` - `generateApproval()` 方法

在發送 `fetch` 請求前，資料會被精心組裝成 API 所需的格式。

```javascript
// 獲取草稿標題
const draftTitle = document.getElementById(\'draftTitle\')?.value.trim() || \'\';

// 組合 inputText
let inputText = \'\';
if (draftTitle) {
    inputText = `標題：${draftTitle}\n\n`;
}
inputText += `需求描述：\n${userInput}`;

if (attachments.length > 0) {
    inputText += `\n\n參考文件：\n`;
    attachments.forEach(att => {
        inputText += `- ${att.fileName}\n`;
    });
}

// ...

const sessionId = this.generateUUID();

// ...

body: JSON.stringify({
    inputText: inputText,
    sessionId: sessionId
})
```

- **資料轉換與組裝**: 此階段是核心的轉換過程。
    1.  **結構化轉換**: 將來自不同 DOM 元素（草稿標題、需求描述）和記憶體變數（附件列表）的零散資訊，組裝成一個結構化的 `inputText` 字串。這個字串使用換行符 `\n` 和特定前綴（如「標題：」、「需求描述：」）來區分不同部分的內容，使其具備一定的格式。
    2.  **附件資訊轉換**: `this.uploadedFiles` 是一個包含完整檔案資訊的物件陣列，但在這裡被轉換為只包含 `fileName` 的簡單列表字串，降低了傳輸的資料量。
    3.  **Session ID 生成**: 呼叫 `this.generateUUID()` 產生一個唯一的識別碼，用於追蹤該次請求。
    4.  **JSON 序列化**: 最後，將組裝好的 `inputText` 和 `sessionId` 放入一個 JavaScript 物件中，並使用 `JSON.stringify()` 將其序列化為 JSON 格式的字串，作為 `fetch` 請求的 `body`。

---

## 響應 (Response) 階段的資料驗證與轉換

在收到後端 API 的響應後，前端會進行嚴格的驗證與多層次的解析，以從複雜的響應結構中提取出有用的資訊。

### 1. HTTP 狀態驗證

**位置**: `js/api.js` - `generateApproval()` 方法

這是第一道防線，檢查 HTTP 響應是否成功。

```javascript
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(\'API Error Response:\', errorData);
    throw new Error(`API 請求失敗 (HTTP ${response.status})`);
}
```

- **驗證**: `response.ok` 屬性會檢查 HTTP 狀態碼是否在 200-299 的範圍內。如果不在，代表請求失敗（如 4xx 或 5xx 錯誤），程式會立即拋出一個包含狀態碼的錯誤，中斷後續的解析流程。

### 2. 多層 JSON 解析與驗證

**位置**: `js/api.js` - `generateApproval()` 方法

由於 API 響應是一個三層嵌套的 JSON 結構，程式採用了逐步解析和驗證的方式。

```javascript
// 第一層解析與驗證
const data = await response.json();
if (!data.body) {
    throw new Error(\'API 回應格式錯誤：缺少 body\');
}

// 第二層解析與驗證
const bodyData = JSON.parse(data.body);
if (!bodyData.response || !bodyData.response.body) {
    throw new Error(\'API 回應格式錯誤：缺少 response.body\');
}

// 第三層解析與驗證
const responseBody = JSON.parse(bodyData.response.body);
const draftText = responseBody.draft_text;
if (!draftText || draftText.trim().length === 0) {
    throw new Error(\'生成的內容為空，請再試一次\');
}
```

- **轉換與驗證流程**: 
    1.  **第一次轉換**: `response.json()` 將最外層的 HTTP Response Body 從 JSON 字串轉換為 JavaScript 物件 `data`。隨後**驗證** `data.body` 是否存在。
    2.  **第二次轉換**: `JSON.parse(data.body)` 將 `data.body`（本身是一個 JSON 字串）轉換為第二層物件 `bodyData`。隨後**驗證** `bodyData.response.body` 是否存在。
    3.  **第三次轉換**: `JSON.parse(bodyData.response.body)` 將 `bodyData.response.body`（同樣是 JSON 字串）轉換為最終的 `responseBody` 物件。隨後**驗證** `responseBody.draft_text` 是否存在且內容不為空。

這個過程展示了一個非常健壯的解析模式：**每次解析後都立即進行驗證**，確保在進入下一步之前，資料結構符合預期，從而有效防止了因格式錯誤導致的執行階段錯誤。

### 3. 內容提取與最終轉換

**位置**: `js/api.js` - `generateApproval()` 方法

從解析後的資料中提取標題，並組裝成最終的回傳物件。

```javascript
// 提取標題
const titleMatch = draftText.match(/【主旨】[\s\S]*?\n\n([^\n]+)/);
const title = titleMatch ? titleMatch[1].trim() : (draftTitle || \'採購簽呈\');

// 返回結果
return {
    title: title,
    content: draftText,
    sessionId: sessionId
};
```

- **資料轉換**: 
    1.  **正則表達式提取**: 使用正則表達式 `draftText.match(...)` 從返回的公文內容 `draftText` 中，智能提取「主旨」後的第一行作為簽呈標題。這是一個典型的**非結構化資料到結構化資料的轉換**。
    2.  **備用標題 (Fallback)**: 如果正則表達式匹配失敗 (`titleMatch` 為 null)，則使用使用者輸入的 `draftTitle` 或預設的「採購簽呈」作為標題，確保 `title` 欄位永遠有值。
    3.  **物件組裝**: 最後，將提取出的 `title`、原始的 `content` (`draftText`) 和 `sessionId` 組裝成一個乾淨、結構化的物件，返回給上層的 `app.js` 使用。

### 4. 顯示層的 Markdown 轉換

**位置**: `js/ui.js` - `showApproval()` 方法

在最終顯示結果時，還進行了一次重要的格式轉換。

```javascript
generatedContent.innerHTML = marked.parse(approval.content);
```

- **轉換**: `marked.parse()` 方法將從 API 獲取的 Markdown 格式的簽呈內容 `approval.content` 轉換為 HTML，使其能夠在瀏覽器中被正確渲染出標題、列表、粗體等樣式。

---

## 總結

整個 Request/Response 流程中的資料驗證與轉換機制設計得相當周全，體現了防禦性程式設計的思想。下表總結了各個階段的關鍵操作：

| 階段 | 核心檔案 | 驗證 (Validation) | 轉換 (Transformation) |
| :--- | :--- | :--- | :--- |
| **請求前** | `js/app.js` | 檢查使用者輸入是否為空 | `.trim()` 移除前後空白 |
| | `js/app.js` | 檢查上傳檔案大小 | `FileReader` 將檔案轉為 Base64 (雖然此分支未使用) |
| **請求組裝** | `js/api.js` | - | 將零散資料組裝成結構化的 `inputText` 字串；`JSON.stringify()` 序列化 |
| **響應後** | `js/api.js` | 檢查 HTTP `response.ok` 狀態 | `response.json()` 解析第一層 JSON |
| | `js/api.js` | 逐層檢查 `body`, `response.body`, `draft_text` 是否存在且不為空 | `JSON.parse()` 逐層解析嵌套的 JSON 字串 |
| | `js/api.js` | - | 使用正則表達式從內文中提取標題；組裝成最終回傳物件 |
| **顯示時** | `js/ui.js` | - | 使用 `marked.js` 將 Markdown 轉換為 HTML |

總體而言，該流程透過在**前端進行預驗證**、**請求時進行資料聚合與格式化**、**響應後進行多層次解析與驗證**，以及**最終顯示時的格式轉換**，確保了資料流的穩定性與正確性，並提供了良好的錯誤處理能力。
