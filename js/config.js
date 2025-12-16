// Configuration for the Procurement Approval System

const CONFIG = {
    // API Configuration
    API: {
        // OpenAI API endpoint
        // 支援 OpenAI 模型：gpt-4o-mini, gpt-3.5-turbo, gpt-4o
        // 請在設定中輸入您的 OpenAI API Key
        BASE_URL: 'https://api.openai.com/v1',
        // Default model
        DEFAULT_MODEL: 'gpt-4o-mini',
        // Available models
        MODELS: [
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini (推薦)' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (快速)' },
            { value: 'gpt-4o', label: 'GPT-4o (最強)' }
        ],
        // 生成簽呈 API 端點
        // AWS API Gateway endpoint for document generation        GENERATE_ENDPOINT: 'https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat'
    },

    // Storage keys for localStorage
    STORAGE: {
        API_KEY: 'procurement_api_key',
        MODEL: 'procurement_model',
        DRAFTS: 'procurement_drafts',
        HISTORY: 'procurement_history',
        AUTO_SAVE: 'procurement_auto_save',
        CURRENT_DRAFT_ID: 'procurement_current_draft_id'
    },

    // Auto-save interval (milliseconds)
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds

    // File upload configuration
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ],
        ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp']
    },

    // System prompts for AI
    PROMPTS: {
        DOCUMENT_EXTRACTION: `你是一個專業的文件分析助手。請分析上傳的文件，識別出與採購相關的關鍵資訊。

請提取以下資訊：
- 採購物品/服務名稱
- 規格與型號
- 數量
- 單價與總價
- 採購目的與理由
- 使用單位/部門
- 預算來源
- 其他重要資訊

請以自然、流暢的文字描述這些資訊，不要使用條列式，像是在填寫簽呈的需求描述一樣。`,

        APPROVAL_GENERATION: `你是一個專業的公文撰寫助手，專門協助生成採購簽呈。

請根據使用者提供的採購需求，生成一份完整、專業的採購簽呈。

簽呈格式要求：
1. 標題：清楚說明採購項目
2. 主旨：簡要說明採購目的
3. 說明：詳細說明採購需求、規格、數量、預算等
4. 辦法：說明採購方式、預算來源、執行單位等
5. 擬辦：提出具體的建議和請示事項

注意事項：
- 使用正式的公文用語
- 條理清晰，邏輯嚴謹
- 包含所有必要的採購資訊
- 符合政府採購法規範
- 使用 Markdown 格式，適當使用標題、列表等

請生成完整的簽呈內容。`
    },

    // UI Configuration
    UI: {
        TOAST_DURATION: 3000, // 3 seconds
        MAX_RECENT_DRAFTS: 6,
        MAX_HISTORY_ITEMS: 50
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
