# 📚 文件索引

本目錄包含採購公文系統 DEV 分支的所有技術文件和報告。

---

## 📂 目錄結構

```
docs/
├── README.md                    # 本文件（索引）
├── business/                    # 商業分析和策略
│   └── gpts-store-listing-analysis.md       # GPTs Store 上架可行性分析
├── bugfix/                      # Bug 修復報告
│   ├── BUGFIX_HISTORY.md       # 所有 Bug 修復的整合歷史
│   ├── RCA_v1.5.4.md           # v1.5.4 根本原因分析
│   └── archive/                # 歸檔的詳細報告
│       ├── README.md           # 歸檔說明
│       ├── BUGFIX_v1.5.1.md
│       ├── BUGFIX_v1.5.1_hotfix.md
│       ├── BUGFIX_v1.5.3_comprehensive.md
│       ├── BUGFIX_v1.5.4.md
│       └── BUGFIX_generate_approval.md
├── deployment/                  # 部署和設定文件
│   ├── DEPLOYMENT.md           # 部署指南
│   ├── CLOUDFRONT_SETUP.md     # CloudFront 設定
│   ├── GOOGLE_OAUTH_SETUP.md   # Google OAuth 設定
│   └── GOOGLE_OAUTH_IMPLEMENTATION.md # Google OAuth 實作
├── testing/                     # 測試報告
│   ├── README.md               # 測試報告索引
│   ├── core-features-test-2025-12-13.md    # 核心功能測試
│   └── ui-oauth-test-2025-12-06.md         # UI 優化和 Google 認證測試
└── guides/                      # 開發指南
    ├── PREVENTION_GUIDE.md     # 預防措施實施指南
    └── login-state-management.md # 登入狀態管理指南
```

---

## 🚀 快速導航

### 新手入門

如果您是第一次接觸這個專案，建議按以下順序閱讀：

1. **[README.md](../README.md)** - 專案概述和快速開始
2. **[CHANGELOG_DEV.md](../CHANGELOG_DEV.md)** - 版本變更記錄
3. **[部署指南](deployment/DEPLOYMENT.md)** - 如何部署系統

### 商業決策

如果您負責商業決策和策略規劃，建議閱讀：

1. **[GPTs Store 上架分析](business/gpts-store-listing-analysis.md)** - 評估上架 GPTs Store 的優劣勢和實施方案

### 開發人員

如果您是開發人員，建議閱讀：

1. **[登入狀態管理指南](guides/login-state-management.md)** - 了解登入狀態管理機制
2. **[預防措施實施指南](guides/PREVENTION_GUIDE.md)** - 如何避免常見錯誤
3. **[Bug 修復歷史](bugfix/BUGFIX_HISTORY.md)** - 了解過去的問題和解決方案
4. **[根本原因分析](bugfix/RCA_v1.5.4.md)** - 深入了解系統失效的原因

### 運維人員

如果您負責系統運維，建議閱讀：

1. **[部署指南](deployment/DEPLOYMENT.md)** - 部署流程和注意事項
2. **[CloudFront 設定](deployment/CLOUDFRONT_SETUP.md)** - CDN 配置
3. **[Google OAuth 設定](deployment/GOOGLE_OAUTH_SETUP.md)** - 認證配置

### 質量保證

如果您負責質量保證，建議閱讀：

1. **[測試報告索引](testing/README.md)** - 所有測試報告的索引和摘要
2. **[核心功能測試](testing/core-features-test-2025-12-13.md)** - 最新的核心功能測試結果
3. **[Bug 修復歷史](bugfix/BUGFIX_HISTORY.md)** - 已知問題和修復

---

## 📋 文件分類

### 💼 商業分析和策略 (business/)

記錄系統的商業模式分析、市場研究和策略規劃。

| 文件 | 描述 | 優先級 |
|:---|:---|:---:|
| **gpts-store-listing-analysis.md** | GPTs Store 上架可行性分析 | ⭐⭐⭐⭐⭐ |

**推薦閱讀**: 這份報告深入分析了智簽公文是否適合在 GPTs Store 上架，評估優劣勢並提供「雙軌並行」策略建議。對於商業決策和策略規劃至關重要。

### 🐛 Bug 修復報告 (bugfix/)

記錄系統的所有 Bug 修復過程，包括問題描述、根本原因、修復方案和測試結果。

| 文件 | 描述 | 優先級 |
|:---|:---|:---:|
| **BUGFIX_HISTORY.md** | 所有 Bug 修復的整合歷史（推薦閱讀） | ⭐⭐⭐⭐⭐ |
| **RCA_v1.5.4.md** | v1.5.4 根本原因分析報告 | ⭐⭐⭐⭐ |
| **archive/** | 歸檔的詳細修復報告（5 個文件） | ⭐⭐ |

**推薦閱讀順序**：
1. 先閱讀 `BUGFIX_HISTORY.md` 了解所有修復的摘要
2. 如需深入了解 v1.5.4 的根本原因，閱讀 `RCA_v1.5.4.md`
3. 如需查閱特定版本的詳細報告，查看 `archive/` 目錄

**archive/ 目錄**：包含已歸檔的詳細 Bug 修復報告，這些報告的摘要已整合到 `BUGFIX_HISTORY.md`。

### 🚀 部署和設定 (deployment/)

記錄系統的部署流程、環境配置和第三方服務設定。

| 文件 | 描述 | 用途 |
|:---|:---|:---|
| DEPLOYMENT.md | 部署指南 | 部署系統到生產環境 |
| CLOUDFRONT_SETUP.md | CloudFront 設定 | 配置 CDN 加速 |
| GOOGLE_OAUTH_SETUP.md | Google OAuth 設定 | 配置 Google 登入 |
| GOOGLE_OAUTH_IMPLEMENTATION.md | Google OAuth 實作 | 實作細節和代碼說明 |

### 📊 測試報告 (testing/)

記錄系統的測試計劃、測試用例和測試結果。

| 文件 | 測試日期 | 描述 | 狀態 |
|:---|:---|:---|:---:|
| **README.md** | - | 測試報告索引和摘要 | ⭐⭐⭐⭐⭐ |
| **core-features-test-2025-12-13.md** | 2025-12-13 | 核心功能測試（草稿、下載、API 等） | ✅ 通過 |
| **ui-oauth-test-2025-12-06.md** | 2025-12-06 | UI 優化和 Google 認證測試 | ✅ 通過 |

**推薦閱讀順序**：
1. 先閱讀 `README.md` 了解測試覆蓋範圍和摘要
2. 查看最新的 `core-features-test-2025-12-13.md` 了解核心功能測試結果
3. 如需了解 UI 和認證測試，閱讀 `ui-oauth-test-2025-12-06.md`

**測試覆蓋率**：100%（22/22 測試項目通過）

### 📖 開發指南 (guides/)

提供開發過程中的最佳實踐、工具使用和預防措施。

| 文件 | 描述 | 目標 |
|:---|:---|:---|
| **login-state-management.md** | 登入狀態管理指南 | 了解 Hero 區塊顯示邏輯、登入按鈕控制、用戶體驗優化 |
| PREVENTION_GUIDE.md | 預防措施實施指南 | 避免語法錯誤和質量問題 |

---

## 🔍 按主題查找

### GPTs 商業模式

- [GPTs Store 上架可行性分析](business/gpts-store-listing-analysis.md) - 評估智簽公文是否適合在 GPTs Store 上架，分析優劣勢和實施方案

### 登入和認證

- **[登入狀態管理指南](guides/login-state-management.md)** - 了解 Hero 區塊顯示邏輯、登入按鈕控制、用戶體驗優化
- [Google OAuth 設定](deployment/GOOGLE_OAUTH_SETUP.md)
- [Google OAuth 實作](deployment/GOOGLE_OAUTH_IMPLEMENTATION.md)
- [UI/OAuth 測試報告](testing/ui-oauth-test-2025-12-06.md)
- [v1.5.1 Hotfix - 初始化邏輯修復](bugfix/BUGFIX_HISTORY.md#v151-hotfix---初始化邏輯修復-2025-12-13)

### 草稿功能

- [核心功能測試 - 草稿管理](testing/core-features-test-2025-12-13.md)
- [v1.5.4 - 事件處理修復](bugfix/BUGFIX_HISTORY.md#v154---critical-hotfix-2025-12-13)
- [v1.5.1 Hotfix - 事件委派機制](bugfix/BUGFIX_HISTORY.md#v151-hotfix---初始化邏輯修復-2025-12-13)
- [v1.5.1 - 草稿管理功能驗證](bugfix/BUGFIX_HISTORY.md#v151---綜合功能修復-2025-12-13)

### Word 下載功能

- [核心功能測試 - Word 下載](testing/core-features-test-2025-12-13.md)
- [v1.5.3 - Word 下載改進](bugfix/BUGFIX_HISTORY.md#v153---模型配置和下載功能-2025-12-13)
- [v1.5.1 - Word 下載功能修復](bugfix/BUGFIX_HISTORY.md#v151---綜合功能修復-2025-12-13)

### 簽呈生成

- [核心功能測試 - API 生成](testing/core-features-test-2025-12-13.md)
- [生成簽呈功能改進](bugfix/BUGFIX_HISTORY.md#生成簽呈功能改進-2025-12-13)
- [v1.5.3 - 模型配置修復](bugfix/BUGFIX_HISTORY.md#v153---模型配置和下載功能-2025-12-13)

### 質量保證

- [測試報告索引](testing/README.md)
- [核心功能測試](testing/core-features-test-2025-12-13.md)
- [預防措施實施指南](guides/PREVENTION_GUIDE.md)
- [根本原因分析](bugfix/RCA_v1.5.4.md)

### 部署和運維

- [部署指南](deployment/DEPLOYMENT.md)
- [CloudFront 設定](deployment/CLOUDFRONT_SETUP.md)

---

## 📝 文件更新記錄

| 日期 | 更新內容 | 版本 |
|:---|:---|:---:|
| 2025-12-13 | 新增登入狀態管理指南 | 1.4 |
| 2025-12-13 | 優化 testing 目錄，重命名測試報告 | 1.3 |
| 2025-12-13 | 新增 testing/README.md 測試報告索引 | 1.3 |
| 2025-12-13 | 整併 bugfix 目錄，歸檔詳細報告 | 1.2 |
| 2025-12-13 | 重命名 RCA_Report_v1.5.4.md → RCA_v1.5.4.md | 1.2 |
| 2025-12-13 | 新增 business/ 目錄和商業分析文件 | 1.1 |
| 2025-12-13 | 重命名商業分析文件（使用小寫連字符） | 1.1 |
| 2025-12-13 | 創建文件索引和目錄結構 | 1.0 |
| 2025-12-13 | 合併 BUGFIX 文件為 BUGFIX_HISTORY.md | 1.0 |
| 2025-12-13 | 整理文件到分類目錄 | 1.0 |

---

## 🆘 需要幫助？

### 找不到需要的文件？

1. 使用本文件的「按主題查找」章節
2. 查看 [CHANGELOG_DEV.md](../CHANGELOG_DEV.md) 的版本記錄
3. 搜尋 GitHub Issues

### 文件有錯誤或過時？

1. 提交 GitHub Issue
2. 創建 Pull Request 修正
3. 聯繫維護團隊

### 想要貢獻文件？

1. 閱讀 [預防措施實施指南](guides/PREVENTION_GUIDE.md)
2. 遵循文件格式和風格
3. 提交 Pull Request

---

## 📚 延伸閱讀

- [專案 README](../README.md)
- [版本變更記錄](../CHANGELOG_DEV.md)
- [GitHub Repository](https://github.com/Dtparzival/procurement-approval-system)

---

**文件版本**: 1.3  
**最後更新**: 2025-12-13  
**維護者**: 開發團隊
