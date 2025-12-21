// UI Management Module

const UI = {
    /**
     * 顯示錯誤狀態 UI
     */
    showErrorState(title, message) {
        // 隱藏其他狀態
        document.getElementById('emptyState')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('generatedContent')?.classList.add('hidden');
        document.getElementById('editMode')?.classList.add('hidden');
        document.getElementById('resultActions')?.classList.add('hidden');
        
        // 更新錯誤內容
        const errorTitle = document.getElementById('errorTitle');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorTitle) errorTitle.textContent = title || MESSAGES.DEFAULT.ERROR_TITLE;
        if (errorMessage) {
            // 處理換行符並轉換為 HTML
            errorMessage.innerHTML = (message || MESSAGES.DEFAULT.ERROR_MESSAGE).replace(/\n/g, '<br>');
        }
        
        // 顯示錯誤狀態
        const errorState = document.getElementById('errorState');
        if (errorState) {
            errorState.classList.remove('hidden');
            lucide.createIcons();
        }
    },
    
    /**
     * 隱藏錯誤狀態 UI
     */
    hideErrorState() {
        document.getElementById('errorState')?.classList.add('hidden');
    },
    
    /**
     * 從錯誤狀態返回空狀態
     */
    showEmptyStateFromError() {
        this.hideErrorState();
        document.getElementById('emptyState')?.classList.remove('hidden');
        // 聚焦到輸入框
        document.getElementById('userInput')?.focus();
    },
    
    /**
     * 更新字數統計
     */
    updateCharCount(textarea) {
        const charCountEl = document.getElementById('charCount');
        if (charCountEl && textarea) {
            const count = textarea.value.length;
            charCountEl.textContent = `${count} / 最少 10 個字元`;
        }
    },
    
    /**
     * 更新上次儲存時間
     */
    updateLastSaved() {
        const lastSavedEl = document.getElementById('lastSaved');
        if (lastSavedEl) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            lastSavedEl.innerHTML = `
                <i data-lucide="clock" class="w-3 h-3"></i>
                上次儲存: ${timeStr}
            `;
            lucide.createIcons();
        }
    },
    
    /**
     * 更新使用者資訊
     */
    updateUserInfo(user) {
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl && user) {
            userInfoEl.textContent = `歡迎, ${user.name || user.email || '使用者'}`;
        }
    },
    /**
     * 顯示 Toast 通知
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            info: 'info',
            warning: 'alert-triangle'
        };
        
        // 使用新的 toast 樣式類別
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="w-5 h-5 flex-shrink-0"></i>
            <span class="font-medium">${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.UI.TOAST_DURATION);
    },

    /**
     * 顯示錯誤訊息容器
     */
    showError(title, message, actions = []) {
        const container = document.createElement('div');
        container.className = 'error-container ai-shake';
        
        container.innerHTML = `
            <div class="error-icon">
                <i data-lucide="alert-circle" class="w-6 h-6"></i>
            </div>
            <div class="error-content">
                <div class="error-title">${title}</div>
                <div class="error-message">${message}</div>
                ${actions.length > 0 ? `
                    <div class="error-actions">
                        ${actions.map(action => `
                            <button onclick="${action.onClick}" class="px-3 py-1.5 text-sm font-medium rounded-md ${action.primary ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        return container;
    },

    /**
     * 顯示空狀態
     */
    showEmptyState(config) {
        const { icon = 'inbox', title, description, actionLabel, actionOnClick, compact = false } = config;
        
        const container = document.createElement('div');
        container.className = `empty-state ${compact ? 'empty-state-compact' : ''}`;
        
        container.innerHTML = `
            <div class="empty-state-icon">
                <i data-lucide="${icon}" class="w-16 h-16"></i>
            </div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-description">${description}</div>
            ${actionLabel ? `
                <button onclick="${actionOnClick}" class="empty-state-action px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    <span>${actionLabel}</span>
                </button>
            ` : ''}
        `;
        
        lucide.createIcons();
        return container;
    },

    /**
     * 顯示載入狀態
     */
    showLoading(text = '處理中...', type = 'block') {
        const container = document.createElement('div');
        
        if (type === 'page') {
            container.className = 'page-loading';
            container.innerHTML = `
                <div class="page-loading-spinner"></div>
                <div class="page-loading-text">${text}</div>
            `;
        } else if (type === 'block') {
            container.className = 'block-loading';
            container.innerHTML = `
                <div class="block-loading-spinner"></div>
            `;
        } else {
            container.className = 'inline-loading';
            container.innerHTML = `
                <div class="inline-loading-spinner"></div>
                <span>${text}</span>
            `;
        }
        
        return container;
    },

    /**
     * 顯示登入對話框
     */
    showLoginDialog() {
        document.getElementById('loginDialog').classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * 隱藏登入對話框
     */
    hideLoginDialog() {
        document.getElementById('loginDialog').classList.add('hidden');
    },

    /**
     * 顯示歷史記錄 Modal
     */
    showHistoryModal() {
        const modal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        
        const history = Storage.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '';
            emptyHistory.classList.remove('hidden');
        } else {
            emptyHistory.classList.add('hidden');
            historyList.innerHTML = history.map(item => `
                <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900">${item.title}</h3>
                        <button onclick="UI.deleteHistoryItem(${item.id})" class="text-red-500 hover:text-red-700">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">${item.userInput}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">${this.formatDate(item.createdAt)}</span>
                        <button onclick="UI.viewHistoryItem(${item.id})" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            查看
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // 禁用背景滾動，記錄當前滾動位置
        this._scrollY = window.scrollY;
        document.body.style.top = `-${this._scrollY}px`;
        document.body.classList.add('modal-open');
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * 隱藏歷史記錄 Modal
     */
    hideHistoryModal() {
        document.getElementById('historyModal').classList.add('hidden');
        // 恢復背景滾動和位置
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, this._scrollY || 0);
    },

    /**
     * 查看歷史記錄項目
     */
    viewHistoryItem(id) {
        const item = Storage.getHistoryById(id);
        if (!item) return;
        
        this.showApproval(item);
        this.hideHistoryModal();
    },

    /**
     * 刪除歷史記錄項目
     */
    deleteHistoryItem(id) {
        if (confirm('確定要刪除這筆記錄嗎？')) {
            Storage.deleteHistory(id);
            this.showHistoryModal(); // 重新整理列表
            this.showToast('已刪除歷史記錄', 'success');
        }
    },

    /**
     * 顯示設定 Modal
     */
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const modelSelect = document.getElementById('modelSelect');
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        
        // 載入當前設定
        apiKeyInput.value = Storage.getApiKey();
        const savedModel = Storage.getModel();
        modelSelect.value = savedModel;
        autoSaveToggle.checked = Storage.getAutoSave();
        
        // 更新自訂下拉選單的顯示
        this.setCustomSelectValue(savedModel);
        
        // 確保下拉選單預設為收合狀態
        this.closeCustomSelect();
        
        // 重新初始化下拉選單事件（確保每次打開設定時事件都正確綁定）
        const btn = document.getElementById('customSelectBtn');
        if (btn) {
            btn.dataset.initialized = 'false';
            this.initCustomSelect();
        }
        
        // 禁用背景捲動，記錄當前捲動位置
        this._scrollY = window.scrollY;
        document.body.style.top = `-${this._scrollY}px`;
        document.body.classList.add('modal-open');
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * 隱藏設定 Modal
     */
    hideSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
        // 恢復背景滾動和位置
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, this._scrollY || 0);
    },

    /**
     * 儲存設定
     */
    saveSettings() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const model = document.getElementById('modelSelect').value;
        const autoSave = document.getElementById('autoSaveToggle').checked;
        
        if (!apiKey) {
            this.showToast(MESSAGES.INPUT.EMPTY_API_KEY.message, 'error');
            return;
        }
        
        Storage.setApiKey(apiKey);
        Storage.setModel(model);
        Storage.setAutoSave(autoSave);
        
        this.hideSettingsModal();
        this.showToast(MESSAGES.SUCCESS.SAVE_SETTINGS, 'success');
    },

    /**
     * 顯示生成結果
     */
    showApproval(approval) {
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');
        const generatedContent = document.getElementById('generatedContent');
        const resultActions = document.getElementById('resultActions');
        
        emptyState.classList.add('hidden');
        loadingState.classList.add('hidden');
        generatedContent.classList.remove('hidden');
        resultActions.classList.remove('hidden');
        
        // 配置 marked.js 選項，優化 Markdown 渲染
        marked.setOptions({
            breaks: true,        // 將單個換行符轉換為 <br>
            gfm: true,           // 啟用 GitHub Flavored Markdown
            headerIds: false,    // 禁用標題 ID（避免 ID 衝突）
            mangle: false,       // 不混淆電子郵件連結
            sanitize: false,     // 不清理 HTML（允許內嵌 HTML）
        });
        
        // 預處理內容：確保段落間有適當的空行
        let processedContent = this.preprocessMarkdown(approval.content);
        
        // 渲染 Markdown
        generatedContent.innerHTML = marked.parse(processedContent);
        
        // 儲存當前簽呈資料
        this.currentApproval = approval;
        
        // 滾動到結果區域（行動裝置）
        if (window.innerWidth < 1024) {
            generatedContent.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 重新調整佈局對齊（確保內容顯示後滾動區域正確設定）
        if (typeof ProcurementApp !== 'undefined' && ProcurementApp.setupLayoutAlignment) {
            requestAnimationFrame(() => {
                ProcurementApp.setupLayoutAlignment();
            });
        }
        
        lucide.createIcons();
    },
    
    /**
     * 預處理 Markdown 內容
     * 確保分段、斷行等格式正確處理
     */
    preprocessMarkdown(content) {
        if (!content) return '';
        
        // 1. 標準化換行符（處理 Windows 和 Mac 的換行符）
        let processed = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 2. 確保標題前後有適當的空行
        processed = processed.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
        processed = processed.replace(/(#{1,6}\s[^\n]+)\n([^#\n])/g, '$1\n\n$2');
        
        // 3. 確保列表前後有適當的空行
        processed = processed.replace(/([^\n])\n([-*+]\s|\d+\.\s)/g, '$1\n\n$2');
        
        // 4. 確保引用區塊前後有適當的空行
        processed = processed.replace(/([^\n])\n(>\s)/g, '$1\n\n$2');
        
        // 5. 處理「【】」格式的標題（常見於中文公文）
        processed = processed.replace(/([^\n])\n(【[^】]+】)/g, '$1\n\n$2');
        processed = processed.replace(/(【[^】]+】[^\n]*)\n([^【\n])/g, '$1\n\n$2');
        
        // 6. 處理「一、二、三」等中文序號
        processed = processed.replace(/([^\n])\n([一二三四五六七八九十]+、)/g, '$1\n\n$2');
        
        // 7. 移除過多的連續空行（超過 2 個空行的情況）
        processed = processed.replace(/\n{4,}/g, '\n\n\n');
        
        return processed.trim();
    },

    /**
     * 顯示載入狀態
     */
    showLoading(message) {
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');
        const generatedContent = document.getElementById('generatedContent');
        const errorState = document.getElementById('errorState');
        const loadingText = document.getElementById('loadingText');
        
        emptyState?.classList.add('hidden');
        generatedContent?.classList.add('hidden');
        errorState?.classList.add('hidden');
        loadingState?.classList.remove('hidden');
        if (loadingText) loadingText.textContent = message;
        
        lucide.createIcons();
    },

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    },

    /**
     * 顯示空狀態
     */
    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');
        const generatedContent = document.getElementById('generatedContent');
        const errorState = document.getElementById('errorState');
        const resultActions = document.getElementById('resultActions');
        
        emptyState?.classList.remove('hidden');
        loadingState?.classList.add('hidden');
        generatedContent?.classList.add('hidden');
        errorState?.classList.add('hidden');
        resultActions?.classList.add('hidden');
        
        lucide.createIcons();
    },

    /**
     * 複製簽呈內容
     */
    async copyApproval() {
        if (!this.currentApproval) return;
        
        try {
            // 從顯示區域取得純文字內容（已經由 marked 轉換為 HTML）
            const generatedContent = document.getElementById('generatedContent');
            const plainText = generatedContent ? generatedContent.textContent : this.currentApproval.content;
            
            await navigator.clipboard.writeText(plainText);
            this.showToast(MESSAGES.SUCCESS.COPY, 'success');
            
            // 更新按鈕圖示
            const copyBtn = document.getElementById('copyBtn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已複製';
            lucide.createIcons();
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                lucide.createIcons();
            }, 2000);
        } catch (error) {
            this.showToast(MESSAGES.UI.COPY_FAILED.message, 'error');
        }
    },

    /**
     * 編輯簽呈
     */
    editApproval() {
        if (!this.currentApproval) return;
        
        const generatedContent = document.getElementById('generatedContent');
        const editMode = document.getElementById('editMode');
        const editTextarea = document.getElementById('editTextarea');
        
        generatedContent.classList.add('hidden');
        editMode.classList.remove('hidden');
        editTextarea.value = this.currentApproval.content;
        
        lucide.createIcons();
    },

    /**
     * 儲存編輯
     */
    saveEdit() {
        const editTextarea = document.getElementById('editTextarea');
        const content = editTextarea.value.trim();
        
        if (!content) {
            this.showToast(MESSAGES.INPUT.EMPTY_CONTENT.message, 'error');
            return;
        }
        
        this.currentApproval.content = content;
        this.cancelEdit();
        this.showApproval(this.currentApproval);
        this.showToast(MESSAGES.SUCCESS.SAVE_EDIT, 'success');
    },

    /**
     * 取消編輯
     */
    cancelEdit() {
        const generatedContent = document.getElementById('generatedContent');
        const editMode = document.getElementById('editMode');
        
        editMode.classList.add('hidden');
        generatedContent.classList.remove('hidden');
        
        lucide.createIcons();
    },

    /**
     * 顯示上傳的檔案
     */
    showUploadedFile(file) {
        const filesList = document.getElementById('uploadedFilesList');
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        fileDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <i data-lucide="file" class="w-4 h-4 text-gray-500"></i>
                <span class="text-sm text-gray-700">${file.fileName}</span>
                <span class="text-xs text-gray-500">(${this.formatFileSize(file.fileSize)})</span>
            </div>
            <button onclick="UI.removeUploadedFile(this)" class="text-red-500 hover:text-red-700">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        `;
        filesList.appendChild(fileDiv);
        lucide.createIcons();
    },

    /**
     * 移除上傳的檔案
     */
    removeUploadedFile(button) {
        button.closest('div').remove();
    },

    /**
     * 格式化檔案大小
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 小於 1 分鐘
        if (diff < 60000) {
            return '剛剛';
        }
        
        // 小於 1 小時
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} 分鐘前`;
        }
        
        // 小於 1 天
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} 小時前`;
        }
        
        // 小於 7 天
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} 天前`;
        }
        
        // 顯示完整日期
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 切換用戶選單
     */
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');
    },

    /**
     * 初始化自訂下拉選單
     */
    initCustomSelect() {
        const container = document.getElementById('customModelSelect');
        const btn = document.getElementById('customSelectBtn');
        const dropdown = document.getElementById('customSelectDropdown');
        const hiddenInput = document.getElementById('modelSelect');
        const selectedText = document.getElementById('selectedModelText');
        const options = document.querySelectorAll('.custom-select-option');
        
        if (!container || !btn || !dropdown) return;
        
        // 避免重複綁定事件
        if (btn.dataset.initialized === 'true') return;
        btn.dataset.initialized = 'true';
        
        // 點擊按鈕切換下拉選單
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = !dropdown.classList.contains('hidden');
            if (isOpen) {
                this.closeCustomSelect();
            } else {
                this.openCustomSelect();
            }
        });
        
        // 點擊選項
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.querySelector('.font-medium').textContent;
                const badge = option.querySelector('span[class*="bg-"]')?.textContent || '';
                
                // 更新隱藏輸入框的值
                hiddenInput.value = value;
                
                // 更新顯示文字
                selectedText.textContent = badge ? `${text} (${badge})` : text;
                
                // 更新勾選狀態
                options.forEach(opt => {
                    const checkIcon = opt.querySelector('.check-icon');
                    if (opt.dataset.value === value) {
                        opt.classList.add('selected');
                        checkIcon?.classList.remove('hidden');
                    } else {
                        opt.classList.remove('selected');
                        checkIcon?.classList.add('hidden');
                    }
                });
                
                // 關閉下拉選單
                this.closeCustomSelect();
            });
        });
        
        // 點擊外部關閉下拉選單（使用 mousedown 避免與 click 事件衝突）
        document.addEventListener('mousedown', (e) => {
            // 如果點擊的是按鈕或下拉選單內部，不關閉
            if (container.contains(e.target)) {
                return;
            }
            // 延遲關閉，確保按鈕的 click 事件先執行
            setTimeout(() => {
                this.closeCustomSelect();
            }, 10);
        });
        
        // 鍵盤導航
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            } else if (e.key === 'Escape') {
                this.closeCustomSelect();
            }
        });
    },
    
    /**
     * 切換自訂下拉選單
     */
    toggleCustomSelect() {
        const dropdown = document.getElementById('customSelectDropdown');
        if (!dropdown) return;
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
            this.closeCustomSelect();
        } else {
            this.openCustomSelect();
        }
    },
    
    /**
     * 打開自訂下拉選單
     */
    openCustomSelect() {
        const container = document.getElementById('customModelSelect');
        const dropdown = document.getElementById('customSelectDropdown');
        const arrow = document.getElementById('selectArrow');
        if (!dropdown) return;
        container?.classList.add('open');
        dropdown.classList.remove('hidden');
        arrow?.classList.add('rotate-180');
    },
    
    /**
     * 關閉自訂下拉選單
     */
    closeCustomSelect() {
        const container = document.getElementById('customModelSelect');
        const dropdown = document.getElementById('customSelectDropdown');
        const arrow = document.getElementById('selectArrow');
        container?.classList.remove('open');
        dropdown?.classList.add('hidden');
        arrow?.classList.remove('rotate-180');
    },
    
    /**
     * 設定自訂下拉選單的值
     */
    setCustomSelectValue(value) {
        const hiddenInput = document.getElementById('modelSelect');
        const selectedText = document.getElementById('selectedModelText');
        const options = document.querySelectorAll('.custom-select-option');
        
        if (!hiddenInput) return;
        
        hiddenInput.value = value;
        
        options.forEach(option => {
            const checkIcon = option.querySelector('.check-icon');
            if (option.dataset.value === value) {
                const text = option.querySelector('.font-medium').textContent;
                const badge = option.querySelector('span[class*="bg-"]')?.textContent || '';
                selectedText.textContent = badge ? `${text} (${badge})` : text;
                option.classList.add('selected');
                checkIcon?.classList.remove('hidden');
            } else {
                option.classList.remove('selected');
                checkIcon?.classList.add('hidden');
            }
        });
    },

    /**
     * 初始化事件監聽器
     */
    initEventListeners() {
        // 登入按鈕 - 直接進入主要功能頁面
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            Auth.showApp();
            lucide.createIcons();
        });
        document.getElementById('heroLoginBtn')?.addEventListener('click', () => {
            Auth.showApp();
            lucide.createIcons();
        });
        document.getElementById('closeLoginDialog')?.addEventListener('click', () => this.hideLoginDialog());
        
        // 用戶選單
        document.getElementById('userMenuBtn')?.addEventListener('click', () => this.toggleUserMenu());
        document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
        
        // 回首頁按鈕
        document.getElementById('backToHomeBtn')?.addEventListener('click', () => {
            Auth.showHero();
            lucide.createIcons();
        });
        
        // 首頁 Logo 按鈕 - 重新載入首頁
        document.getElementById('heroLogoBtn')?.addEventListener('click', () => {
            Auth.showHero();
            lucide.createIcons();
        });
        
        // 歷史記錄
        document.getElementById('historyBtn')?.addEventListener('click', () => this.showHistoryModal());
        document.getElementById('closeHistoryBtn')?.addEventListener('click', () => this.hideHistoryModal());
        
        // 設定
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettingsModal());
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
        
        // 編輯功能
        document.getElementById('editBtn')?.addEventListener('click', () => this.editApproval());
        document.getElementById('saveEditBtn')?.addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyApproval());
        
        // 點擊外部關閉用戶選單
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenuBtn');
            const dropdown = document.getElementById('userDropdown');
            if (userMenu && dropdown && !userMenu.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 初始化自訂下拉選單
        this.initCustomSelect();
    }
};

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    UI.initEventListeners();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
