// Main Application Logic

class ProcurementApp {
    constructor() {
        this.currentDraftId = Storage.getCurrentDraftId();
        this.uploadedFiles = [];
        this.generatedApproval = null;
        this.autoSaveTimer = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadSettings();
        this.bindEvents();
        this.loadRecentDrafts();
        this.setupAutoSave();
        
        // Initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const apiKey = Storage.getApiKey();
        const model = Storage.getModel();
        const autoSave = Storage.getAutoSave();

        document.getElementById('apiKeyInput').value = apiKey;
        document.getElementById('modelSelect').value = model;
        document.getElementById('autoSaveToggle').checked = autoSave;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.handleGenerate());

        // Save draft button
        document.getElementById('saveDraftBtn').addEventListener('click', () => this.handleSaveDraft());

        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload({ target: { files: e.dataTransfer.files } });
            }
        });

        // Edit buttons
        document.getElementById('editBtn').addEventListener('click', () => this.handleEdit());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.handleSaveEdit());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.handleCancelEdit());

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => this.handleCopy());

        // History button
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('closeHistoryBtn').addEventListener('click', () => UI.hideModal('historyModal'));

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => UI.hideModal('settingsModal'));
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());

        // Auto-save toggle
        document.getElementById('autoSaveToggle').addEventListener('change', (e) => {
            Storage.setAutoSave(e.target.checked);
            this.setupAutoSave();
        });

        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Load draft
            if (e.target.closest('.load-draft-btn')) {
                const draftId = parseInt(e.target.closest('.load-draft-btn').dataset.draftId);
                this.loadDraft(draftId);
            }

            // Delete draft
            if (e.target.closest('.delete-draft-btn')) {
                e.stopPropagation();
                const draftId = parseInt(e.target.closest('.delete-draft-btn').dataset.draftId);
                this.deleteDraft(draftId);
            }

            // Remove file
            if (e.target.closest('.remove-file-btn')) {
                const fileIndex = parseInt(e.target.closest('.remove-file-btn').dataset.fileIndex);
                this.removeFile(fileIndex);
            }

            // View history
            if (e.target.closest('.view-history-btn')) {
                const historyId = parseInt(e.target.closest('.view-history-btn').dataset.historyId);
                this.viewHistory(historyId);
            }

            // Copy history
            if (e.target.closest('.copy-history-btn')) {
                const historyId = parseInt(e.target.closest('.copy-history-btn').dataset.historyId);
                this.copyHistory(historyId);
            }

            // Delete history
            if (e.target.closest('.delete-history-btn')) {
                const historyId = parseInt(e.target.closest('.delete-history-btn').dataset.historyId);
                this.deleteHistory(historyId);
            }
        });

        // Close modals on background click
        document.getElementById('historyModal').addEventListener('click', (e) => {
            if (e.target.id === 'historyModal') {
                UI.hideModal('historyModal');
            }
        });

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                UI.hideModal('settingsModal');
            }
        });
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        if (Storage.getAutoSave()) {
            this.autoSaveTimer = setInterval(() => {
                const userInput = document.getElementById('userInput').value.trim();
                if (userInput) {
                    this.handleSaveDraft(true); // Silent save
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            // Validate file
            API.validateFile(file);

            UI.showToast('正在上傳檔案...', 'info');

            // Upload file
            const uploadedFile = await API.uploadFile(file);
            this.uploadedFiles.push(uploadedFile);

            // Update UI
            UI.renderUploadedFiles(this.uploadedFiles);
            UI.showToast(`檔案 ${file.name} 上傳成功`, 'success');

            // Extract document info if it's an image
            if (file.type.startsWith('image/')) {
                UI.showToast('正在識別文件內容...', 'info');
                try {
                    const extractedInfo = await API.extractDocumentInfo(
                        uploadedFile.fileUrl,
                        uploadedFile.fileName,
                        uploadedFile.mimeType
                    );

                    // Append to user input
                    const userInput = document.getElementById('userInput');
                    const currentValue = userInput.value.trim();
                    userInput.value = currentValue 
                        ? `${currentValue}\n\n${extractedInfo}` 
                        : extractedInfo;

                    UI.showToast('已自動識別文件內容', 'success');
                } catch (error) {
                    console.error('Document extraction error:', error);
                    UI.showToast('文件識別失敗，請手動輸入', 'warning');
                }
            }
        } catch (error) {
            console.error('File upload error:', error);
            UI.showToast(error.message, 'error');
        }
    }

    /**
     * Remove uploaded file
     */
    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        UI.renderUploadedFiles(this.uploadedFiles);
        UI.showToast('已移除檔案', 'info');
    }

    /**
     * Handle generate approval
     */
    async handleGenerate() {
        const userInput = document.getElementById('userInput').value.trim();

        if (!userInput) {
            UI.showToast('請輸入採購需求描述', 'error');
            return;
        }

        const apiKey = Storage.getApiKey();
        if (!apiKey) {
            UI.showToast('請先在設定中輸入 API Key', 'error');
            UI.showModal('settingsModal');
            return;
        }

        try {
            // Show loading status
            const statusMessages = [
                '正在分析您的需求...',
                '正在組織簽呈內容...',
                '正在優化公文格式...'
            ];

            let statusIndex = 0;
            UI.showLoading(statusMessages[statusIndex]);

            const statusInterval = setInterval(() => {
                statusIndex = (statusIndex + 1) % statusMessages.length;
                UI.showLoading(statusMessages[statusIndex]);
            }, 2000);

            // Generate approval
            const approval = await API.generateApproval(userInput, this.uploadedFiles);

            clearInterval(statusInterval);
            UI.hideLoading();

            // Save to history
            const historyItem = Storage.saveHistory({
                title: approval.title,
                content: approval.content,
                userInput: userInput,
                attachments: this.uploadedFiles
            });

            this.generatedApproval = {
                id: historyItem.id,
                title: approval.title,
                content: approval.content
            };

            // Show approval
            UI.showApproval(this.generatedApproval);
            UI.showToast('簽呈生成成功！', 'success');

            // Clear current draft ID
            this.currentDraftId = null;
            Storage.setCurrentDraftId(null);

        } catch (error) {
            console.error('Generate error:', error);
            UI.hideLoading();
            UI.showToast(error.message || '生成失敗，請稍後再試', 'error');
        }
    }

    /**
     * Handle save draft
     */
    handleSaveDraft(silent = false) {
        const userInput = document.getElementById('userInput').value.trim();
        const draftTitle = document.getElementById('draftTitle').value.trim();

        if (!userInput) {
            if (!silent) {
                UI.showToast('請輸入需求描述', 'error');
            }
            return;
        }

        try {
            const draft = Storage.saveDraft({
                id: this.currentDraftId,
                title: draftTitle || '未命名草稿',
                userInput: userInput,
                attachments: this.uploadedFiles
            });

            this.currentDraftId = draft.id;
            Storage.setCurrentDraftId(draft.id);

            if (!silent) {
                UI.showToast('草稿已儲存', 'success');
            }
            UI.updateLastSaved();

            // Refresh recent drafts
            this.loadRecentDrafts();
        } catch (error) {
            console.error('Save draft error:', error);
            if (!silent) {
                UI.showToast('儲存失敗', 'error');
            }
        }
    }

    /**
     * Load draft
     */
    loadDraft(draftId) {
        const draft = Storage.getDraftById(draftId);
        if (!draft) {
            UI.showToast('找不到草稿', 'error');
            return;
        }

        document.getElementById('userInput').value = draft.userInput;
        document.getElementById('draftTitle').value = draft.title;
        this.uploadedFiles = draft.attachments || [];
        this.currentDraftId = draft.id;
        Storage.setCurrentDraftId(draft.id);

        UI.renderUploadedFiles(this.uploadedFiles);
        UI.showToast('已載入草稿', 'success');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Delete draft
     */
    deleteDraft(draftId) {
        if (!confirm('確定要刪除此草稿嗎？')) {
            return;
        }

        Storage.deleteDraft(draftId);
        
        if (this.currentDraftId === draftId) {
            this.currentDraftId = null;
            Storage.setCurrentDraftId(null);
        }

        this.loadRecentDrafts();
        UI.showToast('草稿已刪除', 'info');
    }

    /**
     * Load recent drafts
     */
    loadRecentDrafts() {
        const drafts = Storage.getRecentDrafts();
        UI.renderRecentDrafts(drafts);
    }

    /**
     * Handle edit
     */
    handleEdit() {
        if (!this.generatedApproval) return;

        const editContent = document.getElementById('editContent');
        editContent.value = this.generatedApproval.content;
        UI.toggleEditMode(true);
    }

    /**
     * Handle save edit
     */
    handleSaveEdit() {
        const editContent = document.getElementById('editContent').value.trim();

        if (!editContent) {
            UI.showToast('內容不能為空', 'error');
            return;
        }

        this.generatedApproval.content = editContent;
        UI.updateApprovalContent(editContent);
        UI.toggleEditMode(false);
        UI.showToast('編輯已儲存', 'success');
    }

    /**
     * Handle cancel edit
     */
    handleCancelEdit() {
        UI.toggleEditMode(false);
    }

    /**
     * Handle copy
     */
    async handleCopy() {
        if (!this.generatedApproval) return;

        try {
            await navigator.clipboard.writeText(this.generatedApproval.content);
            UI.showToast('已複製到剪貼簿', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            UI.showToast('複製失敗', 'error');
        }
    }

    /**
     * Show history
     */
    showHistory() {
        const history = Storage.getHistory();
        UI.renderHistory(history);
        UI.showModal('historyModal');
    }

    /**
     * View history item
     */
    viewHistory(historyId) {
        const item = Storage.getHistoryById(historyId);
        if (!item) {
            UI.showToast('找不到歷史記錄', 'error');
            return;
        }

        this.generatedApproval = {
            id: item.id,
            title: item.title,
            content: item.content
        };

        UI.showApproval(this.generatedApproval);
        UI.hideModal('historyModal');

        // Scroll to preview
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Copy history item
     */
    async copyHistory(historyId) {
        const item = Storage.getHistoryById(historyId);
        if (!item) {
            UI.showToast('找不到歷史記錄', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(item.content);
            UI.showToast('已複製到剪貼簿', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            UI.showToast('複製失敗', 'error');
        }
    }

    /**
     * Delete history item
     */
    deleteHistory(historyId) {
        if (!confirm('確定要刪除此歷史記錄嗎？')) {
            return;
        }

        Storage.deleteHistory(historyId);
        this.showHistory(); // Refresh
        UI.showToast('歷史記錄已刪除', 'info');
    }

    /**
     * Show settings
     */
    showSettings() {
        this.loadSettings();
        UI.showModal('settingsModal');
    }

    /**
     * Save settings
     */
    saveSettings() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const model = document.getElementById('modelSelect').value;
        const autoSave = document.getElementById('autoSaveToggle').checked;

        if (!apiKey) {
            UI.showToast('請輸入 API Key', 'error');
            return;
        }

        Storage.setApiKey(apiKey);
        Storage.setModel(model);
        Storage.setAutoSave(autoSave);

        this.setupAutoSave();

        UI.hideModal('settingsModal');
        UI.showToast('設定已儲存', 'success');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProcurementApp();
});
