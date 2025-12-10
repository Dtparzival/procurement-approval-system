# AWS S3 部署指南：靜態網站檔案結構與上傳方式

本文件旨在詳細說明將「Agent 智簽公文」靜態網站部署至 AWS S3 所需的檔案清單、目錄結構，以及兩種建議的部署方法。

## 1. 檔案結構總覽

為了讓網站正常運作，您需要將以下檔案和目錄上傳到您的 S3 Bucket 的根目錄。請務必維持相同的目錄結構。

```text
/ (S3 Bucket 根目錄)
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

### 檔案清單詳解

下表列出了所有需要上傳的檔案及其用途：

| 檔案路徑 | 檔案大小 | 用途說明 |
| :--- | :--- | :--- |
| `index.html` | ~40 KB | **主頁面**：包含網站所有的 HTML 結構，包括首頁、應用程式主介面、設定彈窗等。 |
| `css/style.css` | ~13 KB | **樣式表**：定義網站的視覺外觀，包括顏色、排版、漸層背景和響應式設計。 |
| `js/api.js` | ~3 KB | **API 模組**：負責與後端 LLM API (例如 Manus Forge) 進行通訊。 |
| `js/app.js` | ~25 KB | **應用程式主邏輯**：協調所有模組，處理文件生成、自動保存等核心功能。 |
| `js/auth.js` | ~7 KB | **身份驗證模組**：處理使用者登入、登出，以及頁面（首頁/應用程式）之間的切換。 |
| `js/config.js` | ~1 KB | **設定檔**：儲存應用的基本設定，例如 API 的基礎 URL 和支援的 AI 模型列表。 |
| `js/storage.js` | ~4 KB | **本地儲存模組**：管理瀏覽器的 `localStorage`，用於保存 API 金鑰、草稿和歷史紀錄。 |
| `js/ui.js` | ~20 KB | **UI 管理模組**：負責處理所有使用者介面的互動，例如按鈕點擊、內容更新和彈窗顯示。 |

**注意**：`assets/` 目錄目前是空的，因此無需上傳。未來若新增圖片等靜態資源，則需一併上傳該目錄。

## 2. 部署方式

我們提供兩種部署方式：透過 AWS 管理控制台手動上傳，或使用我們提供的自動化腳本。

### 方法一：手動上傳 (透過 AWS 管理控制台)

此方法適合不熟悉命令列操作的使用者。操作直觀，但較為繁瑣。

1.  **登入 AWS 管理控制台**：前往 [AWS Console](https://aws.amazon.com/console/) 並登入您的帳戶。
2.  **前往 S3 服務**：在服務搜尋框中輸入 `S3` 並進入 S3 管理頁面。
3.  **進入您的 Bucket**：點擊您用於託管網站的 Bucket 名稱。
4.  **上傳 `index.html`**：
    *   點擊「**上傳 (Upload)**」按鈕。
    *   點擊「**新增檔案 (Add files)**」，選擇您本機上的 `index.html` 檔案。
    *   確認無誤後，點擊頁面底部的「**上傳 (Upload)**」按鈕。
5.  **建立 `css` 目錄並上傳檔案**：
    *   回到 Bucket 根目錄，點擊「**建立資料夾 (Create folder)**」。
    *   輸入資料夾名稱 `css`，然後點擊「**建立資料夾 (Create folder)**」。
    *   點擊進入剛剛建立的 `css` 資料夾。
    *   點擊「**上傳 (Upload)**」，並上傳 `css/style.css` 檔案。
6.  **建立 `js` 目錄並上傳檔案**：
    *   回到 Bucket 根目錄，重複上述步驟建立 `js` 資料夾。
    *   進入 `js` 資料夾，點擊「**上傳 (Upload)**」，然後點擊「**新增檔案 (Add files)**」。
    *   一次選取 `js/` 目錄下的所有 6 個 JavaScript 檔案 (`api.js`, `app.js`, `auth.js`, `config.js`, `storage.js`, `ui.js`) 並上傳。

完成以上步驟後，您的檔案結構應與本文件第一節所示完全一致。請務必檢查您的 S3 Bucket 是否已設定為「**靜態網站託管 (Static website hosting)**」並設定了正確的「**公開存取權限 (Public access settings)**」。

### 方法二：自動化腳本 (使用 `deploy-to-s3.sh`)

此方法適合熟悉命令列的開發者，可以快速、可靠地完成部署，並自動排除不必要的檔案。

1.  **安裝與設定 AWS CLI**：
    *   確保您的電腦已安裝 [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/)。
    *   執行 `aws configure` 命令，設定您的 `AWS Access Key ID`、`AWS Secret Access Key` 和預設區域 (例如 `ap-northeast-1`)。

2.  **執行部署腳本**：
    *   在您的終端機 (Terminal) 中，導航到專案的根目錄。
    *   執行以下命令，將 `<your-bucket-name>` 替換為您的 S3 Bucket 名稱：

        ```bash
        chmod +x deploy-to-s3.sh
        ./deploy-to-s3.sh <your-bucket-name>
        ```

    *   腳本會自動執行以下操作：
        *   檢查 AWS CLI 憑證。
        *   檢查 Bucket 是否存在（若不存在則會嘗試建立）。
        *   設定靜態網站託管與公開存取權限。
        *   使用 `aws s3 sync` 命令同步必要的檔案至 S3，並自動排除 `.md`、`.sh`、`.backup` 等開發用檔案。
        *   刪除 S3 上多餘的檔案，確保與本地部署版本一致。

腳本執行成功後，會顯示您的網站 URL。這是最推薦的部署方式，因為它能確保部署的準確性並減少人為錯誤。

## 總結

無論您選擇哪種部署方式，**核心關鍵是確保 S3 Bucket 中的檔案結構與本文件所述完全一致**。錯誤的檔案路徑會導致 `index.html` 無法正確載入 CSS 和 JavaScript 檔案，從而使網站無法正常顯示或運作。

建議優先使用**自動化腳本**進行部署，以獲得最佳的效率和可靠性。
