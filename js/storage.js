// Local Storage Management Module with Multi-User Support

const Storage = {
    /**
     * Get user-specific storage key
     * 修改：直接使用通用 key，不再按用戶隔離
     */
    getUserKey(key) {
        return key;
    },

    /**
     * Get API key from localStorage
     */
    getApiKey() {
        return localStorage.getItem(this.getUserKey(CONFIG.STORAGE.API_KEY)) || '';
    },

    /**
     * Set API key to localStorage
     */
    setApiKey(apiKey) {
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.API_KEY), apiKey);
    },

    /**
     * Get selected model from localStorage
     */
    getModel() {
        return localStorage.getItem(this.getUserKey(CONFIG.STORAGE.MODEL)) || CONFIG.API.DEFAULT_MODEL;
    },

    /**
     * Set selected model to localStorage
     */
    setModel(model) {
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.MODEL), model);
    },

    /**
     * Get auto-save setting
     */
    getAutoSave() {
        const value = localStorage.getItem(this.getUserKey(CONFIG.STORAGE.AUTO_SAVE));
        return value === null ? true : value === 'true';
    },

    /**
     * Set auto-save setting
     */
    setAutoSave(enabled) {
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.AUTO_SAVE), enabled.toString());
    },

    /**
     * Get all drafts
     */
    getDrafts() {
        const draftsJson = localStorage.getItem(this.getUserKey(CONFIG.STORAGE.DRAFTS));
        return draftsJson ? JSON.parse(draftsJson) : [];
    },

    /**
     * Save a draft
     */
    saveDraft(draft) {
        const drafts = this.getDrafts();
        const timestamp = new Date().toISOString();
        let savedDraft;

        if (draft.id) {
            // Update existing draft
            const index = drafts.findIndex(d => d.id === draft.id);
            if (index !== -1) {
                // 草稿存在，更新它
                drafts[index] = {
                    ...drafts[index],
                    ...draft,
                    updatedAt: timestamp
                };
                savedDraft = drafts[index];
            } else {
                // 草稿不存在（可能已被刪除），創建新草稿
                const newDraft = {
                    id: Date.now(),
                    title: draft.title || '未命名草稿',
                    userInput: draft.userInput,
                    attachments: draft.attachments || [],
                    createdAt: timestamp,
                    updatedAt: timestamp
                };
                drafts.unshift(newDraft);
                savedDraft = newDraft;
            }
        } else {
            // Create new draft
            const newDraft = {
                id: Date.now(),
                title: draft.title || '未命名草稿',
                userInput: draft.userInput,
                attachments: draft.attachments || [],
                createdAt: timestamp,
                updatedAt: timestamp
            };
            drafts.unshift(newDraft);
            savedDraft = newDraft;
        }

        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(drafts));
        return savedDraft;
    },

    /**
     * Delete a draft
     */
    deleteDraft(id) {
        const drafts = this.getDrafts();
        const filtered = drafts.filter(d => d.id !== id);
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(filtered));
    },

    /**
     * Get draft by ID
     */
    getDraftById(id) {
        const drafts = this.getDrafts();
        return drafts.find(d => d.id === id);
    },

    /**
     * Get recent drafts
     */
    getRecentDrafts(limit = CONFIG.UI.MAX_RECENT_DRAFTS) {
        const drafts = this.getDrafts();
        return drafts.slice(0, limit);
    },

    /**
     * Get current draft ID
     */
    getCurrentDraftId() {
        const id = localStorage.getItem(this.getUserKey(CONFIG.STORAGE.CURRENT_DRAFT_ID));
        return id ? parseInt(id) : null;
    },

    /**
     * Set current draft ID
     */
    setCurrentDraftId(id) {
        if (id) {
            localStorage.setItem(this.getUserKey(CONFIG.STORAGE.CURRENT_DRAFT_ID), id.toString());
        } else {
            localStorage.removeItem(this.getUserKey(CONFIG.STORAGE.CURRENT_DRAFT_ID));
        }
    },

    /**
     * Get all history items (generated approvals)
     */
    getHistory() {
        const historyJson = localStorage.getItem(this.getUserKey(CONFIG.STORAGE.HISTORY));
        return historyJson ? JSON.parse(historyJson) : [];
    },

    /**
     * Save a history item
     */
    saveHistory(item) {
        const history = this.getHistory();
        const timestamp = new Date().toISOString();

        const newItem = {
            id: Date.now(),
            title: item.title,
            content: item.content,
            userInput: item.userInput,
            attachments: item.attachments || [],
            createdAt: timestamp
        };

        history.unshift(newItem);

        // Keep only the most recent items
        if (history.length > CONFIG.UI.MAX_HISTORY_ITEMS) {
            history.splice(CONFIG.UI.MAX_HISTORY_ITEMS);
        }

        try {
            localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(history));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                // 儲存空間不足，刪除較舊的歷史記錄
                console.warn('localStorage quota exceeded, removing old history items');
                history.splice(Math.floor(CONFIG.UI.MAX_HISTORY_ITEMS / 2));
                try {
                    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(history));
                } catch (e2) {
                    // 仍然失敗，清空歷史記錄
                    console.error('Failed to save history even after cleanup:', e2);
                    localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify([newItem]));
                }
            } else {
                throw e;
            }
        }
        return newItem;
    },

    /**
     * Delete a history item
     */
    deleteHistory(id) {
        const history = this.getHistory();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(filtered));
    },

    /**
     * Get history item by ID
     */
    getHistoryById(id) {
        const history = this.getHistory();
        return history.find(h => h.id === id);
    },

    /**
     * Clear all data
     */
    clearAll() {
        Object.values(CONFIG.STORAGE).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    /**
     * Export all data as JSON
     */
    exportData() {
        return {
            drafts: this.getDrafts(),
            history: this.getHistory(),
            settings: {
                model: this.getModel(),
                autoSave: this.getAutoSave()
            },
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Load user data (called after login)
     */
    loadUserData(userId) {
        console.log('Loading user data for:', userId);
    },

    /**
     * Clear authentication data
     */
    clearAuth() {
        // 清除認證相關的 localStorage 項目
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        // 可以保留設定和草稿，不清除
    },
    
    /**
     * Import data from JSON
     */
    importData(data) {
        if (data.drafts) {
            localStorage.setItem(this.getUserKey(CONFIG.STORAGE.DRAFTS), JSON.stringify(data.drafts));
        }
        if (data.history) {
            localStorage.setItem(this.getUserKey(CONFIG.STORAGE.HISTORY), JSON.stringify(data.history));
        }
        if (data.settings) {
            if (data.settings.model) {
                this.setModel(data.settings.model);
            }
            if (data.settings.autoSave !== undefined) {
                this.setAutoSave(data.settings.autoSave);
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
