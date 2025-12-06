// Local Storage Management Module

const Storage = {
    /**
     * Get API key from localStorage
     */
    getApiKey() {
        return localStorage.getItem(CONFIG.STORAGE.API_KEY) || '';
    },

    /**
     * Set API key to localStorage
     */
    setApiKey(apiKey) {
        localStorage.setItem(CONFIG.STORAGE.API_KEY, apiKey);
    },

    /**
     * Get selected model from localStorage
     */
    getModel() {
        return localStorage.getItem(CONFIG.STORAGE.MODEL) || CONFIG.API.DEFAULT_MODEL;
    },

    /**
     * Set selected model to localStorage
     */
    setModel(model) {
        localStorage.setItem(CONFIG.STORAGE.MODEL, model);
    },

    /**
     * Get auto-save setting
     */
    getAutoSave() {
        const value = localStorage.getItem(CONFIG.STORAGE.AUTO_SAVE);
        return value === null ? true : value === 'true';
    },

    /**
     * Set auto-save setting
     */
    setAutoSave(enabled) {
        localStorage.setItem(CONFIG.STORAGE.AUTO_SAVE, enabled.toString());
    },

    /**
     * Get all drafts
     */
    getDrafts() {
        const draftsJson = localStorage.getItem(CONFIG.STORAGE.DRAFTS);
        return draftsJson ? JSON.parse(draftsJson) : [];
    },

    /**
     * Save a draft
     */
    saveDraft(draft) {
        const drafts = this.getDrafts();
        const timestamp = new Date().toISOString();

        if (draft.id) {
            // Update existing draft
            const index = drafts.findIndex(d => d.id === draft.id);
            if (index !== -1) {
                drafts[index] = {
                    ...drafts[index],
                    ...draft,
                    updatedAt: timestamp
                };
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
        }

        localStorage.setItem(CONFIG.STORAGE.DRAFTS, JSON.stringify(drafts));
        return drafts[0];
    },

    /**
     * Delete a draft
     */
    deleteDraft(id) {
        const drafts = this.getDrafts();
        const filtered = drafts.filter(d => d.id !== id);
        localStorage.setItem(CONFIG.STORAGE.DRAFTS, JSON.stringify(filtered));
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
        const id = localStorage.getItem(CONFIG.STORAGE.CURRENT_DRAFT_ID);
        return id ? parseInt(id) : null;
    },

    /**
     * Set current draft ID
     */
    setCurrentDraftId(id) {
        if (id) {
            localStorage.setItem(CONFIG.STORAGE.CURRENT_DRAFT_ID, id.toString());
        } else {
            localStorage.removeItem(CONFIG.STORAGE.CURRENT_DRAFT_ID);
        }
    },

    /**
     * Get all history items (generated approvals)
     */
    getHistory() {
        const historyJson = localStorage.getItem(CONFIG.STORAGE.HISTORY);
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

        localStorage.setItem(CONFIG.STORAGE.HISTORY, JSON.stringify(history));
        return newItem;
    },

    /**
     * Delete a history item
     */
    deleteHistory(id) {
        const history = this.getHistory();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(CONFIG.STORAGE.HISTORY, JSON.stringify(filtered));
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
     * Import data from JSON
     */
    importData(data) {
        if (data.drafts) {
            localStorage.setItem(CONFIG.STORAGE.DRAFTS, JSON.stringify(data.drafts));
        }
        if (data.history) {
            localStorage.setItem(CONFIG.STORAGE.HISTORY, JSON.stringify(data.history));
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
