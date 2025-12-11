# AI 採購簽呈生成系統 - 靜態網頁版 (DEV 分支)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Branch: DEV](https://img.shields.io/badge/Branch-DEV-blue.svg)](https://github.com/Dtparzival/procurement-approval-system/tree/DEV)

> **注意**: 這是靜態網頁版本，與 `main` 分支的全端應用程式在架構上有顯著差異。

本專案是一個完全使用前端技術實作的 AI 採購簽呈生成系統，無需後端伺服器。所有資料儲存在瀏覽器本地，直接從前端呼叫 LLM API 進行簽呈生成。

---

## 📚 文件導航

為了提供更清晰的指引，我們將文件整理如下：

| 文件 | 說明 | 適用對象 |
| :--- | :--- | :--- |
| 📖 **[README.md](README.md)** | **(本文件)** 專案總覽、功能介紹與快速開始。 | **所有使用者** |
| 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** | **部署指南**：提供 AWS S3、GitHub Pages 等多種平台的詳細部署方法。 | **需要部署網站者** |
| ⚙️ **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** | **Google 登入設定**：設定 Google OAuth 2.0 客戶端 ID 的步驟。 | **需要啟用登入功能者** |
| 🌐 **[CLOUDFRONT_SETUP.md](CLOUDFRONT_SETUP.md)** | **CDN 設定指南**：為 S3 網站設定 HTTPS 和全球加速。 | **進階使用者** |
| 💻 **[GOOGLE_OAUTH_IMPLEMENTATION.md](GOOGLE_OAUTH_IMPLEMENTATION.md)** | **OAuth 技術文件**：深入解析 Google 登入的程式碼實作細節。 | **開發者** |
| 📝 **[CHANGELOG_DEV.md](CHANGELOG_DEV.md)** | **變更記錄**：DEV 分支的所有功能更新與修復歷史。 | **關注專案進度者** |
| 🧪 **[TEST_RESULTS.md](TEST_RESULTS.md)** | **測試報告**：系統的功能、效能與相容性測試結果。 | **品質保證、開發者** |

---

## 🚀 快速開始

您可以使用以下任一方法在本地端執行本專案。

### 方法一：直接開啟 HTML 檔案

1.  下載本專案的檔案。
2.  直接使用瀏覽器開啟 `index.html` 檔案。
3.  在設定彈窗中輸入您的 API Key 即可開始使用。

### 方法二：使用本地伺服器 (推薦)

```bash
# 1. 克隆專案並切換到 DEV 分支
git clone https://github.com/Dtparzival/procurement-approval-system.git
cd procurement-approval-system
git checkout DEV

# 2. 啟動本地伺服器 (任選一種)
python3 -m http.server 8000
# 或 npx serve .
# 或 php -S localhost:8000

# 3. 開啟瀏覽器訪問 http://localhost:8000
```

若要將網站部署到公開網路，請參考我們的 [**部署指南 (DEPLOYMENT.md)**](DEPLOYMENT.md)。

---

## ✨ 核心特色

- **零伺服器成本**：純靜態網站，無需後端伺服器，可部署於任何靜態託管服務。
- **隱私安全**：API Key、草稿和歷史紀錄等所有資料皆儲存於瀏覽器本地，不會上傳到任何伺服器。
- **無需編譯**：使用原生 HTML/CSS/JavaScript，無需複雜的建置過程。
- **模組化設計**：程式碼結構清晰，易於維護與擴充。
- **響應式介面**：完美適應桌面、平板與行動裝置。

## 🛠️ 技術架構

| 技術 | 用途 | 載入方式 |
| :--- | :--- | :--- |
| **HTML5 / CSS3 / ES6+** | 應用程式基礎 | 原生 |
| **Tailwind CSS** | UI 框架 | CDN |
| **Lucide Icons** | 圖示庫 | CDN |
| **Marked.js** | Markdown 渲染 | CDN |

### 程式碼結構

專案的 JavaScript 程式碼採模組化設計，職責分離：

```text
js/
├── config.js    # 配置管理 (API 端點、模型選項)
├── storage.js   # 資料持久化 (localStorage 操作)
├── api.js       # API 呼叫 (LLM 請求)
├── ui.js        # UI 管理 (互動、渲染)
└── app.js       # 應用主邏輯 (事件處理、流程控制)
```
