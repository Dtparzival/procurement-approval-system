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
            // 直接載入應用程式，無需認證檢查
            this.loadSettings();
            this.bindEvents();
            this.setupAutoSave();
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
        
        // 查看草稿按鈕
        const viewDraftsBtn = document.getElementById('viewDraftsBtn');
        if (viewDraftsBtn) {
            viewDraftsBtn.addEventListener('click', () => this.showDraftsModal());
        }
        
        // 草稿 Modal 中的按鈕事件委派
        const draftsModal = document.getElementById('draftsModal');
        if (draftsModal) {
            draftsModal.addEventListener('click', (e) => {
                const target = e.target.closest('button[data-action]');
                if (!target) return;
                
                const action = target.dataset.action;
                const draftId = target.dataset.draftId;
                
                if (action === 'load-draft') {
                    this.loadDraft(parseInt(draftId));
                } else if (action === 'delete-draft') {
                    this.deleteDraft(parseInt(draftId));
                }
            });
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
        
        // 設定按鈕
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => UI.showSettingsModal());
        }
        
        // 登出按鈕
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // 下載按鈕
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleDownload());
        }
        
        // 字數統計
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.addEventListener('input', () => UI.updateCharCount(userInput));
            UI.updateCharCount(userInput); // 初始化
        }
        
        // 草稿瀏覽按鈕
        const sidebarDraftsBtns = document.querySelectorAll('#sidebarDraftsBtn');
        sidebarDraftsBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showDraftsModal());
        });
        
        const closeDraftsBtn = document.getElementById('closeDraftsBtn');
        if (closeDraftsBtn) {
            closeDraftsBtn.addEventListener('click', () => this.closeDraftsModal());
        }
        
        const draftsModal = document.getElementById('draftsModal');
        if (draftsModal) {
            draftsModal.addEventListener('click', (e) => {
                if (e.target === draftsModal) {
                    this.closeDraftsModal();
                }
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
        }
        
        // 更新上次儲存時間
        UI.updateLastSaved();
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
    
    /**
     * 處理登出
     */
    handleLogout() {
        if (confirm('確定要登出嗎？')) {
            // 清除認證狀態
            Storage.clearAuth();
            // 重新載入頁面
            window.location.reload();
        }
    }
    
    /**
     * 處理下載
     */
    async handleDownload() {
        const generatedContent = document.getElementById('generatedContent');
        if (!generatedContent || !generatedContent.textContent.trim()) {
            UI.showToast('沒有可下載的內容', 'error');
            return;
        }
        
        try {
            UI.showToast('正在生成 Word 文件...', 'info');
            
            const draftTitle = document.getElementById('draftTitle')?.value || '採購簽呈';
            const content = generatedContent.textContent;
            
            // 解析內容並建立段落
            const paragraphs = [];
            const lines = content.split('\n');
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // 跳過空行
                if (!trimmedLine) {
                    paragraphs.push(
                        new docx.Paragraph({
                            text: '',
                            spacing: { after: 100 },
                        })
                    );
                    continue;
                }
                
                // 判斷是否為標題（以 # 開頭或全大寫）
                const isHeading = trimmedLine.startsWith('#') || 
                                  trimmedLine.startsWith('一、') || 
                                  trimmedLine.startsWith('二、') || 
                                  trimmedLine.startsWith('三、') ||
                                  trimmedLine.match(/^[\u4e00-\u9fa5]{2,10}：$/);
                
                paragraphs.push(
                    new docx.Paragraph({
                        text: trimmedLine.replace(/^#+\s*/, ''),
                        spacing: {
                            before: isHeading ? 240 : 120,
                            after: isHeading ? 120 : 100,
                        },
                        style: isHeading ? 'Heading1' : undefined,
                    })
                );
            }
            
            // 使用 docx 庫生成 Word 文件
            const doc = new docx.Document({
                styles: {
                    paragraphStyles: [
                        {
                            id: 'Heading1',
                            name: 'Heading 1',
                            basedOn: 'Normal',
                            next: 'Normal',
                            run: {
                                size: 32,
                                bold: true,
                                color: '1E40AF',
                            },
                            paragraph: {
                                spacing: {
                                    before: 240,
                                    after: 120,
                                },
                            },
                        },
                    ],
                },
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440,
                            },
                        },
                    },
                    children: paragraphs,
                }],
            });
            
            // 生成並下載
            const blob = await docx.Packer.toBlob(doc);
            const fileName = `${draftTitle}_${new Date().toISOString().split('T')[0]}.docx`;
            saveAs(blob, fileName);
            
            UI.showToast('下載成功！', 'success');
        } catch (error) {
            console.error('Word 文件生成失敗:', error);
            UI.showToast(`Word 文件生成失敗：${error.message}`, 'error');
        }
    }
    
    /**
     * 顯示草稿瀏覽 Modal
     */
    showDraftsModal() {
        const modal = document.getElementById('draftsModal');
        const draftsList = document.getElementById('draftsList');
        const emptyDrafts = document.getElementById('emptyDrafts');
        
        if (!modal || !draftsList || !emptyDrafts) return;
        
        // 禁用背景滿動
        document.body.style.overflow = 'hidden';
        
        // 顯示 modal
        modal.classList.remove('hidden');
        
        // 載入草稿
        const drafts = Storage.getDrafts();
        
        if (drafts.length === 0) {
            draftsList.innerHTML = '';
            emptyDrafts.classList.remove('hidden');
        } else {
            emptyDrafts.classList.add('hidden');
            draftsList.innerHTML = drafts.map(draft => `
                <div class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900">${draft.title || '無標題草稿'}</h3>
                        <span class="text-sm text-gray-500">${new Date(draft.updatedAt || draft.createdAt || draft.id).toLocaleString('zh-TW')}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${(draft.userInput || draft.content || '').substring(0, 100)}...</p>
                    <div class="flex gap-2">
                        <button data-action="load-draft" data-draft-id="${draft.id}" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                            載入
                        </button>
                        <button data-action="delete-draft" data-draft-id="${draft.id}" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                            刪除
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        lucide.createIcons();
    }
    
    /**
     * 關閉草稿瀏覽 Modal
     */
    closeDraftsModal() {
        const modal = document.getElementById('draftsModal');
        if (modal) {
            modal.classList.add('hidden');
            // 恢復背景滿動
            document.body.style.overflow = '';
        }
    }
    
    /**
     * 載入草稿
     */
    loadDraft(draftId) {
        const drafts = Storage.getDrafts();
        const draft = drafts.find(d => d.id === draftId);
        
        if (!draft) {
            UI.showToast('草稿不存在', 'error');
            return;
        }
        
        // 填入內容
        const userInput = document.getElementById('userInput');
        const draftTitle = document.getElementById('draftTitle');
        
        if (userInput) {
            userInput.value = draft.userInput || draft.content || '';
            UI.updateCharCount(userInput);
        }
        if (draftTitle) draftTitle.value = draft.title || '';
        
        this.currentDraftId = draftId;
        this.closeDraftsModal();
        UI.showToast('草稿已載入', 'success');
    }
    
    /**
     * 刪除草稿
     */
    deleteDraft(draftId) {
        if (!confirm('確定要刪除這個草稿嗎？')) return;
        
        Storage.deleteDraft(draftId);
        UI.showToast('草稿已刪除', 'success');
        this.showDraftsModal(); // 重新載入列表
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
