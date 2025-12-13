// Google Authentication Module

// 用戶狀態常量
const UserState = {
    FIRST_VISIT: 'first_visit',      // 首次訪問
    ENTERED: 'entered',               // 已進入應用程式
    HAS_DATA: 'has_data',            // 有資料（API Key/草稿/歷史）
    LOGGED_IN: 'logged_in'           // 已登入（Google OAuth）
};

const Auth = {
    // Google Client ID (需要替換為實際的 Client ID)
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    
    /**
     * 初始化 Google 認證
     */
    init() {
        // 檢查是否已經使用過系統（有 localStorage 資料）
        const hasUsedBefore = this.hasUsedBefore();
        
        if (hasUsedBefore) {
            // 如果使用過，直接顯示應用程式
            this.showApp();
        } else {
            // 如果是首次訪問，顯示 Hero 區塊
            this.showHero();
        }
        
        // 如果已登入，更新用戶 UI
        const user = this.getCurrentUser();
        if (user) {
            this.updateUserUI(user);
        }
        
        // 設定 Google Sign-In 回調
        window.handleCredentialResponse = this.handleCredentialResponse.bind(this);
    },
    
    /**
     * 處理 Google 登入回應
     */
    async handleCredentialResponse(response) {
        try {
            // 解析 JWT token
            const credential = response.credential;
            const payload = this.parseJwt(credential);
            
            // 建立用戶物件
            const user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                credential: credential
            };
            
            // 儲存用戶資訊
            this.setCurrentUser(user);
            
            // 更新 UI
            this.showApp();
            this.updateUserUI(user);
            
            // 關閉登入對話框
            UI.hideLoginDialog();
            
            // 顯示歡迎訊息
            UI.showToast(`歡迎回來，${user.name}！`, 'success');
            
            // 載入用戶的草稿和歷史記錄
            Storage.loadUserData(user.id);
            
        } catch (error) {
            console.error('Login error:', error);
            UI.showToast('登入失敗，請稍後再試', 'error');
        }
    },
    
    /**
     * 解析 JWT token
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
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
        // 清除所有 localStorage 資料
        localStorage.removeItem('current_user');
        localStorage.removeItem('procurement_has_entered');
        localStorage.removeItem('procurement_last_used');
        localStorage.removeItem('procurement_api_key');
        localStorage.removeItem('procurement_drafts');
        localStorage.removeItem('procurement_history');
        localStorage.removeItem('procurement_model');
        localStorage.removeItem('procurement_auto_save');
        
        // 清空頁面上的輸入欄位
        this.clearFormFields();
        
        // 顯示 Hero 區塊
        this.showHero();
    },
    
    /**
     * 取得當前用戶
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('current_user');
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Parse user error:', error);
            return null;
        }
    },
    
    /**
     * 設定當前用戶
     */
    setCurrentUser(user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    },
    
    /**
     * 顯示 Hero 區塊
     */
    showHero() {
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('appSection').classList.add('hidden');
        
        // 如果使用者已經使用過系統（有 localStorage 資料），隱藏登入按鈕
        const hasUsed = this.hasUsedBefore();
        const loginBtn = document.getElementById('loginBtn');
        const heroLoginBtn = document.getElementById('heroLoginBtn');
        
        if (loginBtn) {
            if (hasUsed) {
                loginBtn.classList.add('hidden');
            } else {
                loginBtn.classList.remove('hidden');
            }
        }
        
        if (heroLoginBtn) {
            // 保留「開始使用」按鈕，但根據狀態改變文字
            heroLoginBtn.classList.remove('hidden');
            if (hasUsed) {
                heroLoginBtn.textContent = '繼續使用';
            } else {
                heroLoginBtn.textContent = '開始使用';
            }
        }
        
        // 顯示用戶狀態指示（已使用過系統時）
        this.updateUserStatusIndicator(hasUsed);
    },
    
    /**
     * 顯示應用程式
     */
    showApp() {
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
        
        // 標記用戶已經進入應用程式（即使沒有 localStorage 資料）
        localStorage.setItem('procurement_has_entered', 'true');
        
        // 記錄上次使用時間
        localStorage.setItem('procurement_last_used', Date.now().toString());
    },
    
    /**
     * 更新用戶 UI
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
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    /**
     * 取得用戶 ID
     */
    getUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },
    
    /**
     * 檢查是否已經使用過系統
     * 檢查 localStorage 中是否有任何資料（API Key、草稿、歷史記錄、已進入標記）
     */
    hasUsedBefore() {
        const apiKey = localStorage.getItem('procurement_api_key');
        const drafts = localStorage.getItem('procurement_drafts');
        const history = localStorage.getItem('procurement_history');
        const hasEntered = localStorage.getItem('procurement_has_entered');
        
        return !!(apiKey || drafts || history || hasEntered);
    },
    
    /**
     * 清空表單欄位
     */
    clearFormFields() {
        // 清空草稿標題
        const draftTitle = document.getElementById('draftTitle');
        if (draftTitle) {
            draftTitle.value = '';
        }
        
        // 清空需求描述
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = '';
        }
        
        // 清空生成結果
        const resultContent = document.getElementById('resultContent');
        if (resultContent) {
            resultContent.innerHTML = '';
        }
        
        // 隱藏結果區塊
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.classList.add('hidden');
        }
    },
    
    /**
     * 獲取當前用戶狀態
     * @returns {string} 用戶狀態（UserState 常量）
     */
    getUserState() {
        // 優先級：LOGGED_IN > HAS_DATA > ENTERED > FIRST_VISIT
        
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
    },
    
    /**
     * 更新用戶狀態指示
     * @param {boolean} hasUsed - 是否已使用過系統
     */
    updateUserStatusIndicator(hasUsed) {
        const indicator = document.getElementById('userStatusIndicator');
        if (!indicator) return;
        
        if (hasUsed) {
            // 顯示用戶狀態指示
            indicator.classList.remove('hidden');
            
            // 更新上次使用時間
            const lastUsedTime = localStorage.getItem('procurement_last_used');
            const lastUsedTimeEl = document.getElementById('lastUsedTime');
            if (lastUsedTimeEl && lastUsedTime) {
                const date = new Date(parseInt(lastUsedTime));
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeStr;
                if (diffMins < 1) {
                    timeStr = '剛剛';
                } else if (diffMins < 60) {
                    timeStr = `${diffMins} 分鐘前`;
                } else if (diffHours < 24) {
                    timeStr = `${diffHours} 小時前`;
                } else if (diffDays < 7) {
                    timeStr = `${diffDays} 天前`;
                } else {
                    timeStr = date.toLocaleDateString('zh-TW');
                }
                
                lastUsedTimeEl.textContent = `上次使用：${timeStr}`;
            }
            
            // 更新草稿數量
            const draftsStr = localStorage.getItem('procurement_drafts');
            const draftCountEl = document.getElementById('draftCount');
            if (draftCountEl) {
                let count = 0;
                if (draftsStr) {
                    try {
                        const drafts = JSON.parse(draftsStr);
                        count = Array.isArray(drafts) ? drafts.length : 0;
                    } catch (e) {
                        count = 0;
                    }
                }
                draftCountEl.textContent = `草稿：${count} 個`;
            }
            
            // 更新 Lucide 圖示
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            // 隱藏用戶狀態指示
            indicator.classList.add('hidden');
        }
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
