// Main Application Logic

class ProcurementApp {
    constructor() {
        this.currentDraftId = null;
        this.uploadedFiles = [];
        this.autoSaveTimer = null;
        this.init();
    }

    /**
     * 初始化應用程式
     */
    init() {
        // 等待 Auth 初始化完成
        setTimeout(() => {
            // ========== 暫時停用認證檢查 ==========
            // 直接載入應用程式，無需登入
            this.loadSettings();
            this.bindEvents();
            this.setupAutoSave();
            
            // ========== 原始認證檢查（已註解） ==========
            /*
            if (Auth.isAuthenticated()) {
                this.loadSettings();
                this.bindEvents();
                this.setupAutoSave();
            }
            */
            
            lucide.createIcons();
        }, 100);
    }

    /**
     * 載入設定
     */
    loadSettings() {
        const apiKey = Storage.getApiKey();
        const model = Storage.getModel();
        const autoSave = Storage.getAutoSave();

        const apiKeyInput = document.getElementById('apiKeyInput');
        const modelSelect = document.getElementById('modelSelect');
        const autoSaveToggle = document.getElementById('autoSaveToggle');

        if (apiKeyInput) apiKeyInput.value = apiKey;
        if (modelSelect) modelSelect.value = model;
        if (autoSaveToggle) autoSaveToggle.checked = autoSave;
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 生成按鈕
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
        }

        // 儲存草稿按鈕
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.handleSaveDraft());
        }

        // 檔案上傳
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

            // 拖放功能
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-blue-500', 'bg-blue-50');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload({ target: { files: e.dataTransfer.files } });
                }
            });
        }

        // 自動儲存切換
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                Storage.setAutoSave(e.target.checked);
                this.setupAutoSave();
                UI.showToast(e.target.checked ? '自動儲存已啟用' : '自動儲存已停用', 'info');
            });
        }
    }

    /**
     * 設定自動儲存
     */
    setupAutoSave() {
        // 清除現有計時器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }

        // 如果啟用自動儲存
        if (Storage.getAutoSave()) {
            this.autoSaveTimer = setInterval(() => {
                const userInput = document.getElementById('userInput')?.value.trim();
                if (userInput) {
                    this.handleSaveDraft(true); // true 表示是自動儲存
                }
            }, 30000); // 30 秒
        }
    }

    /**
     * 處理生成簽呈
     */
    async handleGenerate() {
        const userInput = document.getElementById('userInput')?.value.trim();
        
        if (!userInput) {
            UI.showToast('請輸入採購需求描述', 'error');
            return;
        }

        const apiKey = Storage.getApiKey();
        if (!apiKey) {
            UI.showToast('請先設定 API Key', 'error');
            UI.showSettingsModal();
            return;
        }

        try {
            // 顯示載入狀態
            UI.showLoading('正在分析您的需求...');
            
            setTimeout(() => UI.showLoading('正在組織簽呈內容...'), 2000);
            setTimeout(() => UI.showLoading('正在優化公文格式...'), 4000);

            // 呼叫 API 生成簽呈
            const result = await API.generateApproval(userInput, this.uploadedFiles);

            // 儲存到歷史記錄
            const historyItem = Storage.saveHistory({
                title: result.title,
                content: result.content,
                userInput: userInput,
                attachments: this.uploadedFiles
            });

            // 顯示結果
            UI.showApproval(historyItem);
            UI.showToast('簽呈生成成功！', 'success');

            // 清除草稿 ID
            this.currentDraftId = null;
            Storage.setCurrentDraftId(null);

        } catch (error) {
            console.error('Generate error:', error);
            UI.hideLoading();
            UI.showToast(error.message || '生成失敗，請稍後再試', 'error');
        }
    }

    /**
     * 處理儲存草稿
     */
    handleSaveDraft(isAutoSave = false) {
        const userInput = document.getElementById('userInput')?.value.trim();
        const draftTitle = document.getElementById('draftTitle')?.value.trim();

        if (!userInput) {
            if (!isAutoSave) {
                UI.showToast('請輸入需求描述', 'error');
            }
            return;
        }

        const draft = Storage.saveDraft({
            id: this.currentDraftId,
            title: draftTitle || '採購簽呈草稿',
            userInput: userInput,
            attachments: this.uploadedFiles
        });

        this.currentDraftId = draft.id;
        Storage.setCurrentDraftId(draft.id);

        if (!isAutoSave) {
            UI.showToast('草稿已儲存', 'success');
        } else {
            // 更新自動儲存狀態
            const statusElement = document.getElementById('lastSaved');
            if (statusElement) {
                const now = new Date();
                statusElement.textContent = `上次儲存：${now.toLocaleTimeString('zh-TW')}`;
            }
        }
    }

    /**
     * 處理檔案上傳
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
            UI.showToast('檔案大小不能超過 10MB', 'error');
            return;
        }

        UI.showToast('正在上傳檔案...', 'info');

        try {
            // 讀取檔案
            const fileData = await this.readFileAsBase64(file);

            // 模擬上傳（實際應用中應該上傳到伺服器）
            const uploadedFile = {
                fileName: file.name,
                fileData: fileData,
                fileSize: file.size,
                mimeType: file.type
            };

            this.uploadedFiles.push(uploadedFile);
            UI.showUploadedFile(uploadedFile);
            UI.showToast(`檔案 ${file.name} 上傳成功`, 'success');

            // 清除 input
            event.target.value = '';

        } catch (error) {
            console.error('Upload error:', error);
            UI.showToast('檔案上傳失敗', 'error');
        }
    }

    /**
     * 讀取檔案為 Base64
     */
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// 初始化應用程式
let app;
document.addEventListener('DOMContentLoaded', () => {
    // 等待 Auth 初始化
    setTimeout(() => {
        app = new ProcurementApp();
    }, 200);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProcurementApp;
}
