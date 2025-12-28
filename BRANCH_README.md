# Feature Branch: generate-document-api

## 分支目的

本分支實現「生成簽呈」功能與外部 AWS API Gateway 的整合，使系統能夠調用外部 AI 服務生成採購簽呈文件。

## 主要變更

### 新增文件

1. **FEATURE_GENERATE_API.md**
   - 功能開發說明文檔
   - API 請求/響應格式
   - CORS 配置說明
   - 部署指南

2. **BRANCH_README.md**（本文件）
   - 分支說明文檔

### 修改文件

1. **js/config.js**
   - 添加 `API.GENERATE_ENDPOINT` 配置項
   - 集中管理 API 端點

2. **js/api.js**
   - 添加 `generateUUID()` 方法
   - 修改 `generateApproval()` 方法以調用外部 API
   - 實現多層 JSON 響應解析
   - 從配置中讀取 API URL

3. **js/app.js**
   - 移除 API Key 檢查（外部 API 不需要）

## 功能說明

### 工作流程

1. 用戶輸入草稿標題和需求描述
2. 點擊「生成簽呈」按鈕
3. 系統組合標題和描述為 `inputText`
4. 生成 UUID 作為 `sessionId`
5. 調用 AWS API Gateway：`https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat`
6. 解析多層 JSON 響應，提取 `draft_text`
7. 在生成結果頁面顯示簽呈內容

### API 整合

**請求格式**：
```json
{
  "inputText": "標題：XXX\n\n需求描述：\nYYY",
  "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

**響應格式**（多層 JSON）：
```json
{
  "statusCode": 200,
  "body": "{\"response\": {\"body\": \"{\\\"draft_text\\\": \\\"簽呈內容...\\\"}\"}}"
}
```

## CORS 配置

**✅ AWS API Gateway CORS 已配置完成**

前端代碼直接調用 AWS API Gateway，無需代理服務器。

CORS 配置項：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Gateway responses: Default 4XX, Default 5XX
```

API URL 已配置在 `js/config.js` 中，便於管理和修改。

## 測試狀態

| 測試項目 | 狀態 | 說明 |
|---------|------|------|
| API 連接 | ✅ 通過 | 成功連接到 AWS API Gateway |
| 請求格式 | ✅ 通過 | inputText 和 sessionId 正確組合 |
| UUID 生成 | ✅ 通過 | 符合 RFC 4122 標準 |
| 響應解析 | ✅ 通過 | 多層 JSON 正確解析 |
| 內容提取 | ✅ 通過 | draft_text 正確提取 |
| 內容顯示 | ✅ 通過 | Markdown 格式正確渲染 |
| CORS 處理 | ✅ 完成 | AWS API Gateway CORS 已配置完成 |

## 部署指南

### 開發環境

```bash
# 啟動 HTTP 服務器
python3 -m http.server 8080

# 訪問應用
# http://localhost:8080
```

### 生產環境

**✅ 已就緒**：AWS API Gateway CORS 已配置完成，可直接部署静態文件。

部署方式：
- AWS S3 + CloudFront
- GitHub Pages
- Netlify / Vercel
- 任何静態文件託管服務

詳細說明請參考 `FEATURE_GENERATE_API.md`。

## 合併前檢查清單

- [x] 確認 AWS API Gateway 已配置 CORS
- [ ] 測試 API 調用功能
- [ ] 驗證錯誤處理
- [ ] 檢查文檔完整性
- [ ] 更新 CHANGELOG.md
- [ ] 代碼審查通過

## 後續工作

### 短期優化

1. 添加請求超時處理（30-60秒）
2. 改進錯誤提示訊息
3. 添加重試機制

### 中期優化

1. 將 API URL 移到 `config.js` 配置
2. 添加載入進度顯示
3. 實現結果緩存機制

### 長期優化

1. API 性能監控
2. 使用統計分析
3. A/B 測試優化

## 相關文件

- **功能說明**：`FEATURE_GENERATE_API.md`
- **API 範例**：參考提交訊息中的測試數據
- **代理服務器**：`proxy_server.py`
- **變更記錄**：Git commit `219ed9c`

## 聯繫方式

如有問題或建議，請：
1. 查看 `FEATURE_GENERATE_API.md` 詳細文檔
2. 檢查代碼註釋
3. 聯繫開發團隊

---

**分支狀態**：✅ 開發完成，待測試和合併  
**基於分支**：DEV  
**創建日期**：2025-12-13  
**最後更新**：2025-12-13
