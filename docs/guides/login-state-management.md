# 登入狀態管理指南

**文件版本**: 1.0  
**最後更新**: 2025-12-13  
**作者**: 開發團隊

---

## 📋 概述

本文件說明 Agent 智簽公文系統的登入狀態管理機制，包括 Hero 區塊顯示邏輯、登入按鈕控制、以及用戶體驗優化。

---

## 🎯 設計目標

### 核心需求

1. **首次訪問體驗**
   - 顯示完整的 Hero 區塊（首頁）
   - 包含導航欄、大標題、開始使用按鈕
   - 包含核心功能介紹

2. **已使用過系統**
   - 回到首頁時不顯示「登入」按鈕
   - 提供流暢的用戶體驗
   - 避免重複的引導流程

3. **登出後重置**
   - 清除所有使用記錄
   - 恢復到首次訪問狀態
   - 重新顯示登入按鈕

---

## 🏗️ 技術架構

### 狀態管理機制

系統使用 **localStorage** 來追蹤用戶的使用狀態：

```javascript
// 狀態標記
localStorage.setItem('procurement_has_entered', 'true');  // 已進入應用程式
localStorage.setItem('procurement_api_key', '...');       // API Key
localStorage.setItem('procurement_drafts', '...');        // 草稿資料
localStorage.setItem('procurement_history', '...');       // 歷史記錄
```

### 判斷邏輯

系統通過 `hasUsedBefore()` 方法判斷用戶是否已使用過系統：

```javascript
hasUsedBefore() {
    const apiKey = localStorage.getItem('procurement_api_key');
    const drafts = localStorage.getItem('procurement_drafts');
    const history = localStorage.getItem('procurement_history');
    const hasEntered = localStorage.getItem('procurement_has_entered');
    
    return !!(apiKey || drafts || history || hasEntered);
}
```

**判斷條件**：
- 有 API Key → 已使用過
- 有草稿資料 → 已使用過
- 有歷史記錄 → 已使用過
- 有已進入標記 → 已使用過
- 都沒有 → 首次訪問

---

## 🔄 流程說明

### 1. 首次訪問流程

```
用戶訪問網站
    ↓
檢查 localStorage
    ↓
沒有任何資料
    ↓
顯示 Hero 區塊
    ↓
顯示「登入」和「開始使用」按鈕
```

**程式碼**：

```javascript
// auth.js - init()
init() {
    const hasUsedBefore = this.hasUsedBefore();
    
    if (hasUsedBefore) {
        this.showApp();
    } else {
        this.showHero();  // 首次訪問顯示 Hero
    }
    ...
}
```

### 2. 點擊「開始使用」流程

```
用戶點擊「開始使用」
    ↓
調用 Auth.showApp()
    ↓
設置 procurement_has_entered = 'true'
    ↓
隱藏 Hero 區塊
    ↓
顯示應用程式
```

**程式碼**：

```javascript
// auth.js - showApp()
showApp() {
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    
    // 標記用戶已經進入應用程式
    localStorage.setItem('procurement_has_entered', 'true');
}
```

### 3. 回到首頁流程

```
用戶點擊左上角 logo
    ↓
調用 Auth.showHero()
    ↓
檢查 hasUsedBefore()
    ↓
返回 true（有 has_entered 標記）
    ↓
隱藏「登入」和「開始使用」按鈕
    ↓
顯示 Hero 區塊（無按鈕）
```

**程式碼**：

```javascript
// auth.js - showHero()
showHero() {
    document.getElementById('heroSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    
    // 如果使用者已經使用過系統，隱藏登入按鈕
    const hasUsed = this.hasUsedBefore();
    const loginBtn = document.getElementById('loginBtn');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    
    if (loginBtn) {
        if (hasUsed) {
            loginBtn.classList.add('hidden');  // 隱藏登入按鈕
        } else {
            loginBtn.classList.remove('hidden');
        }
    }
    
    if (heroLoginBtn) {
        if (hasUsed) {
            heroLoginBtn.classList.add('hidden');  // 隱藏開始使用按鈕
        } else {
            heroLoginBtn.classList.remove('hidden');
        }
    }
}
```

### 4. 登出流程

```
用戶點擊「登出」
    ↓
調用 Auth.logout()
    ↓
清除 current_user
    ↓
清除 procurement_has_entered
    ↓
重新載入頁面
    ↓
顯示 Hero 區塊 + 登入按鈕
```

**程式碼**：

```javascript
// auth.js - logout()
logout() {
    // 清除用戶資訊和已進入標記
    localStorage.removeItem('current_user');
    localStorage.removeItem('procurement_has_entered');
    
    // 重新載入頁面
    window.location.reload();
}
```

---

## 📊 狀態轉換圖

```
┌─────────────────┐
│   首次訪問      │
│ (無 localStorage)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  顯示 Hero 區塊 │
│  + 登入按鈕     │
│  + 開始使用按鈕 │
└────────┬────────┘
         │
         │ 點擊「開始使用」
         ↓
┌─────────────────┐
│  進入應用程式   │
│  設置 has_entered│
└────────┬────────┘
         │
         │ 點擊 logo 回首頁
         ↓
┌─────────────────┐
│  顯示 Hero 區塊 │
│  無登入按鈕     │ ◄─┐
│  無開始使用按鈕 │   │
└────────┬────────┘   │
         │             │
         │ 點擊 logo   │
         └─────────────┘
         │
         │ 點擊「登出」
         ↓
┌─────────────────┐
│  清除 localStorage│
│  重新載入頁面   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  顯示 Hero 區塊 │
│  + 登入按鈕     │
│  + 開始使用按鈕 │
└─────────────────┘
```

---

## 🎨 UI 狀態對照表

| 狀態 | Hero 區塊 | 應用程式 | 登入按鈕 | 開始使用按鈕 |
|:---|:---:|:---:|:---:|:---:|
| **首次訪問** | ✅ 顯示 | ❌ 隱藏 | ✅ 顯示 | ✅ 顯示 |
| **點擊「開始使用」** | ❌ 隱藏 | ✅ 顯示 | N/A | N/A |
| **回到首頁（已使用過）** | ✅ 顯示 | ❌ 隱藏 | ❌ 隱藏 | ❌ 隱藏 |
| **點擊「登出」** | ✅ 顯示 | ❌ 隱藏 | ✅ 顯示 | ✅ 顯示 |

---

## 🔧 關鍵方法說明

### hasUsedBefore()

**用途**：判斷用戶是否已經使用過系統

**位置**：`js/auth.js`

**邏輯**：
- 檢查 localStorage 中的 4 個項目
- 有任何一項即返回 `true`
- 都沒有則返回 `false`

**使用場景**：
- 初始化時決定顯示 Hero 或應用程式
- 回到首頁時決定是否顯示登入按鈕

### showApp()

**用途**：顯示應用程式頁面

**位置**：`js/auth.js`

**功能**：
1. 隱藏 Hero 區塊
2. 顯示應用程式區塊
3. 設置 `procurement_has_entered` 標記

**調用時機**：
- 點擊「開始使用」按鈕
- 點擊「登入」按鈕
- 初始化時（如果已使用過）

### showHero()

**用途**：顯示 Hero 區塊（首頁）

**位置**：`js/auth.js`

**功能**：
1. 顯示 Hero 區塊
2. 隱藏應用程式區塊
3. 根據 `hasUsedBefore()` 決定是否顯示登入按鈕

**調用時機**：
- 初始化時（如果是首次訪問）
- 點擊左上角 logo 回首頁

### logout()

**用途**：登出並重置系統

**位置**：`js/auth.js`

**功能**：
1. 清除 `current_user`
2. 清除 `procurement_has_entered`
3. 重新載入頁面

**調用時機**：
- 點擊「登出」按鈕

---

## 🧪 測試指南

### 測試場景 1：首次訪問

**步驟**：
1. 清除 localStorage：`localStorage.clear()`
2. 重新載入頁面

**預期結果**：
- ✅ 顯示 Hero 區塊
- ✅ 顯示「登入」按鈕（右上角）
- ✅ 顯示「開始使用」按鈕（中間）

### 測試場景 2：點擊「開始使用」

**步驟**：
1. 在首頁點擊「開始使用」按鈕

**預期結果**：
- ✅ 進入應用程式頁面
- ✅ localStorage 中有 `procurement_has_entered = 'true'`

### 測試場景 3：回到首頁

**步驟**：
1. 在應用程式頁面點擊左上角 logo

**預期結果**：
- ✅ 顯示 Hero 區塊
- ❌ 不顯示「登入」按鈕
- ❌ 不顯示「開始使用」按鈕

### 測試場景 4：登出

**步驟**：
1. 在應用程式頁面點擊「登出」按鈕

**預期結果**：
- ✅ 頁面重新載入
- ✅ 顯示 Hero 區塊
- ✅ 顯示「登入」按鈕
- ✅ 顯示「開始使用」按鈕
- ✅ localStorage 中沒有 `procurement_has_entered`

---

## 🐛 常見問題

### Q1: 為什麼回到首頁後「開始使用」按鈕也消失了？

**A**: 這是設計行為。因為用戶已經「使用過」系統，不需要再次引導。如果需要回到應用程式，可以：
- 直接重新載入頁面（會自動進入應用程式）
- 或者修改 `showHero()` 邏輯，保留「開始使用」按鈕但隱藏「登入」按鈕

### Q2: 如何完全重置系統？

**A**: 有兩種方法：
1. **點擊「登出」按鈕**：只清除 `current_user` 和 `has_entered`
2. **清除所有 localStorage**：`localStorage.clear()`（會清除所有資料）

### Q3: 如果用戶有 API Key 但沒有 has_entered 標記會怎樣？

**A**: 系統會直接進入應用程式（因為 `hasUsedBefore()` 返回 `true`）。這是正確的行為，因為用戶已經使用過系統。

### Q4: 為什麼需要 has_entered 標記？

**A**: 因為用戶可能在首次點擊「開始使用」時還沒有輸入 API Key 或儲存草稿。`has_entered` 標記確保即使沒有其他資料，系統也能記住用戶已經進入過應用程式。

---

## 🔄 未來優化建議

### 1. 保留「開始使用」按鈕

**問題**：回到首頁後，用戶無法直接回到應用程式（需要重新載入頁面）

**建議**：
- 保留「開始使用」按鈕（或改名為「繼續使用」）
- 只隱藏「登入」按鈕

**實現**：

```javascript
// auth.js - showHero()
if (heroLoginBtn) {
    // 不隱藏「開始使用」按鈕，讓用戶可以回到應用程式
    // if (hasUsed) {
    //     heroLoginBtn.classList.add('hidden');
    // } else {
        heroLoginBtn.classList.remove('hidden');
    // }
}
```

### 2. 動態按鈕文字

**建議**：根據用戶狀態改變按鈕文字

```javascript
if (hasUsed) {
    heroLoginBtn.textContent = '繼續使用';
} else {
    heroLoginBtn.textContent = '開始使用';
}
```

### 3. 用戶狀態指示

**建議**：在首頁顯示用戶狀態

```html
<div class="user-status">
    歡迎回來！您上次使用時間：2025-12-13 09:38
</div>
```

### 4. 更精細的狀態管理

**建議**：使用更複雜的狀態機

```javascript
const UserState = {
    FIRST_VISIT: 'first_visit',      // 首次訪問
    ENTERED: 'entered',               // 已進入應用程式
    HAS_DATA: 'has_data',            // 有資料（API Key/草稿）
    LOGGED_IN: 'logged_in'           // 已登入
};
```

---

## 📚 相關文件

- [README.md](../../README.md) - 專案總覽
- [BUGFIX_HISTORY.md](../bugfix/BUGFIX_HISTORY.md) - Bug 修復歷史
- [首頁修正報告](/home/ubuntu/homepage_fix_summary.md) - 首頁顯示修正

---

## 📝 變更歷史

| 版本 | 日期 | 變更內容 |
|:---|:---|:---|
| 1.0 | 2025-12-13 | 初始版本，記錄登入狀態管理機制 |

---

**文件結束**
