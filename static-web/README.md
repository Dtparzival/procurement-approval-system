# AI 採購簽呈生成系統 - 靜態網頁版

這是 AI 採購簽呈生成系統的靜態網頁版本，可以直接部署到 AWS S3、GitHub Pages 或任何靜態網站託管服務。

## 特色

- ✅ **純前端實作** - 無需後端伺服器，所有功能在瀏覽器中執行
- ✅ **直接呼叫 LLM API** - 使用 OpenAI 相容的 API（Manus Forge API）
- ✅ **本地儲存** - 使用瀏覽器 localStorage 儲存草稿和歷史記錄
- ✅ **響應式設計** - 完美支援桌面版和手機版
- ✅ **零依賴部署** - 使用 CDN 載入所有外部資源

## 功能特點

### 核心功能

1. **AI 智能生成** - 使用自然語言描述採購需求，AI 自動生成專業的簽呈公文
2. **文件上傳支援** - 支援上傳圖片文件，AI 自動提取關鍵資訊
3. **線上編輯** - 生成後可直接線上編輯修改簽呈內容
4. **草稿自動儲存** - 每 30 秒自動儲存草稿，避免資料遺失
5. **歷史記錄管理** - 完整的草稿和已完成簽呈管理功能

### 技術特點

- **純 HTML/CSS/JavaScript** - 無需編譯或建置步驟
- **CDN 資源載入** - Tailwind CSS、Lucide Icons、Marked.js
- **模組化設計** - 清晰的程式碼結構，易於維護和擴展
- **本地優先** - 所有資料儲存在瀏覽器本地，保護隱私

## 檔案結構

```
static-web/
├── index.html          # 主頁面
├── css/
│   └── style.css      # 自訂樣式
├── js/
│   ├── config.js      # 配置檔案
│   ├── storage.js     # 本地儲存管理
│   ├── api.js         # API 呼叫模組
│   ├── ui.js          # UI 管理模組
│   └── app.js         # 主應用程式邏輯
└── assets/            # 靜態資源（圖片等）
```

## 部署指南

### 部署到 AWS S3

1. **建立 S3 Bucket**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

2. **設定靜態網站託管**
   ```bash
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document index.html
   ```

3. **設定 Bucket 政策（公開讀取）**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

4. **上傳檔案**
   ```bash
   aws s3 sync . s3://your-bucket-name \
     --exclude ".git/*" \
     --exclude "*.md" \
     --cache-control "max-age=3600"
   ```

5. **設定 CORS（如果需要）**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### 部署到 GitHub Pages

1. **建立 GitHub Repository**
2. **推送程式碼**
   ```bash
   git add .
   git commit -m "Deploy static web version"
   git push origin DEV
   ```
3. **在 Repository Settings 中啟用 GitHub Pages**
4. **選擇 DEV 分支和 /static-web 目錄**

### 部署到 Netlify

1. **連接 GitHub Repository**
2. **設定建置設定**
   - Build command: (留空)
   - Publish directory: `static-web`
3. **部署**

### 部署到 Vercel

1. **連接 GitHub Repository**
2. **設定專案**
   - Framework Preset: Other
   - Root Directory: `static-web`
3. **部署**

## 使用說明

### 首次使用

1. **設定 API Key**
   - 點擊右上角的設定按鈕（齒輪圖示）
   - 輸入您的 OpenAI API Key 或 Manus Forge API Key
   - 選擇 AI 模型（推薦使用 GPT-4.1 Mini）
   - 點擊「儲存設定」

2. **生成簽呈**
   - 在「草稿標題」欄位輸入標題（選填）
   - 在「採購需求描述」欄位詳細描述採購需求
   - （可選）上傳參考文件
   - 點擊「生成簽呈」按鈕

3. **編輯和複製**
   - 生成後可點擊「編輯」按鈕修改內容
   - 點擊「複製」按鈕將簽呈複製到剪貼簿

### 草稿管理

- **自動儲存**：系統每 30 秒自動儲存草稿
- **手動儲存**：點擊「儲存草稿」按鈕
- **載入草稿**：在「最近草稿」區域點擊「載入」按鈕
- **刪除草稿**：點擊草稿卡片上的垃圾桶圖示

### 歷史記錄

- 點擊右上角的「歷史記錄」按鈕查看所有已生成的簽呈
- 可以查看、複製或刪除歷史記錄

## API 配置

### 使用 Manus Forge API

```javascript
API 端點: https://api.manus.im/v1
支援模型:
- gpt-4.1-mini (推薦)
- gpt-4.1-nano (快速)
- gemini-2.5-flash
```

### 使用原生 OpenAI API

如需使用原生 OpenAI API，請修改 `js/config.js` 中的 `API.BASE_URL`：

```javascript
API: {
    BASE_URL: 'https://api.openai.com/v1',
    // ...
}
```

## 瀏覽器相容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 安全性考量

1. **API Key 安全**
   - API Key 儲存在瀏覽器 localStorage
   - 不會上傳到任何伺服器
   - 建議使用有限額度的 API Key

2. **資料隱私**
   - 所有草稿和歷史記錄儲存在本地
   - 不會傳送到第三方伺服器（除了 LLM API）

3. **HTTPS**
   - 建議使用 HTTPS 部署
   - 保護 API Key 傳輸安全

## 限制

1. **檔案處理**
   - 目前僅支援圖片文件的 AI 識別
   - PDF 和 Word 文件需要額外的處理邏輯

2. **儲存空間**
   - localStorage 有大小限制（通常 5-10MB）
   - 建議定期清理歷史記錄

3. **跨裝置同步**
   - 資料儲存在本地，無法跨裝置同步
   - 可以考慮實作匯出/匯入功能

## 開發指南

### 本地測試

使用任何靜態檔案伺服器：

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

然後訪問 `http://localhost:8000`

### 自訂配置

編輯 `js/config.js` 來自訂：
- API 端點
- 模型選項
- 自動儲存間隔
- UI 設定

### 擴展功能

模組化設計讓您可以輕鬆擴展功能：
- `storage.js` - 新增儲存邏輯
- `api.js` - 新增 API 呼叫
- `ui.js` - 新增 UI 元件
- `app.js` - 新增應用程式邏輯

## 授權

MIT License - 詳見 LICENSE 檔案

## 支援

如有問題或建議，請開啟 GitHub Issue。
