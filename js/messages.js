/**
 * Agent 智簽公文 - 訊息配置檔案
 * 
 * 本檔案集中管理所有使用者介面的文字訊息，
 * 方便日後維護和多語言支援。
 * 
 * 更新說明：
 * 1. 修改訊息時，請同步更新 docs/ERROR_CODES.md
 * 2. 新增錯誤代碼時，請遵循命名規則
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-20
 */

const MESSAGES = {
    /**
     * 外部連結配置
     * 方便日後更新維護，不需修改 HTML
     */
    LINKS: {
        USER_GUIDE: 'https://drive.google.com/open?id=1fGUktdi1W-aCehWaezFmtXO4CxUOpncF',
        SUPPORT_EMAIL: 'support@cathayholdings.com.tw'
    },

    /**
     * API 相關錯誤
     */
    API: {
        // HTTP 狀態碼對應的錯誤
        HTTP_401: {
            code: 'API_401',
            title: 'API Key 無效',
            message: '請在設定中更新 API Key。'
        },
        HTTP_429: {
            code: 'API_429',
            title: '請求過於頻繁',
            message: '請稍等幾分鐘後再試。'
        },
        HTTP_500: {
            code: 'API_500',
            title: 'AI 服務暫時無法使用',
            message: '請稍後再試，或聯絡技術支援。'
        },
        HTTP_502: {
            code: 'API_502',
            title: 'AI 服務暫時無法使用',
            message: '請稍後再試，或聯絡技術支援。'
        },
        HTTP_503: {
            code: 'API_503',
            title: '服務維護中',
            message: '系統正在進行例行維護，請稍後再試。'
        },
        UNKNOWN: {
            code: 'API_UNKNOWN',
            title: '產生失敗',
            message: '請稍後再試。'
        },
        PARSE_ERROR: {
            code: 'API_PARSE_ERROR',
            title: '產生失敗',
            message: '請稍後再試，或聯絡技術支援。'
        },
        EMPTY_RESPONSE: {
            code: 'API_EMPTY_RESPONSE',
            title: 'AI 無法生成內容',
            message: '請提供更詳細的採購需求描述後再試。'
        },
        NO_API_KEY: {
            code: 'AUTH_NO_API_KEY',
            title: '未設定 API Key',
            message: '請先在設定中輸入 API Key。'
        }
    },

    /**
     * 網路相關錯誤
     */
    NETWORK: {
        FAILED_FETCH: {
            code: 'NET_FAILED_FETCH',
            title: '網路連線失敗',
            message: '請檢查網路連線後再試。'
        },
        TIMEOUT: {
            code: 'NET_TIMEOUT',
            title: '網路連線失敗',
            message: '請求逾時，請檢查網路連線後再試。'
        }
    },

    /**
     * 檔案相關錯誤
     */
    FILE: {
        TOO_LARGE: {
            code: 'FILE_TOO_LARGE',
            title: '檔案過大',
            message: '檔案大小不能超過 10MB。'
        },
        UNSUPPORTED_FORMAT: {
            code: 'FILE_UNSUPPORTED_FORMAT',
            title: '不支援的格式',
            message: '不支援的檔案格式。'
        },
        UNSUPPORTED_TYPE: {
            code: 'FILE_UNSUPPORTED_TYPE',
            title: '不支援的類型',
            message: '不支援的檔案類型。'
        },
        READ_ERROR: {
            code: 'FILE_READ_ERROR',
            title: '檔案讀取失敗',
            message: '檔案讀取失敗，請重新上傳。'
        },
        PDF_EXTRACT_ERROR: {
            code: 'FILE_PDF_EXTRACT_ERROR',
            title: 'PDF 處理失敗',
            message: '無法提取 PDF 文本。'
        },
        WORD_EXTRACT_ERROR: {
            code: 'FILE_WORD_EXTRACT_ERROR',
            title: 'Word 處理失敗',
            message: '無法提取 Word 文本。'
        },
        PROCESS_ERROR: {
            code: 'FILE_PROCESS_ERROR',
            title: '檔案處理失敗',
            message: '檔案處理失敗，請重新上傳。'
        }
    },

    /**
     * 認證相關錯誤
     */
    AUTH: {
        LOGIN_FAILED: {
            code: 'AUTH_LOGIN_FAILED',
            title: '登入失敗',
            message: '登入失敗，請稍後再試。'
        },
        NO_API_KEY: {
            code: 'AUTH_NO_API_KEY',
            title: '未設定 API Key',
            message: '請先在設定中輸入 API Key。'
        },
        INVALID_API_KEY: {
            code: 'AUTH_INVALID_API_KEY',
            title: 'API Key 無效',
            message: '請在設定中更新 API Key。'
        }
    },

    /**
     * 輸入驗證錯誤
     */
    INPUT: {
        EMPTY_DESCRIPTION: {
            code: 'INPUT_EMPTY_DESCRIPTION',
            title: '輸入不完整',
            message: '請輸入採購需求描述。'
        },
        EMPTY_CONTENT: {
            code: 'INPUT_EMPTY_CONTENT',
            title: '內容為空',
            message: '內容不能為空。'
        },
        EMPTY_API_KEY: {
            code: 'INPUT_EMPTY_API_KEY',
            title: '設定不完整',
            message: '請輸入 API Key。'
        }
    },

    /**
     * 使用者介面錯誤
     */
    UI: {
        NO_CONTENT: {
            code: 'UI_NO_CONTENT',
            title: '無內容',
            message: '沒有可下載的內容。'
        },
        PRINT_BLOCKED: {
            code: 'UI_PRINT_BLOCKED',
            title: '列印失敗',
            message: '無法開啟列印視窗，請檢查瀏覽器設定。'
        },
        COPY_FAILED: {
            code: 'UI_COPY_FAILED',
            title: '複製失敗',
            message: '複製失敗，請手動選取複製。'
        },
        DRAFT_NOT_FOUND: {
            code: 'UI_DRAFT_NOT_FOUND',
            title: '草稿不存在',
            message: '找不到指定的草稿。'
        },
        PDF_GENERATE_ERROR: {
            code: 'UI_PDF_GENERATE_ERROR',
            title: 'PDF 生成失敗',
            message: 'PDF 文件生成失敗，請重試。'
        }
    },

    /**
     * 載入狀態訊息
     */
    LOADING: {
        ANALYZING: '正在分析您的需求...',
        ORGANIZING: '正在組織簽呈內容...',
        OPTIMIZING: '正在優化公文格式...',
        PROCESSING_FILE: '正在處理檔案...',
        PREPARING_PDF: '正在準備 PDF 下載...'
    },

    /**
     * 成功訊息
     */
    SUCCESS: {
        GENERATE: '簽呈生成成功！',
        COPY: '已複製到剪貼簿',
        SAVE_DRAFT: '草稿已儲存',
        AUTO_SAVE_DRAFT: '草稿已自動儲存',
        LOAD_DRAFT: '草稿已載入',
        DELETE_DRAFT: '草稿已刪除',
        SAVE_EDIT: '編輯已儲存',
        SAVE_SETTINGS: '設定已儲存',
        FILE_UPLOAD: '檔案處理成功',
        LOGIN: '歡迎回來',
        PRINT_HINT: '請在列印對話框中選擇「另存為 PDF」'
    },

    /**
     * 預設訊息
     */
    DEFAULT: {
        ERROR_TITLE: '產生失敗',
        ERROR_MESSAGE: '系統發生錯誤，請稍後再試',
        GENERATE_FAILED: '產生失敗，請查看錯誤詳情'
    },

    /**
     * 確認對話框訊息
     */
    CONFIRM: {
        LOGOUT: '確定要登出嗎？',
        DELETE_DRAFT: '確定要刪除這個草稿嗎？',
        DELETE_HISTORY: '確定要刪除這筆記錄嗎？'
    }
};

/**
 * 根據 HTTP 狀態碼取得對應的錯誤訊息
 * @param {number} statusCode - HTTP 狀態碼
 * @returns {Object} 錯誤訊息物件 {code, title, message}
 */
MESSAGES.getApiError = function(statusCode) {
    const key = `HTTP_${statusCode}`;
    return this.API[key] || this.API.UNKNOWN;
};

/**
 * 根據錯誤訊息內容判斷錯誤類型並取得標題
 * @param {string} errorMessage - 錯誤訊息
 * @returns {string} 錯誤標題
 */
MESSAGES.getErrorTitle = function(errorMessage) {
    if (!errorMessage) return this.DEFAULT.ERROR_TITLE;
    
    // 檢查是否為網路錯誤
    if (errorMessage.includes('網路') || 
        errorMessage.includes('network') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('Failed to fetch')) {
        return this.NETWORK.FAILED_FETCH.title;
    }
    
    // 檢查是否為 API 相關錯誤
    if (errorMessage.includes('500') || errorMessage.includes('服務暫時無法使用')) {
        return this.API.HTTP_500.title;
    }
    if (errorMessage.includes('503') || errorMessage.includes('維護')) {
        return this.API.HTTP_503.title;
    }
    if (errorMessage.includes('429') || errorMessage.includes('請求次數過多') || errorMessage.includes('頻繁')) {
        return this.API.HTTP_429.title;
    }
    if (errorMessage.includes('401') || errorMessage.includes('API Key')) {
        return this.API.HTTP_401.title;
    }
    
    // 檢查是否為內容相關錯誤
    if (errorMessage.includes('內容為空') || errorMessage.includes('無法生成')) {
        return this.API.EMPTY_RESPONSE.title;
    }
    
    return this.DEFAULT.ERROR_TITLE;
};

// 凍結物件，防止意外修改
Object.freeze(MESSAGES.API);
Object.freeze(MESSAGES.NETWORK);
Object.freeze(MESSAGES.FILE);
Object.freeze(MESSAGES.AUTH);
Object.freeze(MESSAGES.INPUT);
Object.freeze(MESSAGES.UI);
Object.freeze(MESSAGES.LOADING);
Object.freeze(MESSAGES.SUCCESS);
Object.freeze(MESSAGES.DEFAULT);
Object.freeze(MESSAGES.CONFIRM);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MESSAGES;
}
