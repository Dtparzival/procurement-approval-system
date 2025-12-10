// UI Management Module

const UI = {
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
        
        const colorMap = {
            success: 'bg-green-50 text-green-800 border-green-200',
            error: 'bg-red-50 text-red-800 border-red-200',
            info: 'bg-blue-50 text-blue-800 border-blue-200',
            warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        };
        
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all ${colorMap[type]}`;
        toast.style.cssText = 'animation: slideIn 0.3s ease-out;';
        
        toast.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="w-5 h-5 flex-shrink-0"></i>
            <span class="font-medium">${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.UI.TOAST_DURATION);
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
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * 隱藏歷史記錄 Modal
     */
    hideHistoryModal() {
        document.getElementById('historyModal').classList.add('hidden');
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
        modelSelect.value = Storage.getModel();
        autoSaveToggle.checked = Storage.getAutoSave();
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * 隱藏設定 Modal
     */
    hideSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    },

    /**
     * 儲存設定
     */
    saveSettings() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const model = document.getElementById('modelSelect').value;
        const autoSave = document.getElementById('autoSaveToggle').checked;
        
        if (!apiKey) {
            this.showToast('請輸入 API Key', 'error');
            return;
        }
        
        Storage.setApiKey(apiKey);
        Storage.setModel(model);
        Storage.setAutoSave(autoSave);
        
        this.hideSettingsModal();
        this.showToast('設定已儲存', 'success');
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
        
        // 渲染 Markdown
        generatedContent.innerHTML = marked.parse(approval.content);
        
        // 儲存當前簽呈資料
        this.currentApproval = approval;
        
        // 滾動到結果區域（行動裝置）
        if (window.innerWidth < 1024) {
            generatedContent.scrollIntoView({ behavior: 'smooth' });
        }
        
        lucide.createIcons();
    },

    /**
     * 顯示載入狀態
     */
    showLoading(message) {
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');
        const generatedContent = document.getElementById('generatedContent');
        const loadingText = document.getElementById('loadingText');
        
        emptyState.classList.add('hidden');
        generatedContent.classList.add('hidden');
        loadingState.classList.remove('hidden');
        loadingText.textContent = message;
        
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
        const resultActions = document.getElementById('resultActions');
        
        emptyState.classList.remove('hidden');
        loadingState.classList.add('hidden');
        generatedContent.classList.add('hidden');
        resultActions.classList.add('hidden');
        
        lucide.createIcons();
    },

    /**
     * 複製簽呈內容
     */
    async copyApproval() {
        if (!this.currentApproval) return;
        
        try {
            await navigator.clipboard.writeText(this.currentApproval.content);
            this.showToast('已複製到剪貼簿', 'success');
            
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
            this.showToast('複製失敗', 'error');
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
            this.showToast('內容不能為空', 'error');
            return;
        }
        
        this.currentApproval.content = content;
        this.cancelEdit();
        this.showApproval(this.currentApproval);
        this.showToast('編輯已儲存', 'success');
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
