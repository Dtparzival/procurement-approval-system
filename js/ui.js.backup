// UI Management Module

const UI = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            info: 'info',
            warning: 'alert-triangle'
        };
        
        toast.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="w-5 h-5"></i>
            <span>${message}</span>
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
     * Show loading status
     */
    showLoading(message) {
        const statusDiv = document.getElementById('generatingStatus');
        const statusText = document.getElementById('statusText');
        statusText.textContent = message;
        statusDiv.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * Hide loading status
     */
    hideLoading() {
        const statusDiv = document.getElementById('generatingStatus');
        statusDiv.classList.add('hidden');
    },

    /**
     * Show approval content
     */
    showApproval(approval) {
        const emptyState = document.getElementById('emptyState');
        const approvalContent = document.getElementById('approvalContent');
        const approvalTitle = document.getElementById('approvalTitle');
        const approvalMarkdown = document.getElementById('approvalMarkdown');

        emptyState.classList.add('hidden');
        approvalContent.classList.remove('hidden');
        
        approvalTitle.textContent = approval.title;
        approvalMarkdown.innerHTML = marked.parse(approval.content);
        
        // Scroll to preview area on mobile
        if (window.innerWidth < 1024) {
            document.getElementById('previewArea').scrollIntoView({ behavior: 'smooth' });
        }
        
        lucide.createIcons();
    },

    /**
     * Hide approval content
     */
    hideApproval() {
        const emptyState = document.getElementById('emptyState');
        const approvalContent = document.getElementById('approvalContent');

        emptyState.classList.remove('hidden');
        approvalContent.classList.add('hidden');
        
        lucide.createIcons();
    },

    /**
     * Toggle edit mode
     */
    toggleEditMode(isEdit) {
        const readMode = document.getElementById('readMode');
        const editMode = document.getElementById('editMode');
        const editContent = document.getElementById('editContent');
        const approvalMarkdown = document.getElementById('approvalMarkdown');

        if (isEdit) {
            // Get current content from markdown
            const currentContent = approvalMarkdown.textContent || '';
            editContent.value = currentContent;
            readMode.classList.add('hidden');
            editMode.classList.remove('hidden');
        } else {
            readMode.classList.remove('hidden');
            editMode.classList.add('hidden');
        }
        
        lucide.createIcons();
    },

    /**
     * Update approval content after edit
     */
    updateApprovalContent(content) {
        const approvalMarkdown = document.getElementById('approvalMarkdown');
        approvalMarkdown.innerHTML = marked.parse(content);
        lucide.createIcons();
    },

    /**
     * Render recent drafts
     */
    renderRecentDrafts(drafts) {
        const container = document.getElementById('recentDraftsList');
        
        if (drafts.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i>
                    <p>尚無草稿</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = drafts.map(draft => `
            <div class="draft-card bg-gray-50 rounded-lg p-4 border border-gray-200" data-draft-id="${draft.id}">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-900 truncate flex-1">${draft.title}</h4>
                    <button class="delete-draft-btn text-gray-400 hover:text-red-600 ml-2" data-draft-id="${draft.id}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2 mb-3">${draft.userInput.substring(0, 100)}...</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>${this.formatDate(draft.updatedAt)}</span>
                    <button class="load-draft-btn text-blue-600 hover:text-blue-700 font-medium" data-draft-id="${draft.id}">
                        載入
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    },

    /**
     * Render history items
     */
    renderHistory(history) {
        const container = document.getElementById('historyList');
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i data-lucide="inbox" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i>
                    <p>尚無歷史記錄</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-900">${item.title}</h4>
                    <button class="delete-history-btn text-gray-400 hover:text-red-600" data-history-id="${item.id}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-3">${this.formatDate(item.createdAt)}</p>
                <div class="flex items-center gap-2">
                    <button class="view-history-btn px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" data-history-id="${item.id}">
                        查看
                    </button>
                    <button class="copy-history-btn px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300" data-history-id="${item.id}">
                        複製
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    },

    /**
     * Render uploaded files list
     */
    renderUploadedFiles(files) {
        const container = document.getElementById('uploadedFilesList');
        
        if (files.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = files.map((file, index) => `
            <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <i data-lucide="file" class="w-4 h-4 text-gray-500 flex-shrink-0"></i>
                    <span class="text-sm text-gray-700 truncate">${file.fileName}</span>
                    <span class="text-xs text-gray-500">(${this.formatFileSize(file.fileSize)})</span>
                </div>
                <button class="remove-file-btn text-gray-400 hover:text-red-600 ml-2" data-file-index="${index}">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
        
        lucide.createIcons();
    },

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    },

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return '剛剛';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} 分鐘前`;
        }
        
        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} 小時前`;
        }
        
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} 天前`;
        }
        
        // Format as date
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Update last saved time
     */
    updateLastSaved() {
        const lastSavedSpan = document.getElementById('lastSaved');
        const now = new Date();
        lastSavedSpan.textContent = `最後儲存: ${now.toLocaleTimeString('zh-TW')}`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
