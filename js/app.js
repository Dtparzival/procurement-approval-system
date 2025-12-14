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

            // 儲存到歷史記錄（只保存文件元數據，不保存文件內容）
            const attachmentMetadata = this.uploadedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }));
            
            const historyItem = Storage.saveHistory({
                title: result.title,
                content: result.content,
                userInput: userInput,
                attachments: attachmentMetadata
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

        UI.showToast('正在處理檔案...', 'info');

        try {
            // 提取文件文本內容
            let textContent = '';
            
            if (file.type === 'application/pdf') {
                // PDF 文件
                textContent = await this.extractPdfText(file);
            } else if (file.type.includes('word') || file.type.includes('document')) {
                // Word 文件
                textContent = await this.extractWordText(file);
            } else if (file.type === 'text/plain') {
                // 純文本文件
                textContent = await file.text();
            } else if (file.type.startsWith('image/')) {
                // 圖片文件（暫不支持 OCR）
                textContent = `[圖片文件：${file.name}，需要視覺識別功能]`;
            } else {
                // 其他格式
                textContent = `[不支持的文件格式：${file.type}]`;
            }

            // 保存文件信息和文本內容
            const uploadedFile = {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                textContent: textContent  // 文本內容
            };

            this.uploadedFiles.push(uploadedFile);
            UI.showUploadedFile(uploadedFile);
            UI.showToast(`檔案 ${file.name} 處理成功`, 'success');

            // 清除 input
            event.target.value = '';

        } catch (error) {
            console.error('File processing error:', error);
            UI.showToast(`檔案處理失敗：${error.message}`, 'error');
        }
    }

    /**
     * 提取 PDF 文本
     */
    async extractPdfText(file) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js 庫未加載');
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `\n\n--- 第 ${i} 頁 ---\n${pageText}`;
            }
            
            return fullText.trim();
        } catch (error) {
            console.error('PDF text extraction error:', error);
            return `[無法提取 PDF 文本：${error.message}]`;
        }
    }

    /**
     * 提取 Word 文本
     */
    async extractWordText(file) {
        try {
            if (typeof mammoth === 'undefined') {
                throw new Error('Mammoth.js 庫未加載');
            }

            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            
            return result.value || '[Word 文件內容為空]';
        } catch (error) {
            console.error('Word text extraction error:', error);
            return `[無法提取 Word 文本：${error.message}]`;
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
        console.log('handleDownload called');
        
        const generatedContent = document.getElementById('generatedContent');
        if (!generatedContent || !generatedContent.textContent.trim()) {
            console.error('No content to download');
            UI.showToast('沒有可下載的內容', 'error');
            return;
        }
        
        // 檢查 html2pdf 庫是否加載
        if (typeof html2pdf === 'undefined') {
            console.error('html2pdf library not loaded');
            UI.showToast('PDF 文件庫未加載，請刷新頁面再試', 'error');
            return;
        }
        
        try {
            console.log('Starting PDF document generation...');
            UI.showToast('正在生成 PDF 文件...', 'info');
            
            const draftTitle = document.getElementById('draftTitle')?.value || '採購簽呈';
            
            // 設定 PDF 選項
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `${draftTitle}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            // 等待一小段時間確保內容完全渲染
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 直接從原始元素生成 PDF
            console.log('Generating PDF...');
            await html2pdf().set(opt).from(generatedContent).save();
            
            console.log('Download completed successfully');
            UI.showToast('下載成功！', 'success');
        } catch (error) {
            console.error('PDF 文件生成失敗:', error);
            UI.showToast(`PDF 文件生成失敗：${error.message}`, 'error');
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
document.addEventListener('DOMContentLoaded', () => {
    // 創建應用程式實例並暴露到全局作用域
    window.app = new ProcurementApp();
    console.log('ProcurementApp initialized:', window.app);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProcurementApp;
}
