# AI 採購簽呈生成系統 - 靜態網頁版 (DEV 分支)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Branch: DEV](https://img.shields.io/badge/Branch-DEV-blue.svg)](https://github.com/Dtparzival/procurement-approval-system/tree/DEV)

> **注意**: 這是靜態網頁版本，與 main 分支的全端應用程式版本在架構上有顯著差異。

## 版本說明

本專案包含兩個版本：

| 版本 | 分支 | 說明 | 適用場景 |
|------|------|------|----------|
| **全端版** | main | React + Express + MySQL，需要伺服器 | 企業內部部署、需要資料庫和使用者管理 |
| **靜態版** | DEV | 純 HTML/CSS/JS，可部署到 S3 | 個人使用、快速部署、低成本運營 |

**當前分支**: DEV (靜態網頁版)

## 專案概述

這是 AI 採購簽呈生成系統的靜態網頁版本，完全使用前端技術實作，無需後端伺服器。所有資料儲存在瀏覽器本地，直接從前端呼叫 LLM API 進行簽呈生成。

### 與 main 分支的主要差異

| 功能 | main 分支 (全端版) | DEV 分支 (靜態版) |
|------|-------------------|------------------|
| **前端框架** | React 19 + TypeScript | 純 HTML/CSS/JavaScript |
| **後端** | Express + tRPC | 無 (純前端) |
| **資料庫** | MySQL/TiDB + Drizzle ORM | localStorage (瀏覽器本地) |
| **認證系統** | Manus OAuth | 簡化為 API Key 管理 |
| **API 呼叫** | 後端代理 | 前端直接呼叫 |
| **檔案儲存** | S3 | Base64 編碼 (本地) |
| **部署方式** | 需要 Node.js 伺服器 | 任何靜態託管服務 |
| **建置需求** | 需要編譯 | 無需編譯 |
| **維護成本** | 需要伺服器維護 | 零維護 |
| **運營成本** | 伺服器 + 資料庫費用 | 靜態託管費用 (~$0.36/月) |

## 核心特色

### 技術特點

- ✅ **零依賴部署** - 所有外部資源使用 CDN 載入
- ✅ **無需編譯** - 直接使用 HTML/CSS/JavaScript
- ✅ **模組化設計** - 清晰的程式碼結構
- ✅ **本地優先** - 資料儲存在瀏覽器，保護隱私
- ✅ **響應式設計** - 完美支援桌面和行動裝置

### 功能特點

- 🤖 **AI 智能生成** - 使用自然語言描述需求，AI 自動生成專業簽呈
- 📄 **文件上傳支援** - 支援上傳圖片，AI 自動提取關鍵資訊
- ✏️ **線上編輯** - 生成後可直接編輯修改
- 💾 **自動儲存** - 每 30 秒自動儲存草稿
- 📋 **歷史記錄** - 完整的草稿和已完成簽呈管理
- 📱 **跨平台** - 支援桌面版和手機版

## 快速開始

### 方法 1: 直接開啟 (最簡單)

1. 下載 `static-web` 目錄
2. 使用瀏覽器開啟 `index.html`
3. 在設定中輸入 API Key
4. 開始使用

### 方法 2: 本地伺服器 (推薦)

```bash
# 克隆專案並切換到 DEV 分支
git clone https://github.com/Dtparzival/procurement-approval-system.git
cd procurement-approval-system
git checkout DEV

# 進入靜態網頁目錄
cd static-web

# 啟動本地伺服器 (選擇其中一種)
python3 -m http.server 8000
# 或
npx serve .
# 或
php -S localhost:8000

# 開啟瀏覽器訪問
# http://localhost:8000
```

### 方法 3: 部署到雲端

請參考 [部署指南](#部署指南) 章節。

## 檔案結構

```
procurement-approval-system/  (DEV 分支)
├── static-web/                    # 靜態網頁版本 (本版本)
│   ├── index.html                # 主頁面
│   ├── css/
│   │   └── style.css            # 自訂樣式
│   ├── js/
│   │   ├── config.js            # 配置檔案
│   │   ├── storage.js           # localStorage 管理
│   │   ├── api.js               # API 呼叫模組
│   │   ├── ui.js                # UI 管理模組
│   │   └── app.js               # 主應用程式邏輯
│   ├── assets/                  # 靜態資源
│   ├── deploy-to-s3.sh          # AWS S3 部署腳本
│   ├── README.md                # 靜態版詳細說明
│   └── DEPLOYMENT_SUMMARY.md    # 部署總結文件
├── client/                       # (原始全端版的前端，本分支不使用)
├── server/                       # (原始全端版的後端，本分支不使用)
├── README_DEV.md                 # 本文件 (DEV 分支說明)
└── README.md                     # 原始專案說明 (main 分支)
```

**重要**: DEV 分支的核心程式碼位於 `static-web/` 目錄，其他目錄為原始全端版本的程式碼，在本分支中不使用。

## 使用說明

### 首次設定

首次使用需要設定 API Key：

1. **開啟網站**
2. **點擊右上角的設定按鈕**（齒輪圖示）
3. **輸入 API Key**
   - 可使用 OpenAI API Key
   - 或使用 Manus Forge API Key（推薦）
4. **選擇 AI 模型**
   - `gpt-4.1-mini` - 推薦，平衡效能和成本
   - `gpt-4.1-nano` - 最快速，成本最低
   - `gemini-2.5-flash` - Google 模型
5. **設定自動儲存**（預設啟用）
6. **點擊「儲存設定」**

### 生成簽呈

生成專業採購簽呈的步驟：

1. **輸入草稿標題**（選填）
   - 例如：「辦公室設備採購簽呈」
   
2. **描述採購需求**（必填）
   - 詳細說明採購項目、規格、數量、預算等
   - 範例：
     ```
     需要採購 10 台筆記型電腦供業務部門使用，規格需求如下：
     - 處理器：Intel Core i7 或以上
     - 記憶體：16GB RAM
     - 儲存空間：512GB SSD
     - 預算：每台約 NT$ 35,000
     - 使用目的：提升業務人員外出作業效率
     ```

3. **上傳參考文件**（選填）
   - 支援圖片格式（JPG、PNG、GIF、WebP）
   - AI 會自動識別文件內容並提取關鍵資訊
   - 最大檔案大小：10MB

4. **點擊「生成簽呈」按鈕**
   - AI 會分析需求並生成專業簽呈
   - 生成時間約 10-30 秒

5. **查看結果**
   - 簽呈會顯示在右側預覽區域
   - 包含標題、主旨、說明、辦法、擬辦等完整內容

### 編輯簽呈

生成後可以進行編輯：

1. **點擊「編輯」按鈕**
2. **在編輯器中修改內容**
3. **點擊「儲存」保存修改**
4. **或點擊「取消」放棄修改**

### 複製簽呈

將簽呈複製到其他應用程式：

1. **點擊「複製」按鈕**
2. **簽呈內容會複製到剪貼簿**
3. **可以貼到 Word、Email 等應用程式**

### 草稿管理

系統提供完整的草稿管理功能：

#### 自動儲存
- 系統每 30 秒自動儲存草稿
- 避免因瀏覽器關閉而遺失資料
- 可在設定中關閉自動儲存

#### 手動儲存
- 點擊「儲存草稿」按鈕
- 立即儲存當前輸入

#### 載入草稿
- 在「最近草稿」區域查看最近 6 個草稿
- 點擊「載入」按鈕載入草稿內容
- 會自動填入標題、需求描述和附件

#### 刪除草稿
- 點擊草稿卡片上的垃圾桶圖示
- 確認後刪除草稿

### 歷史記錄

查看和管理已生成的簽呈：

1. **點擊右上角「歷史記錄」按鈕**
2. **瀏覽所有已生成的簽呈**
3. **可以執行以下操作**：
   - **查看** - 在預覽區域顯示簽呈
   - **複製** - 複製簽呈內容到剪貼簿
   - **刪除** - 移除歷史記錄

## 部署指南

靜態網頁版本可以部署到多種平台，以下是詳細步驟。

### 部署到 AWS S3 (推薦)

AWS S3 提供穩定、低成本的靜態網站託管服務。

#### 前置需求
- AWS 帳號
- AWS CLI 已安裝並設定

#### 部署步驟

```bash
# 1. 進入靜態網頁目錄
cd static-web

# 2. 執行部署腳本
./deploy-to-s3.sh your-bucket-name

# 3. 腳本會自動完成以下操作：
#    - 建立 S3 Bucket (如果不存在)
#    - 設定靜態網站託管
#    - 設定 Bucket 政策 (公開讀取)
#    - 上傳所有檔案
#    - 設定 CORS

# 4. 部署完成後會顯示網站 URL
```

#### 設定 HTTPS (選用)

使用 CloudFront 為 S3 網站設定 HTTPS：

1. 在 AWS Console 開啟 CloudFront
2. 建立新的 Distribution
3. Origin Domain 選擇您的 S3 Bucket
4. 設定 SSL Certificate
5. 部署完成後使用 CloudFront URL

#### 成本估算

假設月訪問量 10,000 次：
- S3 儲存：~$0.00002/月
- GET 請求：~$0.004/月
- 資料傳輸：~$0.36/月 (5GB)
- **總計：約 $0.36/月**

### 部署到 GitHub Pages

GitHub Pages 提供完全免費的靜態網站託管。

#### 部署步驟

1. **在 GitHub Repository Settings 中啟用 Pages**
   - 前往 Settings > Pages
   
2. **設定來源**
   - Branch: DEV
   - Folder: /static-web
   
3. **儲存設定**
   - GitHub 會自動部署
   - 幾分鐘後網站就會上線

4. **訪問網站**
   - URL: `https://your-username.github.io/procurement-approval-system/`

#### 自訂網域 (選用)

1. 在 DNS 設定中新增 CNAME 記錄
2. 在 GitHub Pages 設定中輸入自訂網域
3. 啟用 HTTPS

### 部署到 Netlify

Netlify 提供優秀的免費方案和自動部署功能。

#### 部署步驟

1. **登入 Netlify**
   - 前往 https://www.netlify.com
   
2. **連接 GitHub Repository**
   - 選擇 procurement-approval-system
   
3. **設定建置**
   - Branch: DEV
   - Base directory: `static-web`
   - Build command: (留空)
   - Publish directory: `.`
   
4. **部署**
   - Netlify 會自動部署
   - 提供 HTTPS 和自訂網域

#### 優勢
- 自動 HTTPS
- 持續部署 (推送程式碼自動更新)
- 免費 CDN
- 表單處理功能

### 部署到 Vercel

Vercel 提供極快的部署速度和優秀的開發體驗。

#### 部署步驟

1. **登入 Vercel**
   - 前往 https://vercel.com
   
2. **匯入專案**
   - 選擇 GitHub Repository
   
3. **設定專案**
   - Framework Preset: Other
   - Root Directory: `static-web`
   
4. **部署**
   - Vercel 會自動部署
   - 提供預覽 URL

#### 優勢
- 極快的全球 CDN
- 自動 HTTPS
- 即時預覽
- 分析功能

## 技術架構

### 前端技術

| 技術 | 版本 | 用途 | 載入方式 |
|------|------|------|----------|
| **HTML5** | - | 頁面結構 | 原生 |
| **CSS3** | - | 樣式設計 | 原生 |
| **JavaScript** | ES6+ | 應用邏輯 | 原生 |
| **Tailwind CSS** | Latest | UI 框架 | CDN |
| **Lucide Icons** | Latest | 圖示庫 | CDN |
| **Marked.js** | Latest | Markdown 渲染 | CDN |

### API 整合

系統使用 OpenAI 相容的 API 進行 LLM 呼叫：

```javascript
// 預設使用 Manus Forge API
API 端點: https://api.manus.im/v1
支援模型:
- gpt-4.1-mini (推薦)
- gpt-4.1-nano (快速)
- gemini-2.5-flash
```

也可以修改 `js/config.js` 使用原生 OpenAI API：

```javascript
API: {
    BASE_URL: 'https://api.openai.com/v1',
    // ...
}
```

### 資料儲存

使用瀏覽器 localStorage 儲存資料：

| 資料類型 | 儲存位置 | 大小限制 |
|---------|---------|---------|
| API Key | localStorage | - |
| 草稿 | localStorage | 5-10MB |
| 歷史記錄 | localStorage | 5-10MB |
| 設定 | localStorage | - |

### 程式碼架構

模組化設計，職責分離：

```
js/
├── config.js    - 配置管理 (API 端點、模型選項等)
├── storage.js   - 資料持久化 (localStorage 操作)
├── api.js       - API 呼叫 (LLM 請求、檔案上傳)
├── ui.js        - UI 管理 (Toast、Modal、渲染)
└── app.js       - 應用邏輯 (事件處理、流程控制)
```

## 安全性考量

### API Key 管理

API Key 的安全儲存和使用：

- ✅ **本地儲存** - API Key 儲存在瀏覽器 localStorage
- ✅ **不上傳** - 不會傳送到任何第三方伺服器
- ⚠️ **使用限制** - 建議使用有限額度的 API Key
- ⚠️ **定期更換** - 建議定期更換 API Key

### 資料隱私

使用者資料的隱私保護：

- ✅ **本地儲存** - 所有草稿和歷史記錄儲存在本地
- ✅ **不上傳** - 除了 LLM API 呼叫外，不傳送到任何伺服器
- ⚠️ **清除風險** - 清除瀏覽器資料會遺失所有記錄
- 💡 **建議** - 定期匯出重要資料（功能待實作）

### HTTPS

網站傳輸安全：

- ✅ **建議使用** - 部署時啟用 HTTPS
- ✅ **保護傳輸** - 保護 API Key 和資料傳輸安全
- ✅ **免費方案** - GitHub Pages、Netlify、Vercel 都提供免費 HTTPS

## 限制與注意事項

### 功能限制

了解靜態版本的限制：

1. **檔案處理**
   - ✅ 支援圖片文件的 AI 識別
   - ❌ PDF 和 Word 文件需要額外處理
   - 💡 可考慮使用第三方 API 進行文件轉換

2. **儲存空間**
   - ⚠️ localStorage 有大小限制（通常 5-10MB）
   - 💡 建議定期清理歷史記錄
   - 💡 可實作匯出/匯入功能

3. **跨裝置同步**
   - ❌ 資料儲存在本地，無法跨裝置同步
   - 💡 可考慮整合雲端儲存服務

4. **離線功能**
   - ❌ 需要網路連線呼叫 LLM API
   - 💡 可實作 Service Worker 快取靜態資源

### 瀏覽器相容性

支援的瀏覽器版本：

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (不支援)

### 效能考量

影響效能的因素：

- ✅ CDN 資源載入快速
- ✅ 圖片使用 Base64 編碼（適合小檔案）
- ⚠️ 大量歷史記錄可能影響效能
- 💡 建議保持歷史記錄在 50 個以內

## 開發指南

### 本地開發

設定本地開發環境：

```bash
# 1. 克隆專案
git clone https://github.com/Dtparzival/procurement-approval-system.git
cd procurement-approval-system

# 2. 切換到 DEV 分支
git checkout DEV

# 3. 進入靜態網頁目錄
cd static-web

# 4. 啟動本地伺服器
python3 -m http.server 8000

# 5. 開啟瀏覽器
# http://localhost:8000
```

### 自訂配置

修改 `js/config.js` 進行自訂：

```javascript
const CONFIG = {
    // API 配置
    API: {
        BASE_URL: 'https://api.manus.im/v1',  // 修改 API 端點
        DEFAULT_MODEL: 'gpt-4.1-mini',         // 修改預設模型
    },
    
    // 自動儲存間隔 (毫秒)
    AUTO_SAVE_INTERVAL: 30000,  // 修改為 60000 = 1 分鐘
    
    // UI 配置
    UI: {
        TOAST_DURATION: 3000,      // Toast 顯示時間
        MAX_RECENT_DRAFTS: 6,      // 最近草稿數量
        MAX_HISTORY_ITEMS: 50,     // 最大歷史記錄數
    }
};
```

### 擴展功能

模組化設計讓您可以輕鬆擴展：

- **storage.js** - 新增儲存邏輯（如雲端同步）
- **api.js** - 新增 API 呼叫（如其他 AI 服務）
- **ui.js** - 新增 UI 元件（如深色模式）
- **app.js** - 新增應用程式邏輯（如批次生成）

## 常見問題

### Q: 如何取得 API Key？

**A:** 您可以使用以下任一方式：

1. **Manus Forge API** (推薦)
   - 前往 https://manus.im
   - 註冊帳號並取得 API Key
   - 支援多種模型，價格合理

2. **OpenAI API**
   - 前往 https://platform.openai.com
   - 註冊帳號並取得 API Key
   - 需要修改 `js/config.js` 中的 API 端點

### Q: 資料會遺失嗎？

**A:** 資料儲存在瀏覽器 localStorage，在以下情況會遺失：

- 清除瀏覽器資料
- 使用無痕模式
- 更換瀏覽器或裝置

**建議**: 定期複製重要簽呈到其他地方備份。

### Q: 可以離線使用嗎？

**A:** 部分功能可以離線使用：

- ✅ 開啟網頁（如果已快取）
- ✅ 查看歷史記錄
- ✅ 編輯草稿
- ❌ 生成新簽呈（需要呼叫 API）

### Q: 支援哪些檔案格式？

**A:** 目前支援：

- ✅ 圖片：JPG、PNG、GIF、WebP
- ❌ 文件：PDF、Word（需要額外處理）

### Q: 如何匯出資料？

**A:** 目前需要手動複製：

1. 點擊「複製」按鈕複製簽呈內容
2. 貼到 Word 或其他應用程式

**未來計劃**: 實作資料匯出/匯入功能。

### Q: 與 main 分支有什麼不同？

**A:** 主要差異：

| 項目 | main 分支 | DEV 分支 |
|------|----------|---------|
| 架構 | 全端應用程式 | 純前端 |
| 部署 | 需要伺服器 | 靜態託管 |
| 資料庫 | MySQL/TiDB | localStorage |
| 成本 | 較高 | 極低 |
| 適用 | 企業部署 | 個人使用 |

## 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 本倉庫
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 支援與回饋

如有問題或建議：

- **GitHub Issues**: https://github.com/Dtparzival/procurement-approval-system/issues
- **Pull Requests**: https://github.com/Dtparzival/procurement-approval-system/pulls

## 相關連結

- **GitHub Repository**: https://github.com/Dtparzival/procurement-approval-system
- **main 分支** (全端版): https://github.com/Dtparzival/procurement-approval-system/tree/main
- **DEV 分支** (靜態版): https://github.com/Dtparzival/procurement-approval-system/tree/DEV

---

Made with ❤️ by [Dtparzival](https://github.com/Dtparzival)

*最後更新: 2025-12-06*
