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
            console.log('Calling LLM API:', {
                baseUrl: CONFIG.API.BASE_URL,
                model: model,
                messageCount: messages.length
            });

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

            console.log('API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                
                // 提供更詳細的錯誤訊息
                let errorMessage = errorData.error?.message || `API 請求失敗 (HTTP ${response.status})`;
                
                if (response.status === 401) {
                    errorMessage = 'API Key 無效或已過期，請在設定中更新 API Key';
                } else if (response.status === 429) {
                    errorMessage = 'API 請求次數過多，請稍後再試';
                } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                    errorMessage = 'API 服務器錯誤，請稍後再試';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('API Response received:', {
                hasChoices: !!data.choices,
                choicesCount: data.choices?.length
            });
            
            return data;
        } catch (error) {
            console.error('LLM API Error:', error);
            
            // 如果是網路錯誤
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('網路連線失敗，請檢查網路連線後再試');
            }
            
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
        console.log('Generating approval document:', {
            inputLength: userInput.length,
            attachmentsCount: attachments.length
        });

        // 組合完整的 inputText（符合 AWS API 格式）
        let inputText = '';

        // 添加標題（如果有）
        const draftTitle = document.getElementById('draftTitle')?.value.trim();
        if (draftTitle) {
            inputText = `標題：${draftTitle}\n\n`;
        }

        // 添加需求描述
        inputText += `需求描述：\n${userInput}`;

        // 添加參考文件及其內容
        if (attachments.length > 0) {
            inputText += `\n\n參考文件：\n`;
            attachments.forEach((att, index) => {
                inputText += `- ${att.fileName}\n`;
            });
            
            // 添加文件實際內容
            attachments.forEach((att, index) => {
                if (att.textContent && att.textContent.length > 0) {
                    // 限制文本長度，避免超過 API 限制
                    const maxLength = 10000;  // 每個文件最多 10000 字
                    const content = att.textContent.length > maxLength 
                        ? att.textContent.substring(0, maxLength) + '\n\n[文件內容過長，已截斷]'
                        : att.textContent;
                    inputText += `\n\n【${att.fileName} 內容】\n${content}\n`;
                }
            });
        }

        console.log('Final inputText length:', inputText.length);

        // 生成 sessionId（使用簡單的 UUID 生成方法）
        const sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        try {
            // 從配置中讀取 API URL
            const apiUrl = CONFIG.API.GENERATE_ENDPOINT;
            
            console.log('Calling AWS API:', {
                url: apiUrl,
                sessionId: sessionId,
                inputTextLength: inputText.length
            });

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CONFIG.API.GENERATE_API_KEY
                },
                body: JSON.stringify({
                    inputText: inputText,
                    sessionId: sessionId
                })
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(`API 請求失敗 (HTTP ${response.status})`);
            }

            const data = await response.json();
            console.log('API Response received:', data);

            // 解析多層 JSON 響應
            if (!data.body) {
                throw new Error('API 回應格式錯誤：缺少 body');
            }

            const bodyData = JSON.parse(data.body);
            console.log('Parsed body data:', bodyData);

            if (!bodyData.response || !bodyData.response.body) {
                throw new Error('API 回應格式錯誤：缺少 response.body');
            }

            const responseBody = JSON.parse(bodyData.response.body);
            console.log('Parsed response body:', responseBody);

            const content = responseBody.draft_text;
            
            if (!content || content.trim().length === 0) {
                throw new Error('生成的內容為空，請再試一次');
            }
            
            console.log('Approval generated successfully:', {
                contentLength: content.length
            });
            
            // Extract title from content (first heading)
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : '採購簽呈';

            return {
                title: title,
                content: content
            };
        } catch (error) {
            console.error('Generate approval error:', error);
            throw error;
        }
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
