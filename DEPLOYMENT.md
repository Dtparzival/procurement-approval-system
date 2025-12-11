# 部署指南：AI 智能公文簽核系統（靜態版）

本文件提供將「AI 智能公文簽核系統」靜態網頁版本部署到各種平台的完整指南。

## 📚 目錄

1.  [部署平台比較](#1-部署平台比較)
2.  [部署到 AWS S3（推薦）](#2-部署到-aws-s3推薦)
    *   [前置準備](#前置準備)
    *   [方法一：自動化腳本](#方法一自動化腳本)
    *   [方法二：手動上傳](#方法二手動上傳)
    *   [成本估算](#成本估算)
3.  [部署到 GitHub Pages](#3-部署到-github-pages)
4.  [部署到 Netlify 或 Vercel](#4-部署到-netlify-或-vercel)
5.  [進階設定：CloudFront CDN](#5-進階設定cloudfront-cdn)
6.  [檔案結構說明](#6-檔案結構說明)

---

## 1. 部署平台比較

您可以根據需求選擇最適合的平台進行部署。

| 平台 | 優點 | 缺點 | 推薦場景 |
| :--- | :--- | :--- | :--- |
| **AWS S3** | 高可用性、穩定、成本極低、可擴展性強 | 設定稍複雜，HTTPS 需搭配 CloudFront | **生產環境、專業專案** |
| **GitHub Pages** | 完全免費、與倉庫整合度高、自動部署 | 功能較少、中國大陸訪問速度不穩定 | **個人專案、開源專案展示** |
| **Netlify/Vercel** | 免費方案充足、自動化功能強大、部署快速 | 免費方案有流量限制 | **敏捷開發、需要預覽環境** |

---

## 2. 部署到 AWS S3（推薦）

AWS S3 提供最穩定、可靠且成本極低的靜態網站託管方案，是生產環境的首選。

### 前置準備

1.  **擁有一個 AWS 帳戶**：如果沒有，請先[註冊](https://aws.amazon.com/free/)。
2.  **安裝與設定 AWS CLI**：
    *   參考官方文件[安裝 AWS CLI](https://aws.amazon.com/cli/)。
    *   執行 `aws configure` 設定您的 Access Key、Secret Key 和預設 Region。

### 方法一：自動化腳本

這是最推薦的部署方式，快速、可靠且不易出錯。

1.  **給予腳本執行權限**：
    ```bash
    chmod +x deploy-to-s3.sh
    ```
2.  **執行部署命令**：將 `<your-bucket-name>` 替換為您的 S3 Bucket 名稱。
    ```bash
    ./deploy-to-s3.sh <your-bucket-name>
    ```

腳本將自動完成所有設定，包括建立 Bucket、設定靜態網站託管、配置公開權限以及同步檔案。

### 方法二：手動上傳

適合不熟悉命令列的使用者。

1.  **登入 AWS Console**，前往 S3 服務。
2.  **建立或進入您的 Bucket**，並在「屬性 (Properties)」分頁中啟用「靜態網站託管 (Static website hosting)」。
3.  **設定公開存取權限**：在「許可 (Permissions)」分頁中，關閉「封鎖所有公開存取權 (Block all public access)」，並新增 Bucket 政策以允許公開讀取。
4.  **上傳檔案**：依照[檔案結構說明](#6-檔案結構說明)將 `index.html`、`css/` 和 `js/` 目錄上傳到 Bucket 根目錄。

### 成本估算

假設每月有 10,000 次訪問，總成本約為 **$0.36/月**，幾乎可以忽略不計。

---

## 3. 部署到 GitHub Pages

完全免費，適合個人或開源專案。

1.  **前往 GitHub Repository 的「Settings」→「Pages」**。
2.  **設定來源 (Source)**：
    *   **Branch**: `DEV`
    *   **Folder**: `/` (root)
3.  **儲存設定**。幾分鐘後，您的網站將部署在 `https://<username>.github.io/<repository-name>/`。

---

## 4. 部署到 Netlify 或 Vercel

這兩個平台提供強大的免費方案和自動化功能。

1.  **登入 Netlify 或 Vercel**，選擇「從 Git 匯入專案」。
2.  **連接您的 GitHub Repository**。
3.  **設定部署選項**：
    *   **Branch**: `DEV`
    *   **Build Command**: (留空)
    *   **Publish Directory**: `.` (root)
4.  **點擊「部署」**。平台將自動處理後續所有事情，並提供網站 URL。

---

## 5. 進階設定：CloudFront CDN

若您使用 AWS S3 部署，強烈建議搭配 CloudFront 以啟用 **HTTPS** 並提升全球訪問速度。

詳細步驟請參考獨立文件：[**CLOUDFRONT_SETUP.md**](CLOUDFRONT_SETUP.md)

---

## 6. 檔案結構說明

部署時，您僅需上傳以下核心檔案。專案中的 `.md`、`.sh` 等開發文件會被自動忽略。

```text
/ (部署根目錄)
├── index.html
├── css/
│   └── style.css
└── js/
    ├── api.js
    ├── app.js
    ├── auth.js
    ├── config.js
    ├── storage.js
    └── ui.js
```
