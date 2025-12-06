# AI 採購簽呈生成系統

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/Dtparzival/procurement-approval-system)](https://github.com/Dtparzival/procurement-approval-system/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Dtparzival/procurement-approval-system)](https://github.com/Dtparzival/procurement-approval-system/pulls)

一個基於 AI 的智能採購簽呈自動生成系統,支援自然語言輸入、文件上傳、智能生成與線上預覽編輯功能。

## ✨ 主要功能

- 🤖 **AI 智能生成** - 使用自然語言描述採購需求,AI 自動生成專業的簽呈公文
- 📄 **文件上傳支援** - 支援上傳 PDF、Word、圖片等參考文件,AI 自動提取關鍵資訊
- ✏️ **線上編輯** - 生成後可直接線上編輯修改簽呈內容
- 💾 **草稿自動儲存** - 每 30 秒自動儲存草稿,避免資料遺失
- 📋 **歷史記錄管理** - 完整的草稿和已完成簽呈管理功能
- 📱 **響應式設計** - 完美支援桌面版和手機版,隨時隨地使用
- 🔐 **OAuth 認證** - 使用 Manus OAuth 系統級認證服務,安全可靠

## 🚀 快速開始

### 環境需求

- Node.js 22.13.0 或更高版本
- pnpm 包管理器
- PostgreSQL 資料庫 (或 TiDB)

### 安裝步驟

1. **克隆倉庫**
   ```bash
   git clone https://github.com/Dtparzival/procurement-approval-system.git
   cd procurement-approval-system
   ```

2. **安裝依賴**
   ```bash
   pnpm install
   ```

3. **設定環境變數**
   
   複製 `.env.example` 為 `.env` 並填入必要的環境變數:
   ```bash
   cp .env.example .env
   ```

   必要的環境變數包括:
   - `DATABASE_URL` - 資料庫連接字串
   - `JWT_SECRET` - JWT 簽名密鑰
   - `OAUTH_SERVER_URL` - OAuth 伺服器網址
   - `BUILT_IN_FORGE_API_URL` - AI API 網址
   - `BUILT_IN_FORGE_API_KEY` - AI API 金鑰

4. **初始化資料庫**
   ```bash
   pnpm db:push
   ```

5. **啟動開發伺服器**
   ```bash
   pnpm dev
   ```

6. **開啟瀏覽器**
   
   訪問 `http://localhost:3000` 開始使用

## 📖 使用說明

### 生成簽呈

1. 登入系統後,在首頁輸入草稿標題(選填)
2. 在需求描述欄位詳細描述採購需求
3. (可選)上傳參考文件,AI 會自動提取關鍵資訊
4. 點擊「生成簽呈」按鈕
5. AI 會自動生成專業的採購簽呈公文

### 編輯簽呈

1. 在簽呈預覽區域點擊「編輯」按鈕
2. 在編輯器中修改簽呈內容
3. 點擊「儲存」按鈕保存修改
4. 點擊「取消」按鈕放棄修改

### 管理草稿

1. 點擊「儲存草稿」按鈕保存當前輸入
2. 系統會每 30 秒自動儲存草稿
3. 在「歷史記錄」頁面查看所有草稿
4. 點擊「繼續編輯」載入草稿內容

## 🏗️ 技術架構

### 前端技術棧

- **框架**: React 19 + TypeScript
- **樣式**: Tailwind CSS 4
- **UI 元件**: shadcn/ui
- **路由**: wouter
- **狀態管理**: tRPC + React Query
- **Markdown 渲染**: Streamdown

### 後端技術棧

- **框架**: Express 4 + tRPC 11
- **資料庫**: PostgreSQL / TiDB
- **ORM**: Drizzle ORM
- **認證**: Manus OAuth
- **AI 服務**: Manus Forge API
- **檔案儲存**: S3

### 專案結構

```
procurement-approval-system/
├── client/                 # 前端程式碼
│   ├── src/
│   │   ├── pages/         # 頁面元件
│   │   ├── components/    # UI 元件
│   │   ├── lib/          # 工具函數
│   │   └── App.tsx       # 主應用程式
│   └── public/           # 靜態資源
├── server/                # 後端程式碼
│   ├── routers.ts        # tRPC 路由
│   ├── db.ts             # 資料庫查詢
│   └── _core/            # 核心功能
├── drizzle/              # 資料庫 Schema
│   └── schema.ts
├── shared/               # 共用程式碼
└── package.json
```

## 🤝 貢獻指南

我們歡迎所有形式的貢獻!請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何參與專案開發。

### 開發流程

1. Fork 本倉庫
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 程式碼審查

- 所有 PR 需要至少 1 位審查者批准才能合併
- 請確保程式碼通過所有測試
- 遵循專案的程式碼風格規範

## 📝 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Manus](https://manus.im) - 提供 AI 服務和 OAuth 認證
- [shadcn/ui](https://ui.shadcn.com) - 提供優質的 UI 元件
- [tRPC](https://trpc.io) - 提供類型安全的 API 框架

## 📧 聯絡方式

如有任何問題或建議,歡迎:
- 開啟 [GitHub Issue](https://github.com/Dtparzival/procurement-approval-system/issues)
- 提交 [Pull Request](https://github.com/Dtparzival/procurement-approval-system/pulls)

---

Made with ❤️ by [Dtparzival](https://github.com/Dtparzival)
