// API Module for OpenAI-compatible LLM calls

const API = {
    /**
     * Call OpenAI-compatible API
     */
    async callLLM(messages, options = {}) {
        const apiKey = Storage.getApiKey();
        if (!apiKey) {
            throw new Error(MESSAGES.API.NO_API_KEY.message);
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
                    max_completion_tokens: maxTokens
                })
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                console.error('API 錯誤詳情:', errorData.error?.message || `HTTP ${response.status}`);
                
                // 使用 MESSAGES 配置取得錯誤訊息
                const errorInfo = MESSAGES.getApiError(response.status);
                throw new Error(errorInfo.message);
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
                throw new Error(MESSAGES.NETWORK.FAILED_FETCH.message);
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

        // 檢查是否使用 OpenAI API
        const useOpenAI = Storage.getUseOpenAI();
        
        if (useOpenAI) {
            return await this.generateApprovalWithOpenAI(userInput, attachments);
        } else {
            return await this.generateApprovalWithAWS(userInput, attachments);
        }
    },

    /**
     * Generate procurement approval document using OpenAI API
     */
    async generateApprovalWithOpenAI(userInput, attachments = []) {
        console.log('Using OpenAI API for generation');

        // 組合完整的 inputText
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
                    const maxLength = 10000;
                    const content = att.textContent.length > maxLength 
                        ? att.textContent.substring(0, maxLength) + '\n\n[文件內容過長，已截斷]'
                        : att.textContent;
                    inputText += `\n\n【${att.fileName} 內容】\n${content}\n`;
                }
            });
        }

        const messages = [
            {
                role: "system",
                content: CONFIG.PROMPTS.APPROVAL_GENERATION
            },
            {
                role: "user",
                content: inputText
            }
        ];

        try {
            const response = await this.callLLM(messages);
            const content = response.choices[0]?.message?.content || '';
            
            if (!content || content.trim().length === 0) {
                throw new Error(MESSAGES.API.EMPTY_RESPONSE.message);
            }
            
            // Extract title from content (first heading)
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : '採購簽呈';

            return {
                title: title,
                content: content
            };
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    },

    /**
     * Generate procurement approval document using AWS API
     */
    async generateApprovalWithAWS(userInput, attachments = []) {
        console.log('Using AWS API for generation');

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
                const errorInfo = MESSAGES.getApiError(response.status);
                throw new Error(errorInfo.message);
            }

            const data = await response.json();
            console.log('API Response received:', data);

            // 解析多層 JSON 響應
            if (!data.body) {
                console.error('API 回應格式錯誤：缺少 body');
                throw new Error(MESSAGES.API.PARSE_ERROR.message);
            }

            let bodyData;
            try {
                bodyData = JSON.parse(data.body);
            } catch (parseError) {
                console.error('Failed to parse body:', parseError);
                throw new Error(MESSAGES.API.PARSE_ERROR.message);
            }
            console.log('Parsed body data:', bodyData);

            // 檢查內層 response 是否有錯誤
            if (bodyData.response) {
                // 檢查內層 statusCode 是否為錯誤
                if (bodyData.response.statusCode && bodyData.response.statusCode >= 400) {
                    console.error('Inner API error detected:', bodyData.response);
                    
                    // 嘗試解析內層錯誤訊息（僅記錄到控制台）
                    let technicalError = '伺服器處理請求時發生錯誤';
                    try {
                        if (bodyData.response.body) {
                            const innerBody = JSON.parse(bodyData.response.body);
                            if (innerBody.error) {
                                technicalError = innerBody.error;
                            } else if (innerBody.message) {
                                technicalError = innerBody.message;
                            }
                        }
                    } catch (e) {
                        // 如果解析失敗，使用預設錯誤訊息
                    }
                    
                    // 在控制台記錄技術詳情，但不顯示給使用者
                    console.error('技術錯誤詳情:', technicalError);
                    
                    // 使用 MESSAGES 配置取得錯誤訊息
                    const errorInfo = MESSAGES.getApiError(bodyData.response.statusCode);
                    throw new Error(errorInfo.message);
                }
            }

            if (!bodyData.response || !bodyData.response.body) {
                console.error('API 回應格式錯誤：缺少 response.body');
                throw new Error(MESSAGES.API.PARSE_ERROR.message);
            }

            let responseBody;
            try {
                responseBody = JSON.parse(bodyData.response.body);
            } catch (parseError) {
                console.error('Failed to parse response body:', parseError);
                throw new Error(MESSAGES.API.PARSE_ERROR.message);
            }
            console.log('Parsed response body:', responseBody);

            const content = responseBody.draft_text;
            
            if (!content || content.trim().length === 0) {
                throw new Error(MESSAGES.API.EMPTY_RESPONSE.message);
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
                reject(new Error(MESSAGES.FILE.READ_ERROR.message));
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
            throw new Error(MESSAGES.FILE.TOO_LARGE.message);
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!CONFIG.FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension)) {
            throw new Error(MESSAGES.FILE.UNSUPPORTED_FORMAT.message);
        }

        if (!CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type) && file.type !== '') {
            throw new Error(MESSAGES.FILE.UNSUPPORTED_TYPE.message);
        }

        return true;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
