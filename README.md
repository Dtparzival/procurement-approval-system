# AI 採購簽呈生成系統

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Branch: release](https://img.shields.io/badge/Branch-release-green.svg)](https://github.com/Dtparzival/procurement-approval-system/tree/release)

本專案是一個完全使用前端技術實作的 AI 採購簽呈生成系統，無需後端伺服器。所有資料儲存在瀏覽器本地，直接從前端呼叫 LLM API 進行簽呈生成。

---

## 📚 文件導航

| 文件 | 說明 |
| :--- | :--- |
| 📖 **[README.md](README.md)** | **(本文件)** 專案總覽、功能介紹與快速開始。 |
| 📝 **[CHANGELOG.md](CHANGELOG.md)** | **變更記錄**：`release` 分支的主要功能更新與修復歷史。 |
| 📝 **[CHANGELOG_DEV.md](CHANGELOG_DEV.md)** | **開發變更記錄**：`DEV` 分支的詳細開發過程。 |
| 📚 **[docs/README.md](docs/README.md)** | **技術文件索引**：所有技術文件、報告和指南的入口。 |

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

- **專業 UI/UX 設計**：提供清晰、簡潔、專業的使用者體驗，並在桌面版實現左右兩側完美對齊的佈局。
- **響應式與跨裝置體驗**：完美適應桌面、平板與行動裝置，確保跨裝置體驗一致。
- **文件智能讀取**：可上傳 PDF/Word 參考文件，AI 會自動提取內容，結合您的需求描述，生成更精準的簽呈。
- **PDF 檔案下載**: 生成結果可直接下載為 PDF 檔案，並自動加入內控浮水印，確保文件安全與格式一致性。
- **增強的互動效果**：所有互動元素都有增強的 hover 效果和絲滑的過渡動畫，並提供玻璃擬態風格的自定義組件。
- **純文字複製**: 一鍵複製純文字內容，方便貼到其他應用程式。
- **零伺服器成本**：純靜態網站，無需後端伺服器，可部署於任何靜態託管服務。
- **隱私安全**：API Key、草稿和歷史紀錄等所有資料皆儲存於瀏覽器本地，不會上傳到任何伺服器。
- **無需編譯**：使用原生 HTML/CSS/JavaScript，無需複雜的建置過程。
- **模組化設計**：程式碼結構清晰，易於維護與擴充。

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
