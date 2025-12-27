# 畫面呈現相關資訊一覽表

本文檔彙整了「Agent 智簽公文」系統中與畫面呈現相關的函式和邏輯，方便日後維護和更新。

## 總覽

系統的畫面呈現主要由 `js/ui.js` 和 `js/app.js` 控制，並搭配 `css/style.css` 中的樣式。

- **`js/ui.js`**：負責所有與 UI 相關的操作，例如顯示/隱藏 Modal、顯示 Toast 訊息、更新 UI 元素等。
- **`js/app.js`**：負責應用程式的主要邏輯，並呼叫 `js/ui.js` 中的函式來更新畫面。
- **`js/auth.js`**：負責使用者認證相關的 UI 更新。

## 主要函式

| 函式名稱 | 檔案 | 說明 |
| :--- | :--- | :--- |
| `showErrorState(title, message)` | `js/ui.js` | 顯示錯誤狀態畫面 |
| `hideErrorState()` | `js/ui.js` | 隱藏錯誤狀態畫面 |
| `showEmptyState(config)` | `js/ui.js` | 顯示空狀態畫面 |
| `showLoading(text, type)` | `js/ui.js` | 顯示載入中畫面 |
| `hideLoading()` | `js/ui.js` | 隱藏載入中畫面 |
| `showToast(message, type)` | `js/ui.js` | 顯示 Toast 訊息 |
| `showLoginDialog()` | `js/ui.js` | 顯示登入對話框 |
| `hideLoginDialog()` | `js/ui.js` | 隱藏登入對話框 |
| `showHistoryModal()` | `js/ui.js` | 顯示歷史記錄 Modal |
| `hideHistoryModal()` | `js/ui.js` | 隱藏歷史記錄 Modal |
| `showDraftsModal()` | `js/app.js` | 顯示草稿 Modal |
| `showSettingsModal()` | `js/ui.js` | 顯示設定 Modal |
| `hideSettingsModal()` | `js/ui.js` | 隱藏設定 Modal |
| `showApproval(approval)` | `js/ui.js` | 顯示簽呈內容 |
| `showUploadedFile(file)` | `js/ui.js` | 顯示已上傳的文件 |
| `updateCharCount(textarea)` | `js/ui.js` | 更新字數統計 |
| `updateLastSaved()` | `js/ui.js` | 更新最後儲存時間 |
| `updateUserInfo(user)` | `js/ui.js` | 更新使用者資訊 |
| `updateFileCount()` | `js/ui.js` | 更新文件計數 |
| `toggleUserMenu()` | `js/ui.js` | 切換使用者選單 |
| `toggleCustomSelect()` | `js/ui.js` | 切換自訂下拉選單 |
| `showApp()` | `js/auth.js` | 顯示應用程式主畫面 |
| `showHero()` | `js/auth.js` | 顯示 Hero 區塊 |
| `updateUserUI(user)` | `js/auth.js` | 更新使用者 UI |
| `updateUserStatusIndicator(hasUsed)` | `js/auth.js` | 更新使用者狀態指示器 |

## 響應式設計

系統使用 Tailwind CSS 進行響應式設計，並在 `css/style.css` 中針對不同螢幕尺寸和方向進行了優化。

### 主要斷點

| 斷點 | 說明 |
| :--- | :--- |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### 橫向模式優化

針對手機和平板的橫向模式，系統在 `css/style.css` 中使用了 `@media (orientation: landscape)` 進行了特殊處理，以確保在橫向模式下有良好的使用者體驗。

主要的優化包括：

- 調整主要內容區域的佈局為左右並排
- 縮小 Header 和 Footer
- 調整 Modal 的大小和位置
- 縮小空狀態區域的圖示和文字

## 更新紀錄

- **2025-12-28**：建立此文件。
