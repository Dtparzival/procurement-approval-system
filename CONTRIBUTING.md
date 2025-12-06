# 貢獻指南

感謝您對 AI 採購簽呈生成系統的關注!我們歡迎所有形式的貢獻,包括但不限於:

- 🐛 回報 Bug
- 💡 提出新功能建議
- 📝 改進文件
- 🔧 提交程式碼修復或新功能

## 📋 目錄

- [行為準則](#行為準則)
- [如何貢獻](#如何貢獻)
- [開發環境設定](#開發環境設定)
- [提交 Pull Request](#提交-pull-request)
- [程式碼風格](#程式碼風格)
- [測試指南](#測試指南)
- [提交訊息規範](#提交訊息規範)

## 行為準則

參與本專案即表示您同意遵守我們的行為準則。請保持友善、尊重和專業的態度。

## 如何貢獻

### 回報 Bug

如果您發現 Bug,請:

1. 檢查 [Issues](https://github.com/Dtparzival/procurement-approval-system/issues) 確認該問題尚未被回報
2. 如果沒有相關 Issue,請建立新的 Issue
3. 使用清晰的標題描述問題
4. 提供詳細的重現步驟
5. 說明預期行為和實際行為
6. 附上螢幕截圖(如適用)
7. 提供環境資訊(瀏覽器版本、作業系統等)

### 提出功能建議

如果您有新功能的想法:

1. 檢查 [Issues](https://github.com/Dtparzival/procurement-approval-system/issues) 確認該功能尚未被提出
2. 建立新的 Issue,標籤為 `enhancement`
3. 清楚描述功能的目的和預期效果
4. 說明為什麼這個功能對專案有幫助
5. 如果可能,提供實作建議或參考範例

### 改進文件

文件改進永遠受歡迎!您可以:

- 修正錯字或語法錯誤
- 改進說明的清晰度
- 新增缺少的文件
- 翻譯文件到其他語言

## 開發環境設定

### 前置需求

- Node.js 22.13.0 或更高版本
- pnpm 包管理器
- Git
- PostgreSQL 資料庫(或 TiDB)

### 設定步驟

1. **Fork 並克隆倉庫**
   ```bash
   git clone https://github.com/YOUR_USERNAME/procurement-approval-system.git
   cd procurement-approval-system
   ```

2. **新增上游倉庫**
   ```bash
   git remote add upstream https://github.com/Dtparzival/procurement-approval-system.git
   ```

3. **安裝依賴**
   ```bash
   pnpm install
   ```

4. **設定環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 填入必要的環境變數
   ```

5. **初始化資料庫**
   ```bash
   pnpm db:push
   ```

6. **啟動開發伺服器**
   ```bash
   pnpm dev
   ```

## 提交 Pull Request

### 工作流程

1. **建立功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **進行開發**
   - 遵循程式碼風格規範
   - 撰寫清晰的程式碼註解
   - 確保程式碼可讀性

3. **提交變更**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **同步上游變更**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **建立 Pull Request**
   - 前往 GitHub 建立 PR
   - 填寫 PR 範本
   - 清楚描述變更內容
   - 連結相關的 Issue

### PR 審查流程

- 所有 PR 需要至少 1 位審查者批准
- 審查者可能會要求修改
- 請及時回應審查意見
- 通過審查後,維護者會合併 PR

## 程式碼風格

### TypeScript / JavaScript

- 使用 TypeScript 進行開發
- 遵循 ESLint 規則
- 使用有意義的變數名稱
- 避免使用 `any` 型別
- 適當使用型別註解

### React 元件

- 使用函數式元件和 Hooks
- 元件名稱使用 PascalCase
- Props 使用 TypeScript interface 定義
- 保持元件單一職責

### CSS / Tailwind

- 優先使用 Tailwind CSS 類別
- 避免自定義 CSS(除非必要)
- 使用語義化的類別名稱
- 確保響應式設計

### 命名規範

- 檔案名稱: `kebab-case.ts` 或 `PascalCase.tsx`(元件)
- 變數/函數: `camelCase`
- 常數: `UPPER_SNAKE_CASE`
- 型別/介面: `PascalCase`

## 測試指南

### 撰寫測試

- 為新功能撰寫測試
- 確保測試覆蓋率
- 使用描述性的測試名稱
- 測試邊界情況

### 執行測試

```bash
# 執行所有測試
pnpm test

# 執行特定測試
pnpm test -- path/to/test.ts

# 查看測試覆蓋率
pnpm test:coverage
```

## 提交訊息規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範:

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 類型

- `feat`: 新功能
- `fix`: Bug 修復
- `docs`: 文件變更
- `style`: 程式碼格式調整(不影響功能)
- `refactor`: 重構(不是新功能也不是 Bug 修復)
- `perf`: 效能優化
- `test`: 測試相關
- `chore`: 建置流程或輔助工具變更

### 範例

```
feat(auth): add OAuth login support

Implement OAuth authentication using Manus OAuth service.
This allows users to login with their existing accounts.

Closes #123
```

```
fix(ui): resolve mobile layout issue

Fix text overflow in approval preview on iPhone devices.
```

## 分支策略

- `main`: 主分支,保持穩定
- `feature/*`: 新功能開發
- `fix/*`: Bug 修復
- `docs/*`: 文件更新
- `refactor/*`: 程式碼重構

## 發布流程

1. 更新版本號(遵循 [Semantic Versioning](https://semver.org/))
2. 更新 CHANGELOG.md
3. 建立 Git tag
4. 推送到 GitHub
5. 建立 GitHub Release

## 需要幫助?

如果您在貢獻過程中遇到任何問題:

- 查看 [README.md](README.md)
- 搜尋現有的 [Issues](https://github.com/Dtparzival/procurement-approval-system/issues)
- 建立新的 Issue 詢問
- 聯絡維護者

## 致謝

感謝所有貢獻者的付出!您的貢獻讓這個專案變得更好。

---

再次感謝您的貢獻! 🎉
