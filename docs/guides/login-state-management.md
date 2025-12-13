# 登入狀態管理指南

## 版本資訊

- **版本**: 2.0
- **最後更新**: 2025-12-13
- **作者**: Agent 智簽公文開發團隊

---

## 📋 概述

本文件說明 Agent 智簽公文系統的登入狀態管理機制，包括用戶狀態判斷、UI 顯示邏輯、狀態轉換流程等。

### 核心功能

1. **智能狀態判斷** - 根據 localStorage 資料自動判斷用戶狀態
2. **動態 UI 調整** - 根據用戶狀態動態調整按鈕文字和顯示
3. **用戶狀態指示** - 顯示上次使用時間和草稿數量
4. **狀態機管理** - 使用狀態機模式管理用戶的不同狀態

---

## 🎯 設計目標

### 用戶體驗優化

1. **首次訪問** - 顯示完整的 Hero 區塊，介紹系統功能
2. **已使用過** - 隱藏登入按鈕，顯示「繼續使用」，提供狀態資訊
3. **登出後** - 恢復到首次訪問狀態，重新顯示登入按鈕

### 核心需求

> 已登入未點選登出，回到首頁時右上角不應該出現『登入』按鈕，除非之後點選『登出』。

---

## 🏗️ 技術架構

### 用戶狀態定義

系統定義了四種用戶狀態（`UserState` 常量）：

```javascript
const UserState = {
    FIRST_VISIT: 'first_visit',      // 首次訪問
    ENTERED: 'entered',               // 已進入應用程式
    HAS_DATA: 'has_data',            // 有資料（API Key/草稿/歷史）
    LOGGED_IN: 'logged_in'           // 已登入（Google OAuth）
};
```

### 狀態優先級

狀態判斷的優先級（從高到低）：

1. **LOGGED_IN** - 已通過 Google OAuth 登入
2. **HAS_DATA** - 有 API Key、草稿或歷史記錄
3. **ENTERED** - 已點擊「開始使用」進入應用程式
4. **FIRST_VISIT** - 首次訪問，無任何資料

### localStorage 資料項

系統使用以下 localStorage 項目來判斷用戶狀態：

| 項目 | 說明 | 用途 |
|:---|:---|:---|
| `procurement_has_entered` | 是否已進入應用程式 | 判斷 ENTERED 狀態 |
| `procurement_last_used` | 上次使用時間（timestamp） | 顯示用戶狀態指示 |
| `procurement_api_key` | OpenAI API Key | 判斷 HAS_DATA 狀態 |
| `procurement_drafts` | 草稿列表（JSON） | 判斷 HAS_DATA 狀態、顯示草稿數量 |
| `procurement_history` | 歷史記錄（JSON） | 判斷 HAS_DATA 狀態 |
| `current_user` | 當前登入用戶（JSON） | 判斷 LOGGED_IN 狀態 |

---

## 🔄 流程說明

### 1. 首次訪問流程

```
用戶訪問網站
    ↓
檢查 localStorage
    ↓
無任何資料 → FIRST_VISIT 狀態
    ↓
顯示 Hero 區塊
    ↓
顯示「登入」按鈕（右上角）
顯示「開始使用」按鈕（中間）
不顯示用戶狀態指示
```

### 2. 點擊「開始使用」流程

```
用戶點擊「開始使用」
    ↓
調用 Auth.showApp()
    ↓
設置 procurement_has_entered = 'true'
設置 procurement_last_used = Date.now()
    ↓
隱藏 Hero 區塊
顯示應用程式區塊
    ↓
狀態變更為 ENTERED
```

### 3. 回到首頁流程

```
用戶點擊左上角 logo
    ↓
調用 Auth.showHero()
    ↓
檢查用戶狀態 → ENTERED/HAS_DATA/LOGGED_IN
    ↓
顯示 Hero 區塊
    ↓
隱藏「登入」按鈕（右上角）
顯示「繼續使用」按鈕（中間，文字動態變更）
顯示用戶狀態指示（上次使用時間、草稿數量）
```

### 4. 登出流程

```
用戶點擊「登出」
    ↓
調用 Auth.logout()
    ↓
清除 current_user
清除 procurement_has_entered
清除 procurement_last_used
    ↓
重新載入頁面
    ↓
狀態變更為 FIRST_VISIT（如果無其他資料）
或 HAS_DATA（如果有 API Key/草稿/歷史）
```

---

## 📊 狀態轉換圖

```
FIRST_VISIT
    ↓ [點擊「開始使用」]
ENTERED
    ↓ [儲存草稿/API Key/歷史]
HAS_DATA
    ↓ [Google OAuth 登入]
LOGGED_IN
    ↓ [登出]
FIRST_VISIT 或 HAS_DATA（取決於是否有資料）
```

---

## 🎨 UI 狀態對照表

| 用戶狀態 | 右上角「登入」按鈕 | 中間按鈕 | 用戶狀態指示 |
|:---|:---:|:---:|:---:|
| **FIRST_VISIT** | ✅ 顯示 | 「開始使用」 | ❌ 隱藏 |
| **ENTERED** | ❌ 隱藏 | 「繼續使用」 | ✅ 顯示 |
| **HAS_DATA** | ❌ 隱藏 | 「繼續使用」 | ✅ 顯示 |
| **LOGGED_IN** | ❌ 隱藏 | 「繼續使用」 | ✅ 顯示 |

---

## 🔧 關鍵方法說明

### 1. `getUserState()` - 獲取當前用戶狀態

**功能**: 根據 localStorage 資料判斷當前用戶狀態

**返回值**: `UserState` 常量（FIRST_VISIT / ENTERED / HAS_DATA / LOGGED_IN）

**判斷邏輯**:

```javascript
getUserState() {
    // 1. 檢查是否已登入（Google OAuth）
    const currentUser = this.getCurrentUser();
    if (currentUser) {
        return UserState.LOGGED_IN;
    }
    
    // 2. 檢查是否有資料（API Key/草稿/歷史）
    const apiKey = localStorage.getItem('procurement_api_key');
    const drafts = localStorage.getItem('procurement_drafts');
    const history = localStorage.getItem('procurement_history');
    if (apiKey || drafts || history) {
        return UserState.HAS_DATA;
    }
    
    // 3. 檢查是否已進入應用程式
    const hasEntered = localStorage.getItem('procurement_has_entered');
    if (hasEntered) {
        return UserState.ENTERED;
    }
    
    // 4. 首次訪問
    return UserState.FIRST_VISIT;
}
```

### 2. `hasUsedBefore()` - 檢查是否已使用過系統

**功能**: 簡化的狀態判斷，返回布林值

**返回值**: `boolean`（true = 已使用過，false = 首次訪問）

**用途**: 用於快速判斷是否需要隱藏登入按鈕

```javascript
hasUsedBefore() {
    const apiKey = localStorage.getItem('procurement_api_key');
    const drafts = localStorage.getItem('procurement_drafts');
    const history = localStorage.getItem('procurement_history');
    const hasEntered = localStorage.getItem('procurement_has_entered');
    
    return !!(apiKey || drafts || history || hasEntered);
}
```

### 3. `updateUserStatusIndicator(hasUsed)` - 更新用戶狀態指示

**功能**: 顯示或隱藏用戶狀態指示（上次使用時間、草稿數量）

**參數**: `hasUsed` (boolean) - 是否已使用過系統

**顯示內容**:

- **上次使用時間**: 
  - 1 分鐘內: 「剛剛」
  - 1-60 分鐘: 「X 分鐘前」
  - 1-24 小時: 「X 小時前」
  - 1-7 天: 「X 天前」
  - 7 天以上: 完整日期（YYYY/MM/DD）

- **草稿數量**: 從 `procurement_drafts` 讀取並計算數量

```javascript
updateUserStatusIndicator(hasUsed) {
    const indicator = document.getElementById('userStatusIndicator');
    if (!indicator) return;
    
    if (hasUsed) {
        // 顯示用戶狀態指示
        indicator.classList.remove('hidden');
        
        // 更新上次使用時間
        const lastUsedTime = localStorage.getItem('procurement_last_used');
        if (lastUsedTime) {
            const date = new Date(parseInt(lastUsedTime));
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            // ... 計算時間差並顯示
        }
        
        // 更新草稿數量
        const draftsStr = localStorage.getItem('procurement_drafts');
        if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const count = Array.isArray(drafts) ? drafts.length : 0;
            // ... 顯示草稿數量
        }
    } else {
        // 隱藏用戶狀態指示
        indicator.classList.add('hidden');
    }
}
```

### 4. `showHero()` - 顯示首頁 Hero 區塊

**功能**: 顯示 Hero 區塊，並根據用戶狀態調整 UI

**UI 調整邏輯**:

```javascript
showHero() {
    // 顯示 Hero 區塊，隱藏應用程式區塊
    document.getElementById('heroSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    
    const hasUsed = this.hasUsedBefore();
    
    // 調整「登入」按鈕顯示
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (hasUsed) {
            loginBtn.classList.add('hidden');  // 已使用過 → 隱藏
        } else {
            loginBtn.classList.remove('hidden');  // 首次訪問 → 顯示
        }
    }
    
    // 調整「開始使用/繼續使用」按鈕
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    if (heroLoginBtn) {
        heroLoginBtn.classList.remove('hidden');  // 始終顯示
        if (hasUsed) {
            heroLoginBtn.textContent = '繼續使用';  // 動態文字
        } else {
            heroLoginBtn.textContent = '開始使用';
        }
    }
    
    // 更新用戶狀態指示
    this.updateUserStatusIndicator(hasUsed);
}
```

---

## 🧪 測試指南

### 測試場景 1：首次訪問

**步驟**:
1. 清除所有 localStorage: `localStorage.clear()`
2. 重新載入頁面: `window.location.reload()`

**預期結果**:
- ✅ 顯示 Hero 區塊
- ✅ 顯示「登入」按鈕（右上角）
- ✅ 顯示「開始使用」按鈕（中間）
- ✅ 不顯示用戶狀態指示

### 測試場景 2：點擊「開始使用」

**步驟**:
1. 點擊「開始使用」按鈕

**預期結果**:
- ✅ 進入應用程式頁面
- ✅ `procurement_has_entered` 設置為 `'true'`
- ✅ `procurement_last_used` 設置為當前時間戳

### 測試場景 3：回到首頁（已使用過）

**步驟**:
1. 點擊左上角 logo

**預期結果**:
- ✅ 顯示 Hero 區塊
- ✅ **不顯示「登入」按鈕**（核心需求）
- ✅ 顯示「繼續使用」按鈕（文字動態變更）
- ✅ 顯示用戶狀態指示：
  - 上次使用：剛剛
  - 草稿：0 個

### 測試場景 4：登出

**步驟**:
1. 進入應用程式
2. 點擊「登出」按鈕

**預期結果**:
- ✅ 清除 `current_user`
- ✅ 清除 `procurement_has_entered`
- ✅ 清除 `procurement_last_used`
- ✅ 重新載入頁面
- ✅ 顯示「登入」按鈕
- ✅ 顯示「開始使用」按鈕

---

## 🐛 常見問題

### Q1: 為什麼回到首頁後還是顯示「登入」按鈕？

**原因**: `procurement_has_entered` 標記未設置或被清除

**解決方案**:
1. 檢查 `showApp()` 方法是否正確設置標記
2. 檢查是否有其他程式碼清除了標記
3. 使用瀏覽器開發者工具檢查 localStorage

### Q2: 用戶狀態指示不顯示？

**原因**: `updateUserStatusIndicator()` 未被調用或 HTML 元素不存在

**解決方案**:
1. 確認 `showHero()` 方法中調用了 `updateUserStatusIndicator()`
2. 確認 HTML 中有 `id="userStatusIndicator"` 的元素
3. 檢查 `hasUsed` 參數是否為 `true`

### Q3: 按鈕文字沒有動態變更？

**原因**: `heroLoginBtn.textContent` 未正確設置

**解決方案**:
1. 檢查 `showHero()` 方法中的按鈕文字設置邏輯
2. 確認 `hasUsed` 判斷是否正確
3. 使用瀏覽器開發者工具檢查按鈕元素

### Q4: 登出後還是顯示「繼續使用」？

**原因**: `logout()` 方法未清除所有必要的 localStorage 項目

**解決方案**:
1. 確認 `logout()` 方法清除了 `procurement_has_entered`
2. 確認 `logout()` 方法清除了 `procurement_last_used`
3. 確認重新載入頁面後 `hasUsedBefore()` 返回 `false`

---

## 🔄 優化歷史

### v2.0 (2025-12-13) - 四大優化

#### 1. 保留「開始使用」按鈕

**問題**: 回到首頁後，用戶無法直接回到應用程式

**解決**: 保留「開始使用」按鈕，只隱藏「登入」按鈕

**效果**: 用戶可以隨時從首頁回到應用程式

#### 2. 動態按鈕文字

**問題**: 按鈕文字不能反映用戶狀態

**解決**: 根據用戶狀態動態變更按鈕文字
- 首次訪問：「開始使用」
- 已使用過：「繼續使用」

**效果**: 提供更清晰的用戶引導

#### 3. 用戶狀態指示

**問題**: 用戶不知道上次使用時間和草稿數量

**解決**: 在首頁顯示用戶狀態指示
- 上次使用時間（智能格式化）
- 草稿數量

**效果**: 提供有用的用戶資訊，提升體驗

#### 4. 更精細的狀態管理

**問題**: 狀態判斷邏輯簡單，難以擴展

**解決**: 使用狀態機模式管理用戶狀態
- 定義 `UserState` 常量
- 實現 `getUserState()` 方法
- 明確狀態優先級

**效果**: 程式碼更清晰，易於維護和擴展

---

## 📚 相關文件

- [Bug 修復歷史](../bugfix/BUGFIX_HISTORY.md) - 查看相關 Bug 修復記錄
- [部署指南](../deployment/deployment-guide.md) - 了解如何部署系統
- [測試報告](../testing/core-features-test-2025-12-13.md) - 查看功能測試結果

---

## 📝 變更歷史

### v2.0 (2025-12-13)

**新增功能**:
- ✅ 保留「開始使用」按鈕，動態變更為「繼續使用」
- ✅ 用戶狀態指示（上次使用時間、草稿數量）
- ✅ 狀態機管理（UserState 常量）
- ✅ `getUserState()` 方法
- ✅ `updateUserStatusIndicator()` 方法

**改進**:
- ✅ 優化 `showHero()` 方法，支援動態按鈕文字
- ✅ 優化 `showApp()` 方法，記錄上次使用時間
- ✅ 優化 `logout()` 方法，清除上次使用時間

### v1.0 (2025-12-13)

**初始版本**:
- ✅ 基本的登入狀態管理
- ✅ `hasUsedBefore()` 方法
- ✅ `showHero()` 和 `showApp()` 方法
- ✅ `logout()` 方法

---

## 💡 總結

登入狀態管理是 Agent 智簽公文系統的核心功能之一，通過智能的狀態判斷和動態的 UI 調整，為用戶提供流暢的使用體驗。

**核心優勢**:
1. **智能判斷** - 自動識別用戶狀態，無需手動配置
2. **動態 UI** - 根據狀態動態調整按鈕文字和顯示
3. **狀態指示** - 提供有用的用戶資訊（上次使用時間、草稿數量）
4. **狀態機** - 使用狀態機模式，易於擴展和維護

**最佳實踐**:
- 使用 localStorage 持久化用戶狀態
- 提供清晰的狀態轉換邏輯
- 優化用戶體驗，減少不必要的操作
- 保持程式碼簡潔、易於維護

---

**文件版本**: 2.0  
**最後更新**: 2025-12-13  
**維護者**: Agent 智簽公文開發團隊
