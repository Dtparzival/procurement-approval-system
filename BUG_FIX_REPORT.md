# Bug 修復報告

## 問題描述

**Bug ID**: 草稿刪除後無法重新儲存相同內容

**嚴重程度**: 中等

**影響範圍**: 草稿管理功能

### 問題現象

當用戶執行以下操作時會遇到問題：
1. 儲存一個草稿
2. 刪除該草稿
3. 嘗試再次儲存相同的內容

**預期行為**: 應該能夠成功儲存新草稿

**實際行為**: 草稿無法儲存，localStorage 中沒有新增任何記錄

## 根本原因分析

經過詳細調查，發現了兩個主要問題：

### 1. localStorage Key 不一致

在 `js/storage.js` 中，不同方法使用了不一致的 localStorage key：

- `saveDraft()` 使用：`this.getUserKey(CONFIG.STORAGE.DRAFTS)` ✅
- `deleteDraft()` 使用：`CONFIG.STORAGE.DRAFTS` ❌
- `deleteHistory()` 使用：`CONFIG.STORAGE.HISTORY` ❌
- `importData()` 使用：`CONFIG.STORAGE.DRAFTS` 和 `CONFIG.STORAGE.HISTORY` ❌

這導致刪除操作和儲存操作使用了不同的 key，造成數據不一致。

### 2. saveDraft() 返回值錯誤

在 `saveDraft()` 方法中，無論更新哪個草稿，都返回 `drafts[0]`（第一個草稿），而不是實際操作的草稿對象。這導致：
- 更新非第一個草稿時，返回錯誤的草稿對象
- 創建新草稿時，沒有明確返回新創建的草稿

## 修復方案

### 修改文件：`js/storage.js`

#### 1. 修復 `saveDraft()` 方法（第 66-111 行）

**修改前**：
```javascript
saveDraft(draft) {
    const drafts = this.getDrafts();
    const timestamp = new Date().toISOString();

    if (draft.id) {
        const index = drafts.findIndex(d => d.id === draft.id);
        if (index !== -1) {
            drafts[index] = {
                ...drafts[index],
                ...draft,
                updatedAt: timestamp
            };
        } else {
            const newDraft = {
                id: Date.now(),
                title: draft.title || '未命名草稿',
                userInput: draft.userInput,
                attachments: draft.attachments || [],
                createdAt: timestamp,
                updatedAt: timestamp
            };
            drafts.unshift(newDraft);
        }
    } else {
        const newDraft = {
            id: Date.now(),
            title: draft.title || '未命名草稿',
            userInput: draft.userInput,
            attachments: draft.attachments || [],
            createdAt: timestamp,
            updatedAt: timestamp
        };
        drafts.unshift(newDraft);
    }

    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(drafts));
    return drafts[0];  // ❌ 總是返回第一個草稿
}
```

**修改後**：
```javascript
saveDraft(draft) {
    const drafts = this.getDrafts();
    const timestamp = new Date().toISOString();
    let savedDraft;  // ✅ 追蹤實際儲存的草稿

    if (draft.id) {
        const index = drafts.findIndex(d => d.id === draft.id);
        if (index !== -1) {
            // 草稿存在，更新它
            drafts[index] = {
                ...drafts[index],
                ...draft,
                updatedAt: timestamp
            };
            savedDraft = drafts[index];  // ✅ 返回更新的草稿
        } else {
            // 草稿不存在（可能已被刪除），創建新草稿
            const newDraft = {
                id: Date.now(),
                title: draft.title || '未命名草稿',
                userInput: draft.userInput,
                attachments: draft.attachments || [],
                createdAt: timestamp,
                updatedAt: timestamp
            };
            drafts.unshift(newDraft);
            savedDraft = newDraft;  // ✅ 返回新創建的草稿
        }
    } else {
        const newDraft = {
            id: Date.now(),
            title: draft.title || '未命名草稿',
            userInput: draft.userInput,
            attachments: draft.attachments || [],
            createdAt: timestamp,
            updatedAt: timestamp
        };
        drafts.unshift(newDraft);
        savedDraft = newDraft;  // ✅ 返回新創建的草稿
    }

    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(drafts));
    return savedDraft;  // ✅ 返回實際儲存的草稿
}
```

#### 2. 修復 `deleteDraft()` 方法（第 116-120 行）

**修改前**：
```javascript
deleteDraft(id) {
    const drafts = this.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(CONFIG.STORAGE.DRAFTS, JSON.stringify(filtered));  // ❌
}
```

**修改後**：
```javascript
deleteDraft(id) {
    const drafts = this.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(filtered));  // ✅
}
```

#### 3. 修復 `deleteHistory()` 方法（第 195-199 行）

**修改前**：
```javascript
deleteHistory(id) {
    const history = this.getHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(CONFIG.STORAGE.HISTORY, JSON.stringify(filtered));  // ❌
}
```

**修改後**：
```javascript
deleteHistory(id) {
    const history = this.getHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(filtered));  // ✅
}
```

#### 4. 修復 `importData()` 方法（第 253-259 行）

**修改前**：
```javascript
importData(data) {
    if (data.drafts) {
        localStorage.setItem(CONFIG.STORAGE.DRAFTS, JSON.stringify(data.drafts));  // ❌
    }
    if (data.history) {
        localStorage.setItem(CONFIG.STORAGE.HISTORY, JSON.stringify(data.history));  // ❌
    }
    // ...
}
```

**修改後**：
```javascript
importData(data) {
    if (data.drafts) {
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(data.drafts));  // ✅
    }
    if (data.history) {
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(data.history));  // ✅
    }
    // ...
}
```

## 測試驗證

### 測試場景

1. **儲存草稿** → ✅ 成功
2. **刪除草稿** → ✅ 成功
3. **再次儲存相同內容** → ✅ 成功（之前失敗）

### 測試結果

- 刪除前：4 個草稿
- 刪除後：3 個草稿
- 再次儲存後：4 個草稿 ✅

草稿成功重新儲存，時間戳更新為最新時間。

## 影響評估

### 修復的功能

1. ✅ 草稿刪除後可以重新儲存相同內容
2. ✅ localStorage key 使用一致
3. ✅ `saveDraft()` 返回正確的草稿對象
4. ✅ 歷史記錄刪除功能（預防性修復）
5. ✅ 數據導入功能（預防性修復）

### 向後兼容性

- ✅ 完全向後兼容
- ✅ 不影響現有數據
- ✅ 不需要數據遷移

## 部署建議

1. 建議立即部署到生產環境
2. 不需要特殊的部署步驟
3. 用戶無需清除瀏覽器緩存

## 相關文件

- 修改文件：`js/storage.js`
- 測試文件：無（手動測試）
- 文檔更新：無需更新

## 修復日期

2025-12-13

## 修復人員

Agent 智簽公文開發團隊
