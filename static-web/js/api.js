// API Module for OpenAI-compatible LLM calls

const API = {
    /**
     * Call OpenAI-compatible API
     */
    async callLLM(messages, options = {}) {
        const apiKey = Storage.getApiKey();
        if (!apiKey) {
            throw new Error('請先在設定中輸入 API Key');
        }

        const model = options.model || Storage.getModel();
        const temperature = options.temperature || 0.7;
        const maxTokens = options.maxTokens || 4000;

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API 請求失敗: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('LLM API Error:', error);
            throw error;
        }
    },

    /**
     * Extract document information using AI
     */
    async extractDocumentInfo(fileData, fileName, mimeType) {
        // For static version, we'll use base64 encoded images
        // For documents, we'll need to convert them to text first
        
        let content;
        if (mimeType.startsWith('image/')) {
            content = [
                {
                    type: "text",
                    text: `請分析這個文件：${fileName}`
                },
                {
                    type: "image_url",
                    image_url: {
                        url: fileData // base64 data URL
                    }
                }
            ];
        } else {
            // For non-image files, we'll just use the filename
            // In a real implementation, you'd need to extract text from PDFs/Word docs
            content = `請根據檔案名稱 "${fileName}" 提供一個採購需求的範例描述。`;
        }

        const messages = [
            {
                role: "system",
                content: CONFIG.PROMPTS.DOCUMENT_EXTRACTION
            },
            {
                role: "user",
                content: content
            }
        ];

        const response = await this.callLLM(messages);
        return response.choices[0]?.message?.content || '';
    },

    /**
     * Generate procurement approval document
     */
    async generateApproval(userInput, attachments = []) {
        let userContent = `請根據以下採購需求生成簽呈：\n\n${userInput}`;

        if (attachments.length > 0) {
            userContent += `\n\n參考文件：\n`;
            attachments.forEach(att => {
                userContent += `- ${att.fileName}\n`;
            });
        }

        const messages = [
            {
                role: "system",
                content: CONFIG.PROMPTS.APPROVAL_GENERATION
            },
            {
                role: "user",
                content: userContent
            }
        ];

        const response = await this.callLLM(messages, {
            temperature: 0.7,
            maxTokens: 4000
        });

        const content = response.choices[0]?.message?.content || '';
        
        // Extract title from content (first heading)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : '採購簽呈';

        return {
            title: title,
            content: content
        };
    },

    /**
     * Upload file to a temporary storage (for demo purposes)
     * In production, you'd upload to S3 or similar service
     */
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64Data = e.target.result;
                
                // For demo purposes, we'll store files as base64 in memory
                // In production, upload to S3 and return the URL
                resolve({
                    fileName: file.name,
                    fileUrl: base64Data,
                    mimeType: file.type,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString()
                });
            };

            reader.onerror = (error) => {
                reject(new Error('檔案讀取失敗'));
            };

            reader.readAsDataURL(file);
        });
    },

    /**
     * Validate file before upload
     */
    validateFile(file) {
        // Check file size
        if (file.size > CONFIG.FILE_UPLOAD.MAX_SIZE) {
            throw new Error(`檔案大小不能超過 ${CONFIG.FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!CONFIG.FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension)) {
            throw new Error('不支援的檔案格式');
        }

        if (!CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type) && file.type !== '') {
            throw new Error('不支援的檔案類型');
        }

        return true;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
