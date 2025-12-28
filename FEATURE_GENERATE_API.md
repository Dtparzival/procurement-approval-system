# 生成簽呈 API 整合開發說明

## 功能概述

本次開發將「生成簽呈」功能整合外部 AWS API Gateway，實現以下功能：

1. 點擊「生成簽呈」按鈕時，將草稿標題和需求描述組合成 `inputText`
2. 生成 UUID 作為 `sessionId`
3. 調用外部 API：`https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat`
4. 解析多層 JSON 響應，提取 `draft_text`
5. 在生成結果頁面顯示簽呈內容

## 技術實現

### 1. API 請求格式

```json
{
  "inputText": "標題：軟體維護合約續簽\n\n需求描述：\n需要續簽「Data Stage ETL 工具...」",
  "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

### 2. API 響應格式

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json; charset=utf-8"
  },
  "body": "{\"response\": {\"statusCode\": 200, \"body\": \"{\\\"draft_text\\\": \\\"簽呈內容...\\\"}\"}}"
}
```

**注意**：`body` 是一個 JSON 字符串，需要多次解析：
1. 第一次解析：`JSON.parse(data.body)` → 得到 `bodyData`
2. 第二次解析：`JSON.parse(bodyData.response.body)` → 得到 `responseBody`
3. 提取內容：`responseBody.draft_text`

### 3. CORS 配置

**✅ AWS API Gateway CORS 已配置完成**

前端代碼直接調用 AWS API Gateway，無需代理服務器。

CORS 配置項：
- `Access-Control-Allow-Origin`: `*`
- `Access-Control-Allow-Methods`: `POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type`
- `Gateway responses`: Default 4XX, Default 5XX

### 4. 修改的文件

#### `js/api.js`
- 添加 `generateUUID()` 方法生成 session ID
- 修改 `generateApproval()` 方法：
  - 獲取草稿標題
  - 組合 `inputText`
  - 調用代理 API
  - 解析多層 JSON 響應
  - 提取 `draft_text`

#### `js/app.js`
- 修改 `handleGenerate()` 方法：
  - 移除 API Key 檢查（新 API 不需要）
  - 保持載入狀態和錯誤處理邏輯

#### `proxy_server.py`（新增）
- HTTP 服務器，處理 CORS 問題
- 轉發請求到 AWS API Gateway
- 添加 CORS 頭部

## 測試結果

### 測試場景

**輸入**：
- 草稿標題：軟體維護合約續簽
- 需求描述：需要續簽「Data Stage ETL 工具、加密安全及分析資料自動化導入機制」軟體維護承攬契約，現有合約將於114年05月31日屆滿。為確保資料倉儲系統之持續穩定運作及資料安全，擬續簽新合約。

**輸出**：
生成完整的簽呈文件，包含：
- 【主旨】
- 【內文】
- 【建議附件】
- 【審核流程】

### 測試狀態

| 測試項目 | 狀態 | 說明 |
|---------|------|------|
| API 連接 | ✅ 通過 | 成功連接到 AWS API Gateway |
| 請求格式 | ✅ 通過 | inputText 和 sessionId 正確組合 |
| 響應解析 | ✅ 通過 | 多層 JSON 正確解析 |
| 內容顯示 | ✅ 通過 | draft_text 正確顯示在頁面上 |
| CORS 處理 | ✅ 通過 | 代理服務器成功解決 CORS 問題 |

## 部署說明

### 開發環境

1. 啟動代理服務器：
```bash
cd /home/ubuntu/procurement-approval-system
python3.11 proxy_server.py &
```

2. 啟動 HTTP 服務器：
```bash
python3.11 -m http.server 8080 &
```

3. 訪問應用：
```
http://localhost:8080
```

### 生產環境

**✅ CORS 已配置完成**

AWS API Gateway 的 CORS 已經配置完成，前端可以直接調用 API。

API URL 已配置在 `js/config.js` 中：
```javascript
// config.js
API: {
    GENERATE_ENDPOINT: 'https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat'
}
```

`js/api.js` 從配置中讀取 URL：
```javascript
const apiUrl = CONFIG.API.GENERATE_ENDPOINT;
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
```

## 注意事項

1. **API URL 配置**：✅ API URL 已配置在 `js/config.js` 中，便於管理和修改
2. **CORS 配置**：✅ AWS API Gateway CORS 已配置完成，前端可直接調用
3. **錯誤處理**：已添加網路錯誤和 API 錯誤處理，但可能需要更詳細的錯誤訊息
4. **超時處理**：當前沒有設置請求超時，建議添加 timeout 配置

## 後續優化建議

1. **✅ 配置化 API URL**：已完成 - API URL 已移到 `config.js` 中
2. **添加請求超時**：設置 30-60 秒的超時時間
3. **添加重試機制**：API 失敗時自動重試 2-3 次
4. **改進錯誤提示**：根據不同錯誤類型顯示更友好的提示
5. **添加載入進度**：顯示 API 調用的實際進度
6. **緩存機制**：相同輸入可以緩存結果，避免重複調用

## 開發分支

- 分支名稱：`feature/generate-document-api`
- 基於分支：`DEV`
- 狀態：開發完成，待測試和合併

## 相關文件

- API 配置：`js/config.js`
- API 整合邏輯：`js/api.js`
- 應用主邏輯：`js/app.js`
- 專案說明：`README.md`
