// Google Authentication Module

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
        // 清除用戶資訊
        localStorage.removeItem('current_user');
        
        // 重新載入頁面
        window.location.reload();
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
        
        // 如果使用者已登入，隱藏登入按鈕
        const isLoggedIn = this.getCurrentUser() !== null;
        const loginBtn = document.getElementById('loginBtn');
        const heroLoginBtn = document.getElementById('heroLoginBtn');
        
        if (loginBtn) {
            if (isLoggedIn) {
                loginBtn.classList.add('hidden');
            } else {
                loginBtn.classList.remove('hidden');
            }
        }
        
        if (heroLoginBtn) {
            if (isLoggedIn) {
                heroLoginBtn.classList.add('hidden');
            } else {
                heroLoginBtn.classList.remove('hidden');
            }
        }
    },
    
    /**
     * 顯示應用程式
     */
    showApp() {
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
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
     * 檢查 localStorage 中是否有任何資料（API Key、草稿、歷史記錄）
     */
    hasUsedBefore() {
        const apiKey = localStorage.getItem('procurement_api_key');
        const drafts = localStorage.getItem('procurement_drafts');
        const history = localStorage.getItem('procurement_history');
        
        return !!(apiKey || drafts || history);
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
