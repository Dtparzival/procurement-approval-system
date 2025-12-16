# API 資料流程完整分析

## 概述

本文件詳細說明 `feature/generate-document-api` 分支中，從使用者在畫面點擊「生成簽呈」按鈕，到最終在畫面顯示生成結果的完整資料流程。

---

## 核心程式檔案

整個資料流程涉及以下核心程式檔案：

1. **index.html** - 使用者介面定義
2. **js/app.js** - 應用程式主邏輯控制器
3. **js/api.js** - API 呼叫封裝模組
4. **js/ui.js** - UI 顯示與互動管理
5. **js/config.js** - 系統配置與 API 端點定義
6. **js/storage.js** - 本地儲存管理

---

## 完整資料流程

### 階段一：使用者觸發（UI Layer）

**檔案：index.html (Line 296-299)**

```html
<button id="generateBtn" class="w-full bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 btn-primary-enhanced">
    <i data-lucide="sparkles" class="w-5 h-5"></i>
    生成簽呈
</button>
```

使用者在畫面上點擊「生成簽呈」按鈕，觸發整個流程。

---

### 階段二：事件綁定與處理（App Controller）

**檔案：js/app.js (Line 46-50)**

在應用程式初始化時，`ProcurementApp` 類別會綁定按鈕的點擊事件：

```javascript
bindEvents() {
    // 生成按鈕
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => this.handleGenerate());
    }
    // ... 其他事件綁定
}
```

當按鈕被點擊時，會呼叫 `handleGenerate()` 方法。

---

### 階段三：生成處理邏輯（App Controller）

**檔案：js/app.js (Line 180-219)**

`handleGenerate()` 方法負責協調整個生成流程：

```javascript
async handleGenerate() {
    const userInput = document.getElementById('userInput')?.value.trim();
    
    if (!userInput) {
        UI.showToast('請輸入採購需求描述', 'error');
        return;
    }

    try {
        // 1. 顯示載入狀態
        UI.showLoading('正在分析您的需求...');
        
        setTimeout(() => UI.showLoading('正在組織簽呈內容...'), 2000);
        setTimeout(() => UI.showLoading('正在優化公文格式...'), 4000);

        // 2. 呼叫 API 生成簽呈
        const result = await API.generateApproval(userInput, this.uploadedFiles);

        // 3. 儲存到歷史記錄
        const historyItem = Storage.saveHistory({
            title: result.title,
            content: result.content,
            userInput: userInput,
            attachments: this.uploadedFiles
        });

        // 4. 顯示結果
        UI.showApproval(historyItem);
        UI.showToast('簽呈生成成功！', 'success');

        // 5. 清除草稿 ID
        this.currentDraftId = null;
        Storage.setCurrentDraftId(null);

    } catch (error) {
        console.error('Generate error:', error);
        UI.hideLoading();
        UI.showToast(error.message || '生成失敗，請稍後再試', 'error');
    }
}
```

**流程重點：**
1. 驗證使用者輸入
2. 顯示載入動畫（提升使用者體驗）
3. 呼叫 API 模組進行生成
4. 儲存結果到本地歷史記錄
5. 顯示生成結果
6. 錯誤處理與使用者提示

---

### 階段四：API 呼叫封裝（API Module）

**檔案：js/api.js (Line 133-236)**

`API.generateApproval()` 方法負責實際的 API 呼叫：

```javascript
async generateApproval(userInput, attachments = []) {
    console.log('Generating approval document:', {
        inputLength: userInput.length,
        attachmentsCount: attachments.length
    });

    // 1. 獲取草稿標題
    const draftTitle = document.getElementById('draftTitle')?.value.trim() || '';
    
    // 2. 組合 inputText：草稿標題 + 需求描述
    let inputText = '';
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

    // 3. 生成 sessionId
    const sessionId = this.generateUUID();

    try {
        // 4. 從配置中讀取 API URL
        const apiUrl = CONFIG.API.GENERATE_ENDPOINT;
        
        console.log('Calling external API:', {
            url: apiUrl,
            sessionId: sessionId,
            inputTextLength: inputText.length
        });

        // 5. 發送 POST 請求到 AWS API Gateway
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputText: inputText,
                sessionId: sessionId
            })
        });

        console.log('API Response status:', response.status);

        // 6. 錯誤處理
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            throw new Error(`API 請求失敗 (HTTP ${response.status})`);
        }

        // 7. 解析響應資料
        const data = await response.json();
        console.log('API Response received:', data);

        // 8. 解析多層 JSON 響應
        // response.body 是一個 JSON 字符串
        if (!data.body) {
            throw new Error('API 回應格式錯誤：缺少 body');
        }

        const bodyData = JSON.parse(data.body);
        console.log('Parsed body data:', bodyData);

        if (!bodyData.response || !bodyData.response.body) {
            throw new Error('API 回應格式錯誤：缺少 response.body');
        }

        const responseBody = JSON.parse(bodyData.response.body);
        console.log('Parsed response body:', responseBody);

        const draftText = responseBody.draft_text;
        
        if (!draftText || draftText.trim().length === 0) {
            throw new Error('生成的內容為空，請再試一次');
        }
        
        console.log('Approval generated successfully:', {
            contentLength: draftText.length
        });
        
        // 9. 提取標題（從草稿文本中尋找【主旨】）
        const titleMatch = draftText.match(/【主旨】[\s\S]*?\n\n([^\n]+)/);
        const title = titleMatch ? titleMatch[1].trim() : (draftTitle || '採購簽呈');

        // 10. 返回結果
        return {
            title: title,
            content: draftText,
            sessionId: sessionId
        };
    } catch (error) {
        console.error('Generate approval error:', error);
        
        // 網路錯誤處理
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('網路連線失敗，請檢查網路連線後再試');
        }
        
        throw error;
    }
}
```

**API 端點配置：**

**檔案：js/config.js (Line 18-20)**

```javascript
// 生成簽呈 API 端點
// AWS API Gateway endpoint for document generation
GENERATE_ENDPOINT: 'https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat'
```

**Request 格式：**

```json
{
    "inputText": "標題：{草稿標題}\n\n需求描述：\n{使用者輸入}\n\n參考文件：\n- {檔案名稱}",
    "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

**Response 格式（多層 JSON）：**

```json
{
    "body": "{\"response\":{\"body\":\"{\\\"draft_text\\\":\\\"...\\\"}\"}}",
    "statusCode": 200
}
```

**解析步驟：**
1. 第一層：`JSON.parse(data.body)` → 取得 `bodyData`
2. 第二層：`JSON.parse(bodyData.response.body)` → 取得 `responseBody`
3. 第三層：提取 `responseBody.draft_text` → 取得生成的簽呈內容

---

### 階段五：載入狀態顯示（UI Module）

**檔案：js/ui.js (Line 320-332)**

在 API 呼叫期間，UI 模組負責顯示載入動畫：

```javascript
showLoading(message) {
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const generatedContent = document.getElementById('generatedContent');
    const loadingText = document.getElementById('loadingText');
    
    emptyState.classList.add('hidden');
    generatedContent.classList.add('hidden');
    loadingState.classList.remove('hidden');
    loadingText.textContent = message;
    
    lucide.createIcons();
}
```

載入訊息會依序顯示：
1. "正在分析您的需求..."
2. "正在組織簽呈內容..." (2秒後)
3. "正在優化公文格式..." (4秒後)

---

### 階段六：結果儲存（Storage Module）

**檔案：js/storage.js**

API 返回結果後，會透過 `Storage.saveHistory()` 儲存到瀏覽器的 localStorage：

```javascript
Storage.saveHistory({
    title: result.title,
    content: result.content,
    userInput: userInput,
    attachments: this.uploadedFiles
});
```

儲存的資料結構包含：
- `id`: 唯一識別碼
- `title`: 簽呈標題
- `content`: 完整簽呈內容（Markdown 格式）
- `userInput`: 原始使用者輸入
- `attachments`: 附件清單
- `createdAt`: 建立時間戳記

---

### 階段七：結果顯示（UI Module）

**檔案：js/ui.js (Line 292-313)**

最後，UI 模組負責將生成結果渲染到畫面上：

```javascript
showApproval(approval) {
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const generatedContent = document.getElementById('generatedContent');
    const resultActions = document.getElementById('resultActions');
    
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    generatedContent.classList.remove('hidden');
    resultActions.classList.remove('hidden');
    
    // 渲染 Markdown
    generatedContent.innerHTML = marked.parse(approval.content);
    
    // 儲存當前簽呈資料
    this.currentApproval = approval;
    
    // 滾動到結果區域（行動裝置）
    if (window.innerWidth < 1024) {
        generatedContent.scrollIntoView({ behavior: 'smooth' });
    }
}
```

**顯示位置：**

**檔案：index.html (Line 345)**

```html
<div id="generatedContent" class="hidden prose prose-sm max-w-none"></div>
```

**渲染處理：**
- 使用 `marked.js` 函式庫將 Markdown 格式的簽呈內容轉換為 HTML
- 套用 `prose` 樣式類別（Tailwind Typography）進行美化排版
- 在行動裝置上自動滾動到結果區域

---

## 資料流程圖

```
[使用者點擊「生成簽呈」按鈕]
         ↓
[index.html - generateBtn]
         ↓
[app.js - handleGenerate()]
         ↓
    ┌────────────────────────┐
    │ 1. 驗證使用者輸入      │
    │ 2. 顯示載入動畫        │
    └────────────────────────┘
         ↓
[ui.js - showLoading()]
         ↓
[app.js 呼叫 API.generateApproval()]
         ↓
[api.js - generateApproval()]
         ↓
    ┌────────────────────────────────┐
    │ 1. 組合 inputText              │
    │ 2. 生成 sessionId (UUID)       │
    │ 3. 讀取 API URL (config.js)    │
    │ 4. 發送 POST 請求              │
    └────────────────────────────────┘
         ↓
[AWS API Gateway]
https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat
         ↓
    ┌────────────────────────────────┐
    │ Request Body:                  │
    │ {                              │
    │   "inputText": "...",          │
    │   "sessionId": "uuid"          │
    │ }                              │
    └────────────────────────────────┘
         ↓
[後端 Lambda 處理]
         ↓
    ┌────────────────────────────────┐
    │ Response (多層 JSON):          │
    │ {                              │
    │   "body": "{...}",             │
    │   "statusCode": 200            │
    │ }                              │
    └────────────────────────────────┘
         ↓
[api.js 解析響應]
         ↓
    ┌────────────────────────────────┐
    │ 1. JSON.parse(data.body)       │
    │ 2. JSON.parse(response.body)   │
    │ 3. 提取 draft_text             │
    │ 4. 提取標題                    │
    └────────────────────────────────┘
         ↓
[返回結果到 app.js]
         ↓
    ┌────────────────────────────────┐
    │ {                              │
    │   title: "...",                │
    │   content: "...",              │
    │   sessionId: "uuid"            │
    │ }                              │
    └────────────────────────────────┘
         ↓
[storage.js - saveHistory()]
         ↓
[儲存到 localStorage]
         ↓
[ui.js - showApproval()]
         ↓
    ┌────────────────────────────────┐
    │ 1. 隱藏載入動畫                │
    │ 2. 使用 marked.js 渲染 MD      │
    │ 3. 顯示生成內容                │
    │ 4. 顯示操作按鈕                │
    └────────────────────────────────┘
         ↓
[index.html - generatedContent]
         ↓
[使用者看到生成的簽呈]
```

---

## 關鍵技術細節

### 1. UUID 生成

**檔案：js/api.js (Line 122-128)**

```javascript
generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

每次 API 呼叫都會生成唯一的 sessionId，用於追蹤和識別請求。

### 2. 多層 JSON 解析

API 響應採用三層 JSON 嵌套結構：

```javascript
// 第一層解析
const bodyData = JSON.parse(data.body);

// 第二層解析
const responseBody = JSON.parse(bodyData.response.body);

// 第三層提取
const draftText = responseBody.draft_text;
```

這種設計可能是因為 AWS Lambda 與 API Gateway 的整合架構所致。

### 3. 錯誤處理機制

程式碼實作了完整的錯誤處理鏈：

**API 層級（api.js）：**
- HTTP 狀態碼檢查
- 響應格式驗證
- 網路錯誤捕捉
- 空內容檢查

**應用層級（app.js）：**
- 使用者輸入驗證
- Try-Catch 錯誤捕捉
- 錯誤訊息顯示

**UI 層級（ui.js）：**
- Toast 通知
- 載入狀態管理

### 4. 使用者體驗優化

**漸進式載入訊息：**
```javascript
UI.showLoading('正在分析您的需求...');
setTimeout(() => UI.showLoading('正在組織簽呈內容...'), 2000);
setTimeout(() => UI.showLoading('正在優化公文格式...'), 4000);
```

透過定時更換載入訊息，讓使用者感受到系統正在積極處理，提升等待體驗。

**自動滾動（行動裝置）：**
```javascript
if (window.innerWidth < 1024) {
    generatedContent.scrollIntoView({ behavior: 'smooth' });
}
```

在小螢幕裝置上自動滾動到結果區域，確保使用者能立即看到生成內容。

---

## 總結

整個資料流程涉及 **6 個主要程式檔案**，經過 **7 個階段** 的處理：

1. **index.html** - 提供使用者介面與互動元素
2. **js/app.js** - 協調整體流程，處理業務邏輯
3. **js/api.js** - 封裝 API 呼叫，處理請求與響應
4. **js/config.js** - 提供 API 端點配置
5. **js/storage.js** - 管理本地資料儲存
6. **js/ui.js** - 處理所有 UI 顯示與互動

整個架構採用 **模組化設計**，職責分離清晰，易於維護和擴展。API 呼叫採用 **async/await** 模式，配合完整的錯誤處理機制，確保系統穩定性。UI 設計注重使用者體驗，透過載入動畫、Toast 通知、自動滾動等細節提升互動品質。
