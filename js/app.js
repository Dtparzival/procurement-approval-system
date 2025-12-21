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
            this.setupExternalLinks();
            lucide.createIcons();
            this.setupLayoutAlignment();
        }, 100);
    }

    /**
     * 設定外部連結（從配置檔案讀取）
     */
    setupExternalLinks() {
        // 設定使用指南連結
        const userGuideLink = document.getElementById('userGuideLink');
        if (userGuideLink && MESSAGES.LINKS && MESSAGES.LINKS.USER_GUIDE) {
            userGuideLink.href = MESSAGES.LINKS.USER_GUIDE;
        }

        // 設定技術支援郵件連結
        const supportEmailLink = document.getElementById('supportEmailLink');
        if (supportEmailLink && MESSAGES.LINKS && MESSAGES.LINKS.SUPPORT_EMAIL) {
            supportEmailLink.href = `mailto:${MESSAGES.LINKS.SUPPORT_EMAIL}`;
        }
    }

    /**
     * 設定佈局對齊 - 確保左右兩側始終對齊
     * 注意：主要高度控制已移至 CSS，此函數僅處理桌面版的左右對齊
     */
    setupLayoutAlignment() {
        const leftColumn = document.getElementById('leftColumn');
        const rightColumn = document.getElementById('rightColumn');
        
        if (!leftColumn || !rightColumn) return;
        
        // 調整佈局的函數 - 僅設定右側最大高度以匹配左側
        const adjustLayout = () => {
            // 只在桌面版應用左右對齊
            const isDesktop = window.innerWidth >= 1024;
            if (!isDesktop) {
                rightColumn.style.maxHeight = '';
                return;
            }
            
            // 計算左側區塊的總高度
            const leftHeight = leftColumn.offsetHeight;
            
            // 設定右側容器的最大高度以匹配左側
            if (leftHeight > 0) {
                rightColumn.style.maxHeight = `${leftHeight}px`;
            }
        };
        
        // 立即執行一次
        adjustLayout();
        
        // 使用 requestAnimationFrame 確保 DOM 完全渲染後再執行
        requestAnimationFrame(() => {
            adjustLayout();
        });
        
        // 只在初始化時設定事件監聽（避免重複綁定）
        if (!this._layoutListenersSet) {
            this._layoutListenersSet = true;
            
            // 頁面完全載入後再次調整
            window.addEventListener('load', () => {
                requestAnimationFrame(adjustLayout);
            });
            
            // 監聽視窗大小變化
            window.addEventListener('resize', () => {
                requestAnimationFrame(adjustLayout);
            });
        }
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
        // 生成按鈕 - 桌面版
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
        }
        
        // 生成按鈕 - 手機版
        const generateBtnMobile = document.getElementById('generateBtnMobile');
        if (generateBtnMobile) {
            generateBtnMobile.addEventListener('click', () => this.handleGenerate());
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
            UI.showToast(MESSAGES.INPUT.EMPTY_DESCRIPTION.message, 'error');
            return;
        }

        // 用於儲存 timeout ID,以便在錯誤時清除
        const loadingTimeouts = [];

        try {
            // 顯示載入狀態
            UI.showLoading(MESSAGES.LOADING.ANALYZING);
            
            // 使用可清除的 timeout
            loadingTimeouts.push(setTimeout(() => UI.showLoading(MESSAGES.LOADING.ORGANIZING), 2000));
            loadingTimeouts.push(setTimeout(() => UI.showLoading(MESSAGES.LOADING.OPTIMIZING), 4000));

            // 呼叫 API 生成簽呈
            const result = await API.generateApproval(userInput, this.uploadedFiles);

            // 清除所有 timeout (成功時也要清除,避免不必要的更新)
            loadingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));

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
            UI.showToast(MESSAGES.SUCCESS.GENERATE, 'success');

            // 清除草稿 ID
            this.currentDraftId = null;
            Storage.setCurrentDraftId(null);

        } catch (error) {
            console.error('Generate error:', error);
            
            // 重要: 先清除所有 timeout,避免錯誤狀態被覆蓋
            loadingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            
            UI.hideLoading();
            
            // 判斷錯誤類型並顯示適當的錯誤 UI
            const errorMessage = error.message || MESSAGES.DEFAULT.ERROR_MESSAGE;
            
            // 使用 MESSAGES 配置取得錯誤標題
            const errorTitle = MESSAGES.getErrorTitle(errorMessage);
            
            // 顯示錯誤狀態 UI
            UI.showErrorState(errorTitle, errorMessage);
            
            // 同時顯示 toast 通知
            UI.showToast(MESSAGES.DEFAULT.GENERATE_FAILED, 'error');
        }
    }
    
    /**
     * 重新嘗試生成
     */
    retryGenerate() {
        UI.hideErrorState();
        this.handleGenerate();
    }

    /**
     * 處理儲存草稿
     */
    handleSaveDraft(isAutoSave = false) {
        const userInput = document.getElementById('userInput')?.value.trim();
        const draftTitle = document.getElementById('draftTitle')?.value.trim();

        if (!userInput) {
            if (!isAutoSave) {
                UI.showToast(MESSAGES.INPUT.EMPTY_DESCRIPTION.message, 'error');
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
            UI.showToast(MESSAGES.SUCCESS.SAVE_DRAFT, 'success');
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
            UI.showToast(MESSAGES.FILE.TOO_LARGE.message, 'error');
            return;
        }

        UI.showToast(MESSAGES.LOADING.PROCESSING_FILE, 'info');

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
            UI.showToast(`檔案 ${file.name} ${MESSAGES.SUCCESS.FILE_UPLOAD}`, 'success');

            // 清除 input
            event.target.value = '';

        } catch (error) {
            console.error('File processing error:', error);
            UI.showToast(`${MESSAGES.FILE.PROCESS_ERROR.message}`, 'error');
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
        if (confirm(MESSAGES.CONFIRM.LOGOUT)) {
            // 清除認證狀態
            Storage.clearAuth();
            // 重新載入頁面
            window.location.reload();
        }
    }
    
    /**
     * 處理下載 - 使用瀏覽器原生列印功能
     */
    async handleDownload() {
        console.log('handleDownload called');
        
        const generatedContent = document.getElementById('generatedContent');
        if (!generatedContent || !generatedContent.textContent.trim()) {
            console.error('No content to download');
            UI.showToast(MESSAGES.UI.NO_CONTENT.message, 'error');
            return;
        }
        
        try {
            console.log('Starting PDF document generation...');
            UI.showToast(MESSAGES.LOADING.PREPARING_PDF, 'info');
            
            const draftTitle = document.getElementById('draftTitle')?.value || '採購簽呈';
            
            // 創建一個隱藏的列印專用視窗
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                UI.showToast(MESSAGES.UI.PRINT_BLOCKED.message, 'error');
                return;
            }
            
            // 建立列印頁面的 HTML
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${draftTitle}</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 20mm;
                        }
                        body {
                            font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
                            line-height: 1.8;
                            color: #333;
                            max-width: 100%;
                            margin: 0;
                            padding: 0;
                            position: relative;
                        }
                        /* 浮水印樣式 */
                        .watermark {
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(-45deg);
                            font-size: 80px;
                            font-weight: bold;
                            color: rgba(200, 200, 200, 0.15);
                            text-align: center;
                            line-height: 1.5;
                            z-index: -1;
                            pointer-events: none;
                            white-space: nowrap;
                        }
                        h1 {
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0 0 20px 0;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #333;
                        }
                        h2 {
                            font-size: 18px;
                            font-weight: bold;
                            margin: 20px 0 10px 0;
                            padding-bottom: 5px;
                            border-bottom: 1px solid #666;
                        }
                        h3 {
                            font-size: 16px;
                            font-weight: bold;
                            margin: 15px 0 10px 0;
                        }
                        p {
                            margin: 10px 0;
                            text-align: justify;
                        }
                        ul, ol {
                            margin: 10px 0;
                            padding-left: 30px;
                        }
                        li {
                            margin: 5px 0;
                        }
                        strong {
                            font-weight: bold;
                        }
                        /* 頁面底部聲明 */
                        .document-footer {
                            position: fixed;
                            bottom: 10mm;
                            left: 20mm;
                            right: 20mm;
                            text-align: center;
                            font-size: 10px;
                            color: #999;
                            border-top: 1px solid #ddd;
                            padding-top: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="watermark">公司內部文件<br>請勿外流傳閱</div>
                    ${generatedContent.innerHTML}
                    <div class="document-footer">
                        本文件為公司內部文件，僅供內部使用，請勿外流或傳閱。未經授權之複製、傳播或公開展示均屬違反內控規定。
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // 等待內容加載完成
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                    UI.showToast(MESSAGES.SUCCESS.PRINT_HINT, 'success');
                }, 500);
            };
            
            console.log('Print dialog opened');
        } catch (error) {
            console.error('PDF 文件生成失敗:', error);
            UI.showToast(MESSAGES.UI.PDF_GENERATE_ERROR.message, 'error');
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
        
        // 禁用背景滾動，記錄當前滾動位置
        this._scrollY = window.scrollY;
        document.body.style.top = `-${this._scrollY}px`;
        document.body.classList.add('modal-open');
        
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
            // 恢復背景滾動和位置
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            window.scrollTo(0, this._scrollY || 0);
        }
    }
    
    /**
     * 載入草稿
     */
    loadDraft(draftId) {
        const drafts = Storage.getDrafts();
        const draft = drafts.find(d => d.id === draftId);
        
        if (!draft) {
            UI.showToast(MESSAGES.UI.DRAFT_NOT_FOUND.message, 'error');
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
        UI.showToast(MESSAGES.SUCCESS.LOAD_DRAFT, 'success');
    }
    
    /**
     * 刪除草稿
     */
    deleteDraft(draftId) {
        if (!confirm(MESSAGES.CONFIRM.DELETE_DRAFT)) return;
        
        // 如果刪除的是當前正在編輯的草稿，清除 currentDraftId
        if (this.currentDraftId === draftId) {
            this.currentDraftId = null;
            Storage.setCurrentDraftId(null);
        }
        
        Storage.deleteDraft(draftId);
        UI.showToast(MESSAGES.SUCCESS.DELETE_DRAFT, 'success');
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
