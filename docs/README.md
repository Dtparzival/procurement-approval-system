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
│   ├── BUGFIX_HISTORY.md       # 合併的 Bug 修復歷史（推薦閱讀）
│   ├── BUGFIX_v1.5.1.md        # v1.5.1 修復報告
│   ├── BUGFIX_v1.5.1_hotfix.md # v1.5.1 Hotfix 報告
│   ├── BUGFIX_v1.5.3_comprehensive.md # v1.5.3 綜合報告
│   ├── BUGFIX_v1.5.4.md        # v1.5.4 Critical Hotfix
│   ├── BUGFIX_generate_approval.md # 生成簽呈功能改進
│   └── RCA_Report_v1.5.4.md    # v1.5.4 根本原因分析
├── deployment/                  # 部署和設定文件
│   ├── DEPLOYMENT.md           # 部署指南
│   ├── CLOUDFRONT_SETUP.md     # CloudFront 設定
│   ├── GOOGLE_OAUTH_SETUP.md   # Google OAuth 設定
│   └── GOOGLE_OAUTH_IMPLEMENTATION.md # Google OAuth 實作
├── testing/                     # 測試報告
│   ├── TESTING_REPORT.md       # 測試報告
│   └── TEST_RESULTS.md         # 測試結果
└── guides/                      # 開發指南
    └── PREVENTION_GUIDE.md     # 預防措施實施指南
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

1. **[預防措施實施指南](guides/PREVENTION_GUIDE.md)** - 如何避免常見錯誤
2. **[Bug 修復歷史](bugfix/BUGFIX_HISTORY.md)** - 了解過去的問題和解決方案
3. **[根本原因分析](bugfix/RCA_Report_v1.5.4.md)** - 深入了解系統失效的原因

### 運維人員

如果您負責系統運維，建議閱讀：

1. **[部署指南](deployment/DEPLOYMENT.md)** - 部署流程和注意事項
2. **[CloudFront 設定](deployment/CLOUDFRONT_SETUP.md)** - CDN 配置
3. **[Google OAuth 設定](deployment/GOOGLE_OAUTH_SETUP.md)** - 認證配置

### 質量保證

如果您負責質量保證，建議閱讀：

1. **[測試報告](testing/TESTING_REPORT.md)** - 測試計劃和結果
2. **[Bug 修復歷史](bugfix/BUGFIX_HISTORY.md)** - 已知問題和修復
3. **[根本原因分析](bugfix/RCA_Report_v1.5.4.md)** - 問題分析方法

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
| **BUGFIX_HISTORY.md** | 合併的 Bug 修復歷史（推薦） | ⭐⭐⭐ |
| RCA_Report_v1.5.4.md | v1.5.4 根本原因分析 | ⭐⭐⭐ |
| BUGFIX_v1.5.4.md | v1.5.4 Critical Hotfix | ⭐⭐ |
| BUGFIX_v1.5.3_comprehensive.md | v1.5.3 綜合報告 | ⭐⭐ |
| BUGFIX_v1.5.1_hotfix.md | v1.5.1 Hotfix 報告 | ⭐ |
| BUGFIX_v1.5.1.md | v1.5.1 修復報告 | ⭐ |
| BUGFIX_generate_approval.md | 生成簽呈功能改進 | ⭐ |

**推薦閱讀**: 先閱讀 `BUGFIX_HISTORY.md`，它整合了所有 Bug 修復報告的關鍵信息。

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

| 文件 | 描述 | 內容 |
|:---|:---|:---|
| TESTING_REPORT.md | 測試報告 | 測試計劃和執行結果 |
| TEST_RESULTS.md | 測試結果 | 詳細的測試數據 |

### 📖 開發指南 (guides/)

提供開發過程中的最佳實踐、工具使用和預防措施。

| 文件 | 描述 | 目標 |
|:---|:---|:---|
| PREVENTION_GUIDE.md | 預防措施實施指南 | 避免語法錯誤和質量問題 |

---

## 🔍 按主題查找

### GPTs 商業模式

- [GPTs Store 上架可行性分析](business/gpts-store-listing-analysis.md) - 評估智簽公文是否適合在 GPTs Store 上架，分析優劣勢和實施方案

### 登入和認證

- [Google OAuth 設定](deployment/GOOGLE_OAUTH_SETUP.md)
- [Google OAuth 實作](deployment/GOOGLE_OAUTH_IMPLEMENTATION.md)
- [v1.5.1 Hotfix - 初始化邏輯修復](bugfix/BUGFIX_HISTORY.md#v151-hotfix---初始化邏輯修復-2025-12-13)

### 草稿功能

- [v1.5.4 - 事件處理修復](bugfix/BUGFIX_HISTORY.md#v154---critical-hotfix-2025-12-13)
- [v1.5.1 Hotfix - 事件委派機制](bugfix/BUGFIX_HISTORY.md#v151-hotfix---初始化邏輯修復-2025-12-13)
- [v1.5.1 - 草稿管理功能驗證](bugfix/BUGFIX_HISTORY.md#v151---綜合功能修復-2025-12-13)

### Word 下載功能

- [v1.5.3 - Word 下載改進](bugfix/BUGFIX_HISTORY.md#v153---模型配置和下載功能-2025-12-13)
- [v1.5.1 - Word 下載功能修復](bugfix/BUGFIX_HISTORY.md#v151---綜合功能修復-2025-12-13)

### 簽呈生成

- [生成簽呈功能改進](bugfix/BUGFIX_HISTORY.md#生成簽呈功能改進-2025-12-13)
- [v1.5.3 - 模型配置修復](bugfix/BUGFIX_HISTORY.md#v153---模型配置和下載功能-2025-12-13)

### 質量保證

- [預防措施實施指南](guides/PREVENTION_GUIDE.md)
- [根本原因分析](bugfix/RCA_Report_v1.5.4.md)
- [測試報告](testing/TESTING_REPORT.md)

### 部署和運維

- [部署指南](deployment/DEPLOYMENT.md)
- [CloudFront 設定](deployment/CLOUDFRONT_SETUP.md)

---

## 📝 文件更新記錄

| 日期 | 更新內容 | 版本 |
|:---|:---|:---:|
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

**文件版本**: 1.1  
**最後更新**: 2025-12-13  
**維護者**: 開發團隊
