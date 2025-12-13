# Google OAuth 實作指南

> **完整的程式碼範例和實作說明**

本文件提供 DEV 分支靜態網頁中 Google OAuth 2.0 登入功能的詳細實作說明，包含完整的程式碼片段和逐步解釋。

---

## 📋 目錄

1. [架構概覽](#架構概覽)
2. [前端實作](#前端實作)
3. [認證模組](#認證模組)
4. [儲存管理](#儲存管理)
5. [UI 整合](#ui-整合)
6. [完整流程](#完整流程)
7. [錯誤處理](#錯誤處理)
8. [最佳實踐](#最佳實踐)

---

## 架構概覽

### 技術棧

- **Google Identity Services**: Google 官方的 OAuth 2.0 認證服務
- **JWT (JSON Web Token)**: 用於傳遞用戶資訊
- **localStorage**: 瀏覽器本地儲存，用於保存用戶狀態
- **純 JavaScript**: 無需任何框架或後端

### 資料流程

```
1. 用戶點擊登入按鈕
   ↓
2. 顯示 Google 登入對話框
   ↓
3. 用戶選擇 Google 帳號並授權
   ↓
4. Google 返回 JWT Token
   ↓
5. 解析 Token 取得用戶資訊
   ↓
6. 儲存用戶資訊到 localStorage
   ↓
7. 更新 UI 顯示用戶資料
   ↓
8. 載入用戶的草稿和歷史記錄
```

### 檔案結構

```
procurement-approval-system/
├── index.html              # 包含 Google Sign-In 按鈕
├── js/
│   ├── auth.js            # 認證模組（核心）
│   ├── storage.js         # 儲存管理（支援多用戶）
│   ├── ui.js              # UI 更新
│   └── app.js             # 主應用程式
└── css/
    └── style.css          # 樣式
```

---

## 前端實作

### 步驟 1: 載入 Google Identity Services

在 `index.html` 的 `<head>` 區塊加入 Google Identity Services 腳本：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent 智簽公文</title>
    
    <!-- Google Identity Services -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    
    <!-- 其他腳本... -->
</head>
```

**說明**:
- `async defer`: 非同步載入，不阻塞頁面渲染
- 必須在其他 JavaScript 之前載入

### 步驟 2: 設定 Google Sign-In 初始化

在登入對話框中加入 Google Sign-In 初始化配置：

```html
<!-- 登入對話框 -->
<div id="loginDialog" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <!-- 對話框標題 -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4">
                <i data-lucide="file-text" class="w-8 h-8 text-white"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">歡迎使用</h3>
            <p class="text-gray-600 mb-6">請登入以繼續使用</p>
        </div>
        
        <!-- Google Sign-In 初始化 -->
        <div id="g_id_onload"
             data-client_id="YOUR_GOOGLE_CLIENT_ID"
             data-callback="handleCredentialResponse"
             data-auto_prompt="false">
        </div>
        
        <!-- Google Sign-In 按鈕 -->
        <div class="g_id_signin"
             data-type="standard"
             data-size="large"
             data-theme="outline"
             data-text="sign_in_with"
             data-shape="rectangular"
             data-logo_alignment="left"
             data-width="320">
        </div>
        
        <!-- 服務條款 -->
        <p class="text-sm text-gray-500 text-center mt-6">
            登入即表示您同意我們的
            <a href="#" class="text-blue-600 hover:underline">服務條款</a>
            和
            <a href="#" class="text-blue-600 hover:underline">隱私政策</a>
        </p>
        
        <!-- 關閉按鈕 -->
        <button id="closeLoginDialog" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
    </div>
</div>
```

**配置說明**:

#### `g_id_onload` 屬性

| 屬性 | 值 | 說明 |
|------|-----|------|
| `data-client_id` | `YOUR_GOOGLE_CLIENT_ID` | **必填**，您的 Google OAuth Client ID |
| `data-callback` | `handleCredentialResponse` | **必填**，登入成功後的回調函數名稱 |
| `data-auto_prompt` | `false` | 是否自動顯示登入提示（建議設為 false） |

#### `g_id_signin` 屬性（按鈕樣式）

| 屬性 | 可選值 | 說明 |
|------|--------|------|
| `data-type` | `standard` \| `icon` | 按鈕類型 |
| `data-size` | `large` \| `medium` \| `small` | 按鈕大小 |
| `data-theme` | `outline` \| `filled_blue` \| `filled_black` | 按鈕主題 |
| `data-text` | `sign_in_with` \| `signup_with` \| `continue_with` | 按鈕文字 |
| `data-shape` | `rectangular` \| `pill` \| `circle` | 按鈕形狀 |
| `data-logo_alignment` | `left` \| `center` | Logo 對齊方式 |
| `data-width` | 數字（px） | 按鈕寬度 |

### 步驟 3: 設定登入按鈕事件

在 `js/app.js` 或 `index.html` 的 `<script>` 區塊中：

```javascript
// 登入按鈕事件
document.getElementById('loginBtn').addEventListener('click', () => {
    UI.showLoginDialog();
});

document.getElementById('heroLoginBtn').addEventListener('click', () => {
    UI.showLoginDialog();
});

// 關閉登入對話框
document.getElementById('closeLoginDialog').addEventListener('click', () => {
    UI.hideLoginDialog();
});
```

---

## 認證模組

### 完整的 `js/auth.js` 實作

```javascript
// Google Authentication Module

const Auth = {
    // Google Client ID (需要替換為實際的 Client ID)
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    
    /**
     * 初始化 Google 認證
     */
    init() {
        // 檢查是否已登入
        const user = this.getCurrentUser();
        if (user) {
            // 已登入：顯示應用程式
            this.showApp();
            this.updateUserUI(user);
        } else {
            // 未登入：顯示 Hero 區塊
            this.showHero();
        }
        
        // 設定 Google Sign-In 回調
        // 這個函數會在用戶登入成功後被 Google Identity Services 呼叫
        window.handleCredentialResponse = this.handleCredentialResponse.bind(this);
    },
    
    /**
     * 處理 Google 登入回應
     * @param {Object} response - Google 返回的認證回應
     */
    async handleCredentialResponse(response) {
        try {
            // 1. 取得 JWT token
            const credential = response.credential;
            
            // 2. 解析 JWT token 取得用戶資訊
            const payload = this.parseJwt(credential);
            
            if (!payload) {
                throw new Error('無法解析用戶資訊');
            }
            
            // 3. 建立用戶物件
            const user = {
                id: payload.sub,              // Google 用戶 ID
                email: payload.email,          // Email
                name: payload.name,            // 姓名
                picture: payload.picture,      // 頭像 URL
                credential: credential,        // JWT token（用於驗證）
                loginTime: Date.now()          // 登入時間
            };
            
            // 4. 儲存用戶資訊到 localStorage
            this.setCurrentUser(user);
            
            // 5. 更新 UI
            this.showApp();
            this.updateUserUI(user);
            
            // 6. 關閉登入對話框
            UI.hideLoginDialog();
            
            // 7. 顯示歡迎訊息
            UI.showToast(`歡迎回來，${user.name}！`, 'success');
            
            // 8. 載入用戶的草稿和歷史記錄
            Storage.loadUserData(user.id);
            
        } catch (error) {
            console.error('Login error:', error);
            UI.showToast('登入失敗，請稍後再試', 'error');
        }
    },
    
    /**
     * 解析 JWT token
     * @param {string} token - JWT token 字串
     * @returns {Object|null} 解析後的 payload 或 null
     */
    parseJwt(token) {
        try {
            // JWT 格式: header.payload.signature
            // 我們只需要 payload 部分
            const base64Url = token.split('.')[1];
            
            // Base64Url 轉 Base64
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // Base64 解碼
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            
            // 解析 JSON
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('JWT parse error:', error);
            return null;
        }
    },
    
    /**
     * 登出
     */
    logout() {
        // 確認登出
        if (confirm('確定要登出嗎？')) {
            // 清除用戶資訊
            localStorage.removeItem('current_user');
            
            // 清除用戶的草稿和歷史記錄（可選）
            // localStorage.clear();
            
            // 重新載入頁面
            window.location.reload();
        }
    },
    
    /**
     * 取得當前用戶
     * @returns {Object|null} 用戶物件或 null
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('current_user');
        if (!userStr) return null;
        
        try {
            const user = JSON.parse(userStr);
            
            // 檢查登入是否過期（可選，例如 7 天）
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
            if (user.loginTime && Date.now() - user.loginTime > SEVEN_DAYS) {
                // 登入已過期
                this.logout();
                return null;
            }
            
            return user;
        } catch (error) {
            console.error('Parse user error:', error);
            return null;
        }
    },
    
    /**
     * 設定當前用戶
     * @param {Object} user - 用戶物件
     */
    setCurrentUser(user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    },
    
    /**
     * 顯示 Hero 區塊（未登入狀態）
     */
    showHero() {
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('appSection').classList.add('hidden');
    },
    
    /**
     * 顯示應用程式（已登入狀態）
     */
    showApp() {
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
    },
    
    /**
     * 更新用戶 UI
     * @param {Object} user - 用戶物件
     */
    updateUserUI(user) {
        // 更新頭像
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.src = user.picture;
            avatar.alt = user.name;
        }
        
        // 更新用戶名稱
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name;
        }
        
        // 更新用戶 Email
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = user.email;
        }
    },
    
    /**
     * 檢查是否已登入
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    /**
     * 取得用戶 ID
     * @returns {string|null}
     */
    getUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },
    
    /**
     * 取得用戶資訊
     * @returns {Object|null}
     */
    getUserInfo() {
        return this.getCurrentUser();
    }
};

// 頁面載入時初始化認證
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
```

### JWT Token Payload 結構

Google 返回的 JWT Token 解析後包含以下資訊：

```json
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",                    // 用戶 ID
  "email": "user@example.com",            // Email
  "email_verified": true,                 // Email 是否已驗證
  "name": "張三",                         // 姓名
  "picture": "https://lh3.googleusercontent.com/...",  // 頭像 URL
  "given_name": "三",                     // 名
  "family_name": "張",                    // 姓
  "locale": "zh-TW",                      // 語言
  "iat": 1234567890,                      // 發行時間
  "exp": 1234571490                       // 過期時間
}
```

---

## 儲存管理

### 更新 `js/storage.js` 支援多用戶

```javascript
// Storage Management Module with Multi-User Support

const Storage = {
    /**
     * 取得用戶專屬的 key
     * @param {string} userId - 用戶 ID
     * @param {string} key - 原始 key
     * @returns {string} 用戶專屬的 key
     */
    getUserKey(userId, key) {
        return userId ? `user_${userId}_${key}` : key;
    },
    
    /**
     * 儲存 API Key
     * @param {string} userId - 用戶 ID
     * @param {string} apiKey - API Key
     */
    saveApiKey(userId, apiKey) {
        const key = this.getUserKey(userId, 'api_key');
        localStorage.setItem(key, apiKey);
    },
    
    /**
     * 取得 API Key
     * @param {string} userId - 用戶 ID
     * @returns {string|null}
     */
    getApiKey(userId) {
        const key = this.getUserKey(userId, 'api_key');
        return localStorage.getItem(key);
    },
    
    /**
     * 儲存草稿
     * @param {string} userId - 用戶 ID
     * @param {Object} draft - 草稿物件
     */
    saveDraft(userId, draft) {
        const key = this.getUserKey(userId, 'current_draft');
        draft.updatedAt = Date.now();
        localStorage.setItem(key, JSON.stringify(draft));
    },
    
    /**
     * 取得草稿
     * @param {string} userId - 用戶 ID
     * @returns {Object|null}
     */
    getDraft(userId) {
        const key = this.getUserKey(userId, 'current_draft');
        const draftStr = localStorage.getItem(key);
        if (!draftStr) return null;
        
        try {
            return JSON.parse(draftStr);
        } catch (error) {
            console.error('Parse draft error:', error);
            return null;
        }
    },
    
    /**
     * 儲存歷史記錄
     * @param {string} userId - 用戶 ID
     * @param {Object} record - 歷史記錄
     */
    saveHistory(userId, record) {
        const key = this.getUserKey(userId, 'history');
        const history = this.getHistory(userId);
        
        record.id = Date.now();
        record.createdAt = Date.now();
        
        history.unshift(record);
        
        // 限制歷史記錄數量（例如最多 50 筆）
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem(key, JSON.stringify(history));
    },
    
    /**
     * 取得歷史記錄
     * @param {string} userId - 用戶 ID
     * @returns {Array}
     */
    getHistory(userId) {
        const key = this.getUserKey(userId, 'history');
        const historyStr = localStorage.getItem(key);
        if (!historyStr) return [];
        
        try {
            return JSON.parse(historyStr);
        } catch (error) {
            console.error('Parse history error:', error);
            return [];
        }
    },
    
    /**
     * 刪除歷史記錄
     * @param {string} userId - 用戶 ID
     * @param {number} recordId - 記錄 ID
     */
    deleteHistory(userId, recordId) {
        const key = this.getUserKey(userId, 'history');
        const history = this.getHistory(userId);
        const filtered = history.filter(r => r.id !== recordId);
        localStorage.setItem(key, JSON.stringify(filtered));
    },
    
    /**
     * 載入用戶資料
     * @param {string} userId - 用戶 ID
     */
    loadUserData(userId) {
        // 載入 API Key
        const apiKey = this.getApiKey(userId);
        if (apiKey) {
            // 更新 UI 顯示 API Key 已設定
            UI.updateApiKeyStatus(true);
        }
        
        // 載入草稿
        const draft = this.getDraft(userId);
        if (draft) {
            UI.loadDraft(draft);
        }
        
        // 載入歷史記錄
        const history = this.getHistory(userId);
        UI.updateHistoryList(history);
    },
    
    /**
     * 清除用戶資料
     * @param {string} userId - 用戶 ID
     */
    clearUserData(userId) {
        const keys = ['api_key', 'current_draft', 'history'];
        keys.forEach(key => {
            const userKey = this.getUserKey(userId, key);
            localStorage.removeItem(userKey);
        });
    }
};
```

---

## UI 整合

### 已登入狀態的 Header

```html
<!-- 已登入狀態：應用程式區塊 -->
<div id="appSection" class="hidden min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                        <i data-lucide="file-text" class="w-6 h-6 text-white"></i>
                    </div>
                    <h1 class="text-xl font-bold text-gray-900">Agent 智簽公文</h1>
                </div>
                
                <!-- 用戶資訊 -->
                <div class="flex items-center gap-4">
                    <!-- 歷史記錄按鈕 -->
                    <button id="historyBtn" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <i data-lucide="history" class="w-5 h-5 text-gray-600"></i>
                    </button>
                    
                    <!-- 設定按鈕 -->
                    <button id="settingsBtn" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <i data-lucide="settings" class="w-5 h-5 text-gray-600"></i>
                    </button>
                    
                    <!-- 用戶選單 -->
                    <div class="relative">
                        <button id="userMenuBtn" class="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                            <img id="userAvatar" src="" alt="User" class="w-8 h-8 rounded-full">
                            <span id="userName" class="text-sm font-medium text-gray-700"></span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500"></i>
                        </button>
                        
                        <!-- 下拉選單 -->
                        <div id="userMenu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <div class="px-4 py-3 border-b border-gray-200">
                                <p class="text-sm font-medium text-gray-900" id="menuUserName"></p>
                                <p class="text-sm text-gray-500" id="menuUserEmail"></p>
                            </div>
                            <button id="logoutBtn" class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <i data-lucide="log-out" class="w-4 h-4"></i>
                                登出
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <!-- 主要內容 -->
    <main class="flex-1">
        <!-- 應用程式內容 -->
    </main>
</div>
```

### 用戶選單事件處理

```javascript
// 用戶選單切換
document.getElementById('userMenuBtn').addEventListener('click', () => {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
});

// 點擊外部關閉選單
document.addEventListener('click', (e) => {
    const menuBtn = document.getElementById('userMenuBtn');
    const menu = document.getElementById('userMenu');
    
    if (!menuBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// 登出按鈕
document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
});
```

---

## 完整流程

### 1. 頁面載入流程

```javascript
// 1. 頁面載入
document.addEventListener('DOMContentLoaded', () => {
    // 2. 初始化認證模組
    Auth.init();
    
    // 3. 檢查登入狀態
    const user = Auth.getCurrentUser();
    
    if (user) {
        // 4a. 已登入：顯示應用程式
        Auth.showApp();
        Auth.updateUserUI(user);
        Storage.loadUserData(user.id);
    } else {
        // 4b. 未登入：顯示 Hero 區塊
        Auth.showHero();
    }
    
    // 5. 初始化 Lucide Icons
    lucide.createIcons();
});
```

### 2. 登入流程

```javascript
// 1. 用戶點擊登入按鈕
document.getElementById('loginBtn').click();

// 2. 顯示登入對話框
UI.showLoginDialog();

// 3. Google Identity Services 載入並顯示登入按鈕

// 4. 用戶點擊 Google Sign-In 按鈕

// 5. Google 顯示帳號選擇對話框

// 6. 用戶選擇帳號並授權

// 7. Google 呼叫 handleCredentialResponse(response)
window.handleCredentialResponse = function(response) {
    // 8. 解析 JWT Token
    const payload = Auth.parseJwt(response.credential);
    
    // 9. 建立用戶物件
    const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        credential: response.credential,
        loginTime: Date.now()
    };
    
    // 10. 儲存用戶資訊
    Auth.setCurrentUser(user);
    
    // 11. 更新 UI
    Auth.showApp();
    Auth.updateUserUI(user);
    
    // 12. 關閉登入對話框
    UI.hideLoginDialog();
    
    // 13. 顯示歡迎訊息
    UI.showToast(`歡迎回來，${user.name}！`, 'success');
    
    // 14. 載入用戶資料
    Storage.loadUserData(user.id);
};
```

### 3. 登出流程

```javascript
// 1. 用戶點擊登出按鈕
document.getElementById('logoutBtn').click();

// 2. 確認登出
if (confirm('確定要登出嗎？')) {
    // 3. 清除用戶資訊
    localStorage.removeItem('current_user');
    
    // 4. 重新載入頁面
    window.location.reload();
    
    // 5. 頁面重新載入後，Auth.init() 檢測到未登入
    // 6. 顯示 Hero 區塊
}
```

---

## 錯誤處理

### 常見錯誤和解決方案

#### 1. `Uncaught ReferenceError: handleCredentialResponse is not defined`

**原因**: 回調函數未正確設定

**解決方案**:
```javascript
// 確保在頁面載入時設定回調函數
window.handleCredentialResponse = Auth.handleCredentialResponse.bind(Auth);

// 或在 Auth.init() 中設定
Auth.init = function() {
    window.handleCredentialResponse = this.handleCredentialResponse.bind(this);
    // ...
};
```

#### 2. `Error 400: redirect_uri_mismatch`

**原因**: 授權的 JavaScript 來源設定不正確

**解決方案**:
1. 前往 Google Cloud Console
2. 檢查「已授權的 JavaScript 來源」
3. 確保包含當前網址（包括 protocol 和 port）
4. 範例: `http://localhost:8000`, `https://yourdomain.com`

#### 3. JWT Token 解析失敗

**原因**: Token 格式不正確或損壞

**解決方案**:
```javascript
parseJwt(token) {
    try {
        // 檢查 token 格式
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid token format');
        }
        
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT structure');
        }
        
        // 解析 payload
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('JWT parse error:', error);
        return null;
    }
}
```

#### 4. localStorage 配額超出

**原因**: 儲存的資料過多

**解決方案**:
```javascript
// 限制歷史記錄數量
saveHistory(userId, record) {
    const history = this.getHistory(userId);
    history.unshift(record);
    
    // 最多保留 50 筆
    if (history.length > 50) {
        history.splice(50);
    }
    
    try {
        const key = this.getUserKey(userId, 'history');
        localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            // 清除舊記錄
            history.splice(25);
            localStorage.setItem(key, JSON.stringify(history));
        }
    }
}
```

---

## 最佳實踐

### 1. 安全性

#### 不要在前端儲存敏感資訊
```javascript
// ❌ 錯誤：儲存完整的 credential
const user = {
    credential: response.credential  // JWT token 包含敏感資訊
};

// ✅ 正確：只儲存必要資訊
const user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture
    // 不儲存 credential
};
```

#### 驗證 Token 有效性
```javascript
getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('current_user'));
    
    // 檢查登入是否過期（7 天）
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (user.loginTime && Date.now() - user.loginTime > SEVEN_DAYS) {
        this.logout();
        return null;
    }
    
    return user;
}
```

### 2. 用戶體驗

#### 自動儲存草稿
```javascript
// 每 30 秒自動儲存
setInterval(() => {
    const userId = Auth.getUserId();
    if (userId) {
        const draft = {
            requirement: document.getElementById('requirement').value,
            result: document.getElementById('result').value
        };
        Storage.saveDraft(userId, draft);
    }
}, 30000);
```

#### 載入狀態提示
```javascript
async handleCredentialResponse(response) {
    // 顯示載入中
    UI.showLoading('登入中...');
    
    try {
        // 處理登入...
        
        // 隱藏載入中
        UI.hideLoading();
        
        // 顯示成功訊息
        UI.showToast('登入成功！', 'success');
    } catch (error) {
        UI.hideLoading();
        UI.showToast('登入失敗', 'error');
    }
}
```

### 3. 效能優化

#### 延遲載入 Google Identity Services
```html
<!-- 使用 async defer 延遲載入 -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### 快取用戶資訊
```javascript
// 使用記憶體快取減少 localStorage 讀取
const userCache = {
    user: null,
    
    get() {
        if (!this.user) {
            this.user = Auth.getCurrentUser();
        }
        return this.user;
    },
    
    set(user) {
        this.user = user;
        Auth.setCurrentUser(user);
    },
    
    clear() {
        this.user = null;
        localStorage.removeItem('current_user');
    }
};
```

### 4. 錯誤追蹤

#### 記錄錯誤日誌
```javascript
handleCredentialResponse(response) {
    try {
        // 處理登入...
    } catch (error) {
        // 記錄錯誤
        console.error('Login error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // 顯示友善的錯誤訊息
        UI.showToast('登入失敗，請稍後再試', 'error');
    }
}
```

---

## 測試檢查清單

- [ ] Google Client ID 已正確設定
- [ ] 授權的 JavaScript 來源包含測試網址
- [ ] 登入按鈕正常顯示
- [ ] 點擊登入按鈕顯示 Google 登入對話框
- [ ] 選擇帳號後成功登入
- [ ] 用戶資訊正確顯示（頭像、姓名、Email）
- [ ] 登入後可以使用所有功能
- [ ] 重新載入頁面後仍保持登入狀態
- [ ] 登出功能正常運作
- [ ] 多用戶資料正確隔離
- [ ] 瀏覽器 Console 無錯誤訊息

---

## 參考資源

- [Google Identity Services 官方文件](https://developers.google.com/identity/gsi/web/guides/overview)
- [JWT 介紹](https://jwt.io/introduction)
- [OAuth 2.0 說明](https://developers.google.com/identity/protocols/oauth2)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**最後更新**: 2025-12-06  
**版本**: 1.0.0  
**作者**: AI 智能公文簽核系統團隊
