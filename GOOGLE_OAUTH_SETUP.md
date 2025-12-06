# Google OAuth 設定指南

本文件說明如何設定 Google OAuth 2.0 認證功能。

## 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊「選取專案」→「新增專案」
3. 輸入專案名稱（例如：「Procurement Approval System」）
4. 點擊「建立」

## 步驟 2：啟用 Google Identity Services

1. 在 Google Cloud Console 中，選擇您剛建立的專案
2. 前往「API 和服務」→「程式庫」
3. 搜尋「Google Identity Services」
4. 點擊「啟用」

## 步驟 3：設定 OAuth 同意畫面

1. 前往「API 和服務」→「OAuth 同意畫面」
2. 選擇「外部」（如果是公開應用程式）
3. 填寫必要資訊：
   - **應用程式名稱**：AI 智能公文簽核系統
   - **使用者支援電子郵件**：您的電子郵件
   - **應用程式首頁**：您的網站網址
   - **授權網域**：您的網域（例如：example.com）
   - **開發人員聯絡資訊**：您的電子郵件
4. 點擊「儲存並繼續」
5. 在「範圍」頁面，點擊「新增或移除範圍」
6. 選擇以下範圍：
   - `openid`
   - `email`
   - `profile`
7. 點擊「更新」→「儲存並繼續」
8. 在「測試使用者」頁面，新增測試用戶的電子郵件（開發階段）
9. 點擊「儲存並繼續」

## 步驟 4：建立 OAuth 2.0 用戶端 ID

1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 用戶端 ID」
3. 選擇應用程式類型：「網頁應用程式」
4. 填寫資訊：
   - **名稱**：Web Client
   - **已授權的 JavaScript 來源**：
     - `http://localhost:8000`（本地測試）
     - `http://localhost:8001`（本地測試）
     - `https://yourdomain.com`（正式環境）
   - **已授權的重新導向 URI**：
     - `http://localhost:8000`
     - `http://localhost:8001`
     - `https://yourdomain.com`
5. 點擊「建立」
6. **重要**：複製「用戶端 ID」（格式類似：`123456789-abc123.apps.googleusercontent.com`）

## 步驟 5：更新應用程式配置

### 方法 1：直接修改 HTML 檔案

開啟 `index.html`，找到以下程式碼：

```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

將 `YOUR_GOOGLE_CLIENT_ID` 替換為您的實際 Client ID：

```html
<div id="g_id_onload"
     data-client_id="123456789-abc123.apps.googleusercontent.com"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

### 方法 2：使用環境變數（推薦用於正式環境）

開啟 `js/auth.js`，找到以下程式碼：

```javascript
GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

替換為您的實際 Client ID：

```javascript
GOOGLE_CLIENT_ID: '123456789-abc123.apps.googleusercontent.com',
```

## 步驟 6：測試登入功能

1. 啟動本地伺服器：
   ```bash
   python3 -m http.server 8000
   ```

2. 開啟瀏覽器訪問：`http://localhost:8000`

3. 點擊「登入」按鈕

4. 選擇 Google 帳號登入

5. 授權應用程式存取您的基本資料

6. 登入成功後，您應該會看到：
   - 用戶頭像顯示在右上角
   - 可以使用所有功能

## 常見問題

### Q1: 登入時出現「Error 400: redirect_uri_mismatch」

**解決方法**：
1. 檢查 Google Cloud Console 中的「已授權的 JavaScript 來源」和「已授權的重新導向 URI」
2. 確保包含您當前使用的網址（包括 protocol 和 port）
3. 等待幾分鐘讓設定生效

### Q2: 登入時出現「Access blocked: This app's request is invalid」

**解決方法**：
1. 確認 OAuth 同意畫面已正確設定
2. 檢查範圍是否包含 `openid`、`email`、`profile`
3. 如果是測試階段，確認您的帳號已加入測試使用者列表

### Q3: 如何在正式環境部署？

**步驟**：
1. 在 Google Cloud Console 中新增正式環境的網址到「已授權的 JavaScript 來源」
2. 更新 `index.html` 中的 Client ID
3. 將應用程式部署到正式環境（AWS S3、GitHub Pages 等）
4. 測試登入功能
5. 如果一切正常，可以在 OAuth 同意畫面中申請「發布」（移除測試模式）

### Q4: 如何處理用戶資料？

本應用程式使用 localStorage 儲存用戶資料：
- 用戶資訊（ID、名稱、Email、頭像）
- API Key（按用戶隔離）
- 草稿和歷史記錄（按用戶隔離）

**資料安全**：
- 所有資料僅儲存在用戶的瀏覽器中
- 不會上傳到任何伺服器
- 用戶可以隨時登出並清除資料

### Q5: 如何支援多個網域？

在 Google Cloud Console 的「已授權的 JavaScript 來源」中新增多個網址：
```
http://localhost:8000
http://localhost:8001
https://dev.yourdomain.com
https://yourdomain.com
https://www.yourdomain.com
```

## 安全性建議

1. **不要公開分享 Client ID**：雖然 Client ID 不是秘密，但建議不要在公開的 Git 儲存庫中直接包含

2. **使用環境變數**：在正式環境中，建議使用環境變數或配置檔案管理 Client ID

3. **定期審查授權**：定期檢查 Google Cloud Console 中的授權設定

4. **限制授權範圍**：只請求必要的權限（openid、email、profile）

5. **HTTPS**：正式環境務必使用 HTTPS

## 進階配置

### 自訂登入按鈕樣式

修改 `index.html` 中的 Google Sign-In 按鈕配置：

```html
<div class="g_id_signin"
     data-type="standard"
     data-size="large"
     data-theme="outline"
     data-text="sign_in_with"
     data-shape="rectangular"
     data-logo_alignment="left"
     data-width="320">
</div>
```

可用選項：
- **data-type**: `standard` | `icon`
- **data-size**: `large` | `medium` | `small`
- **data-theme**: `outline` | `filled_blue` | `filled_black`
- **data-text**: `sign_in_with` | `signup_with` | `continue_with` | `signin`
- **data-shape**: `rectangular` | `pill` | `circle` | `square`

### 自動登入

如果希望用戶自動登入（如果已登入過），修改：

```html
<div id="g_id_onload"
     data-client_id="YOUR_CLIENT_ID"
     data-callback="handleCredentialResponse"
     data-auto_prompt="true">
</div>
```

將 `data-auto_prompt` 設為 `true`。

## 詳細程式碼實作

如需完整的程式碼範例和實作說明，請參考：
- **[GOOGLE_OAUTH_IMPLEMENTATION.md](GOOGLE_OAUTH_IMPLEMENTATION.md)** - 詳細的程式碼片段和逐步解釋

該文件包含：
- 完整的 `auth.js` 認證模組實作
- JWT Token 解析方法
- 多用戶儲存管理
- UI 整合範例
- 完整的登入/登出流程
- 錯誤處理和最佳實踐
- 測試檢查清單

## 參考資源

- [Google Identity Services 文件](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 說明](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [詳細程式碼實作指南](GOOGLE_OAUTH_IMPLEMENTATION.md)

## 支援

如有問題，請：
1. 檢查 Google Cloud Console 的設定
2. 查看瀏覽器 Console 的錯誤訊息
3. 參考 Google Identity Services 官方文件
