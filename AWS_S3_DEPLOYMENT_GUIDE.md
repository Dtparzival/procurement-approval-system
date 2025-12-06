# AWS S3 部署完整指南

> **AI 智能公文簽核系統 - 靜態網頁版本部署到 AWS S3**

本指南提供完整的步驟說明，幫助您將靜態網頁版本部署到 AWS S3，並設定 CloudFront CDN 和自訂網域。

---

## 📋 目錄

1. [前置準備](#前置準備)
2. [快速部署](#快速部署)
3. [手動部署步驟](#手動部署步驟)
4. [CloudFront CDN 設定](#cloudfront-cdn-設定)
5. [自訂網域設定](#自訂網域設定)
6. [Google OAuth 設定](#google-oauth-設定)
7. [故障排除](#故障排除)
8. [成本估算](#成本估算)
9. [最佳實踐](#最佳實踐)

---

## 前置準備

### 1. AWS 帳號

如果還沒有 AWS 帳號，請先註冊：

1. 前往 [AWS 官網](https://aws.amazon.com/)
2. 點擊「建立 AWS 帳戶」
3. 填寫基本資訊和付款方式
4. 完成身份驗證

**注意事項**:
- AWS 提供 12 個月免費方案
- S3 免費方案: 5GB 儲存空間、20,000 次 GET 請求、2,000 次 PUT 請求
- 需要信用卡進行驗證（不會立即扣款）

### 2. 安裝 AWS CLI

#### macOS
```bash
# 使用 Homebrew
brew install awscli

# 或使用官方安裝程式
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

#### Linux
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### Windows
下載並執行 [AWS CLI MSI 安裝程式](https://awscli.amazonaws.com/AWSCLIV2.msi)

#### 驗證安裝
```bash
aws --version
# 應顯示: aws-cli/2.x.x Python/3.x.x ...
```

### 3. 設定 AWS 憑證

#### 取得存取金鑰

1. 登入 [AWS Console](https://console.aws.amazon.com/)
2. 點擊右上角的帳戶名稱 → 「Security credentials」
3. 向下滾動到「Access keys」區域
4. 點擊「Create access key」
5. 選擇「Command Line Interface (CLI)」
6. 勾選「I understand...」並點擊「Next」
7. （可選）輸入描述標籤
8. 點擊「Create access key」
9. **重要**: 立即下載或複製 Access Key ID 和 Secret Access Key

#### 設定憑證

```bash
aws configure
```

輸入以下資訊:
```
AWS Access Key ID [None]: 您的 Access Key ID
AWS Secret Access Key [None]: 您的 Secret Access Key
Default region name [None]: ap-northeast-1  # 東京區域（建議台灣用戶使用）
Default output format [None]: json
```

**常用 AWS 區域**:
- `ap-northeast-1` - 東京（建議台灣用戶）
- `ap-southeast-1` - 新加坡
- `us-east-1` - 美國維吉尼亞北部
- `us-west-2` - 美國奧勒岡

#### 驗證憑證
```bash
aws sts get-caller-identity
```

應顯示您的帳戶資訊。

---

## 快速部署

如果您已完成前置準備，可以使用自動化腳本快速部署：

### 1. 使用部署腳本

```bash
# 進入專案目錄
cd procurement-approval-system

# 執行部署腳本
./deploy-to-s3.sh your-bucket-name
```

**範例**:
```bash
./deploy-to-s3.sh ai-procurement-system
```

### 2. 腳本執行流程

腳本會自動完成以下步驟：

1. ✅ 檢查 AWS CLI 是否安裝
2. ✅ 檢查 AWS 憑證是否設定
3. ✅ 建立 S3 Bucket（如果不存在）
4. ✅ 設定靜態網站託管
5. ✅ 設定 Bucket 公開讀取政策
6. ✅ 上傳所有檔案
7. ✅ 設定 CORS 政策
8. ✅ 顯示網站 URL

### 3. 部署完成

部署完成後，您會看到類似以下的輸出：

```
==========================================
部署完成！
==========================================

網站 URL: http://ai-procurement-system.s3-website-ap-northeast-1.amazonaws.com

注意事項：
1. 請在設定中輸入您的 API Key
2. 建議使用 CloudFront 設定 HTTPS
3. 定期檢查 S3 費用
```

---

## 手動部署步驟

如果您想了解部署的詳細過程，或需要自訂設定，請參考以下手動步驟。

### 步驟 1: 建立 S3 Bucket

#### 使用 AWS CLI

```bash
# 建立 Bucket
aws s3 mb s3://your-bucket-name --region ap-northeast-1
```

#### 使用 AWS Console

1. 登入 [S3 Console](https://s3.console.aws.amazon.com/)
2. 點擊「建立儲存貯體」
3. 輸入儲存貯體名稱（必須全球唯一）
4. 選擇區域（建議: ap-northeast-1）
5. **取消勾選**「封鎖所有公開存取」
6. 勾選「我了解目前的設定可能會導致此儲存貯體和其中的物件變成公開」
7. 其他設定保持預設
8. 點擊「建立儲存貯體」

**Bucket 命名規則**:
- 只能包含小寫字母、數字、連字號 (-)
- 長度 3-63 個字元
- 不能以連字號開頭或結尾
- 不能包含底線或大寫字母
- 必須全球唯一

### 步驟 2: 設定靜態網站託管

#### 使用 AWS CLI

```bash
aws s3 website s3://your-bucket-name \
    --index-document index.html \
    --error-document index.html
```

#### 使用 AWS Console

1. 在 S3 Console 中點擊您的 Bucket
2. 前往「屬性」標籤
3. 向下滾動到「靜態網站託管」
4. 點擊「編輯」
5. 選擇「啟用」
6. 託管類型: 「託管靜態網站」
7. 索引文件: `index.html`
8. 錯誤文件: `index.html`
9. 點擊「儲存變更」

### 步驟 3: 設定 Bucket 政策

#### 使用 AWS CLI

建立政策檔案 `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

套用政策:

```bash
aws s3api put-bucket-policy \
    --bucket your-bucket-name \
    --policy file://bucket-policy.json
```

#### 使用 AWS Console

1. 在 S3 Console 中點擊您的 Bucket
2. 前往「許可」標籤
3. 向下滾動到「儲存貯體政策」
4. 點擊「編輯」
5. 貼上以下政策（記得替換 `your-bucket-name`）:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

6. 點擊「儲存變更」

### 步驟 4: 上傳檔案

#### 使用 AWS CLI

```bash
# 同步整個目錄
aws s3 sync . s3://your-bucket-name \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude ".DS_Store" \
    --delete \
    --cache-control "public, max-age=3600"
```

**參數說明**:
- `--exclude`: 排除不需要的檔案
- `--delete`: 刪除 S3 中本地已刪除的檔案
- `--cache-control`: 設定快取時間（3600 秒 = 1 小時）

#### 使用 AWS Console

1. 在 S3 Console 中點擊您的 Bucket
2. 點擊「上傳」
3. 點擊「新增檔案」或「新增資料夾」
4. 選擇所有專案檔案
5. 點擊「上傳」

### 步驟 5: 設定 CORS（可選）

如果您的網站需要從其他網域載入資源，需要設定 CORS。

#### 使用 AWS CLI

建立 CORS 設定檔案 `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": [],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

套用 CORS 設定:

```bash
aws s3api put-bucket-cors \
    --bucket your-bucket-name \
    --cors-configuration file://cors-config.json
```

#### 使用 AWS Console

1. 在 S3 Console 中點擊您的 Bucket
2. 前往「許可」標籤
3. 向下滾動到「跨來源資源共用 (CORS)」
4. 點擊「編輯」
5. 貼上以下 CORS 設定:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

6. 點擊「儲存變更」

### 步驟 6: 取得網站 URL

#### 使用 AWS CLI

```bash
# 取得區域
REGION=$(aws s3api get-bucket-location --bucket your-bucket-name --query 'LocationConstraint' --output text)

# 如果是 us-east-1
if [ "$REGION" = "None" ] || [ "$REGION" = "null" ]; then
    echo "http://your-bucket-name.s3-website-us-east-1.amazonaws.com"
else
    echo "http://your-bucket-name.s3-website-$REGION.amazonaws.com"
fi
```

#### 使用 AWS Console

1. 在 S3 Console 中點擊您的 Bucket
2. 前往「屬性」標籤
3. 向下滾動到「靜態網站託管」
4. 複製「儲存貯體網站端點」

**URL 格式**:
- 美國東部 (us-east-1): `http://bucket-name.s3-website-us-east-1.amazonaws.com`
- 其他區域: `http://bucket-name.s3-website-region.amazonaws.com`

---

## CloudFront CDN 設定

為了提供 HTTPS 支援和更快的全球存取速度，建議設定 CloudFront CDN。

### 為什麼需要 CloudFront？

1. **HTTPS 支援** - S3 靜態網站託管不支援 HTTPS
2. **全球加速** - 透過 CDN 邊緣節點加速內容傳遞
3. **降低成本** - CloudFront 資料傳輸費用較 S3 低
4. **自訂網域** - 支援 HTTPS 的自訂網域

### 步驟 1: 建立 CloudFront Distribution

#### 使用 AWS Console

1. 登入 [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. 點擊「建立分發」
3. 設定以下參數:

**來源設定**:
- Origin domain: 選擇您的 S3 Bucket（使用網站端點，不是 Bucket 本身）
  - 格式: `your-bucket-name.s3-website-ap-northeast-1.amazonaws.com`
- Protocol: HTTP only
- Origin path: 留空

**預設快取行為設定**:
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD
- Cache policy: CachingOptimized

**設定**:
- Price class: Use all edge locations (best performance)
- Alternate domain names (CNAMEs): 如果有自訂網域，在此輸入
- Custom SSL certificate: 如果有自訂網域，選擇對應的 SSL 憑證
- Default root object: `index.html`

4. 點擊「建立分發」

### 步驟 2: 等待部署完成

CloudFront 部署通常需要 15-20 分鐘。您可以在 CloudFront Console 中查看狀態。

狀態變為「Deployed」後，即可使用 CloudFront URL 存取網站。

### 步驟 3: 測試 CloudFront

```bash
# 使用 CloudFront Domain Name
curl -I https://d1234567890.cloudfront.net
```

應該返回 200 OK 狀態碼。

---

## 自訂網域設定

如果您有自己的網域，可以設定自訂網域指向 CloudFront。

### 前置條件

- 已設定 CloudFront Distribution
- 擁有網域（可在 Route 53、GoDaddy、Namecheap 等購買）

### 步驟 1: 申請 SSL 憑證

#### 使用 AWS Certificate Manager (ACM)

1. 登入 [ACM Console](https://console.aws.amazon.com/acm/)
2. **重要**: 切換到 **us-east-1** 區域（CloudFront 只支援此區域的憑證）
3. 點擊「請求憑證」
4. 選擇「請求公有憑證」
5. 輸入網域名稱:
   - `example.com`
   - `*.example.com` (支援子網域)
6. 驗證方法: DNS 驗證（推薦）或 Email 驗證
7. 點擊「請求」

#### DNS 驗證

1. 在 ACM Console 中點擊您的憑證
2. 展開網域名稱
3. 點擊「在 Route 53 中建立記錄」（如果使用 Route 53）
4. 或手動在您的 DNS 提供商新增 CNAME 記錄

等待驗證完成（通常幾分鐘到幾小時）。

### 步驟 2: 設定 CloudFront

1. 前往 [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. 點擊您的 Distribution
3. 點擊「編輯」
4. 在「Alternate domain names (CNAMEs)」輸入您的網域:
   - `example.com`
   - `www.example.com`
5. 在「Custom SSL certificate」選擇您的 ACM 憑證
6. 點擊「儲存變更」

### 步驟 3: 設定 DNS

#### 使用 Route 53

1. 登入 [Route 53 Console](https://console.aws.amazon.com/route53/)
2. 點擊「Hosted zones」
3. 選擇您的網域
4. 點擊「建立記錄」
5. 設定以下參數:
   - Record name: 留空（根網域）或輸入 `www`
   - Record type: A
   - Alias: 是
   - Route traffic to: CloudFront distribution
   - 選擇您的 CloudFront Distribution
6. 點擊「建立記錄」

#### 使用其他 DNS 提供商

在您的 DNS 提供商新增 CNAME 記錄:

- Type: CNAME
- Name: `www` 或您的子網域
- Value: 您的 CloudFront Domain Name (例如: `d1234567890.cloudfront.net`)
- TTL: 3600

**注意**: 根網域（example.com）通常不能使用 CNAME，建議使用 Route 53 的 Alias 記錄。

### 步驟 4: 測試自訂網域

```bash
# 測試 HTTPS
curl -I https://www.example.com

# 測試 HTTP 重定向
curl -I http://www.example.com
```

---

## Google OAuth 設定

由於靜態網頁版本整合了 Google 登入功能，您需要設定 Google OAuth Client ID。

### 步驟 1: 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊專案下拉選單
3. 點擊「新增專案」
4. 輸入專案名稱（例如: AI Procurement System）
5. 點擊「建立」

### 步驟 2: 啟用 Google+ API

1. 在左側選單選擇「API 和服務」→「程式庫」
2. 搜尋「Google+ API」
3. 點擊「啟用」

### 步驟 3: 建立 OAuth 同意畫面

1. 在左側選單選擇「OAuth 同意畫面」
2. 選擇「外部」
3. 點擊「建立」
4. 填寫應用程式資訊:
   - 應用程式名稱: AI 智能公文簽核系統
   - 使用者支援電子郵件: 您的 Email
   - 應用程式首頁連結: 您的網站 URL
   - 授權網域: 您的網域（例如: example.com）
   - 開發人員聯絡資訊: 您的 Email
5. 點擊「儲存並繼續」
6. 範圍: 點擊「儲存並繼續」（使用預設）
7. 測試使用者: 新增測試使用者 Email（可選）
8. 點擊「儲存並繼續」

### 步驟 4: 建立 OAuth 2.0 Client ID

1. 在左側選單選擇「憑證」
2. 點擊「建立憑證」→「OAuth 用戶端 ID」
3. 應用程式類型: 網頁應用程式
4. 名稱: AI Procurement System Web Client
5. 已授權的 JavaScript 來源:
   - `https://your-domain.com`
   - `https://www.your-domain.com`
   - `https://d1234567890.cloudfront.net` (CloudFront URL)
6. 已授權的重新導向 URI:
   - `https://your-domain.com`
   - `https://www.your-domain.com`
7. 點擊「建立」
8. 複製「用戶端 ID」

### 步驟 5: 更新網站設定

1. 開啟 `js/auth.js` 檔案
2. 找到以下行:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
```
3. 替換為您的 Client ID:
```javascript
const GOOGLE_CLIENT_ID = '123456789-abcdefg.apps.googleusercontent.com';
```
4. 儲存檔案
5. 重新部署到 S3:
```bash
./deploy-to-s3.sh your-bucket-name
```

### 步驟 6: 測試 Google 登入

1. 開啟您的網站
2. 點擊「登入」按鈕
3. 應該會彈出 Google 登入對話框
4. 選擇帳號並授權
5. 登入成功後應該會看到主應用程式介面

---

## 故障排除

### 問題 1: 403 Forbidden 錯誤

**症狀**: 訪問網站時出現 403 錯誤

**可能原因**:
1. Bucket 政策未正確設定
2. 檔案權限不正確
3. 封鎖公開存取未取消

**解決方案**:

```bash
# 檢查 Bucket 政策
aws s3api get-bucket-policy --bucket your-bucket-name

# 重新設定 Bucket 政策
aws s3api put-bucket-policy \
    --bucket your-bucket-name \
    --policy file://bucket-policy.json

# 確認公開存取設定
aws s3api get-public-access-block --bucket your-bucket-name
```

### 問題 2: 404 Not Found 錯誤

**症狀**: 訪問網站時出現 404 錯誤

**可能原因**:
1. index.html 未上傳
2. 靜態網站託管未啟用
3. URL 不正確

**解決方案**:

```bash
# 檢查檔案是否存在
aws s3 ls s3://your-bucket-name/

# 確認靜態網站託管設定
aws s3api get-bucket-website --bucket your-bucket-name

# 重新上傳檔案
aws s3 sync . s3://your-bucket-name --exclude ".git/*"
```

### 問題 3: Google 登入失敗

**症狀**: 點擊 Google 登入按鈕沒有反應或出現錯誤

**可能原因**:
1. Google Client ID 未設定或錯誤
2. 授權的 JavaScript 來源未正確設定
3. OAuth 同意畫面未完成設定

**解決方案**:

1. 檢查 `js/auth.js` 中的 Client ID
2. 確認 Google Cloud Console 中的授權來源包含您的網域
3. 開啟瀏覽器開發者工具查看錯誤訊息
4. 確認 OAuth 同意畫面已完成設定

### 問題 4: API 請求失敗

**症狀**: 生成簽呈時出現 API 錯誤

**可能原因**:
1. API Key 未設定或錯誤
2. API 端點不正確
3. CORS 問題

**解決方案**:

1. 檢查設定中的 API Key 是否正確
2. 確認 `js/config.js` 中的 BASE_URL 設定
3. 開啟瀏覽器開發者工具查看網路請求
4. 檢查 API 提供商的狀態頁面

### 問題 5: CloudFront 顯示舊內容

**症狀**: 更新檔案後 CloudFront 仍顯示舊版本

**可能原因**:
- CloudFront 快取未清除

**解決方案**:

```bash
# 建立 CloudFront 失效請求
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
```

或在 CloudFront Console:
1. 選擇您的 Distribution
2. 前往「失效」標籤
3. 點擊「建立失效」
4. 輸入路徑: `/*`
5. 點擊「建立失效」

---

## 成本估算

### S3 儲存成本

**假設**:
- 網站大小: 2MB
- 區域: ap-northeast-1（東京）

**計算**:
- 儲存費用: $0.025/GB/月
- 成本: $0.025 × 0.002GB = **$0.00005/月**

### S3 請求成本

**假設**:
- 月訪問量: 10,000 次
- 平均每次訪問: 10 個請求（HTML、CSS、JS、圖片等）
- 總請求數: 100,000 次

**計算**:
- GET 請求: $0.00037/千次
- 成本: $0.00037 × 100 = **$0.037/月**

### S3 資料傳輸成本

**假設**:
- 平均頁面大小: 500KB
- 月訪問量: 10,000 次
- 總傳輸: 5GB

**計算**:
- 前 1GB: 免費
- 1-10GB: $0.114/GB
- 成本: $0.114 × 4GB = **$0.456/月**

### CloudFront 成本

**假設**:
- 使用 CloudFront CDN
- 月傳輸: 5GB
- 月請求: 100,000 次

**計算**:
- 資料傳輸（前 10TB）: $0.085/GB
- HTTP/HTTPS 請求: $0.0075/萬次
- 成本: ($0.085 × 5) + ($0.0075 × 10) = **$0.50/月**

### 總成本估算

| 服務 | 月成本 | 說明 |
|------|--------|------|
| S3 儲存 | $0.00005 | 2MB 網站 |
| S3 請求 | $0.037 | 100,000 次請求 |
| S3 傳輸 | $0.456 | 5GB 傳輸 |
| **S3 總計** | **$0.49** | 不使用 CloudFront |
| CloudFront | $0.50 | 使用 CDN |
| **總計** | **$0.99** | 使用 CloudFront |

**注意**:
- 以上為估算值，實際成本可能有所不同
- AWS 免費方案首年可免費使用部分服務
- 建議在 AWS Billing Dashboard 設定預算警示

---

## 最佳實踐

### 1. 安全性

#### 定期更新 API Key
```javascript
// 建議每 30-90 天更換一次 API Key
// 在設定中提供更換提醒
```

#### 使用 HTTPS
- 必須使用 CloudFront 提供 HTTPS
- 設定 HTTP 自動重定向到 HTTPS

#### 限制 CORS
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-domain.com"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

### 2. 效能優化

#### 設定適當的快取時間
```bash
# HTML 檔案: 短快取時間（1小時）
aws s3 cp index.html s3://your-bucket-name/ \
    --cache-control "public, max-age=3600"

# CSS/JS 檔案: 中等快取時間（1天）
aws s3 cp css/style.css s3://your-bucket-name/css/ \
    --cache-control "public, max-age=86400"

# 圖片檔案: 長快取時間（1週）
aws s3 cp assets/logo.png s3://your-bucket-name/assets/ \
    --cache-control "public, max-age=604800"
```

#### 啟用 Gzip 壓縮
```bash
# 上傳時啟用壓縮
aws s3 cp style.css s3://your-bucket-name/css/ \
    --content-encoding gzip \
    --content-type "text/css"
```

#### 使用 CloudFront 快取策略
- 靜態資源: CachingOptimized
- HTML: CachingDisabled 或自訂短快取時間

### 3. 成本優化

#### 使用 S3 Intelligent-Tiering
```bash
# 設定生命週期規則
aws s3api put-bucket-lifecycle-configuration \
    --bucket your-bucket-name \
    --lifecycle-configuration file://lifecycle.json
```

#### 啟用 CloudFront 壓縮
- 在 CloudFront 設定中啟用「Compress objects automatically」
- 減少傳輸成本

#### 監控使用量
- 設定 AWS Budgets 預算警示
- 定期檢查 Cost Explorer

### 4. 維護管理

#### 建立部署腳本
```bash
#!/bin/bash
# deploy.sh

# 建置（如果需要）
# npm run build

# 上傳到 S3
aws s3 sync . s3://your-bucket-name --delete

# 清除 CloudFront 快取
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"

echo "部署完成！"
```

#### 版本控制
```bash
# 啟用 S3 版本控制
aws s3api put-bucket-versioning \
    --bucket your-bucket-name \
    --versioning-configuration Status=Enabled
```

#### 備份策略
```bash
# 定期備份到另一個 Bucket
aws s3 sync s3://your-bucket-name s3://your-backup-bucket
```

### 5. 監控與日誌

#### 啟用 S3 存取日誌
```bash
aws s3api put-bucket-logging \
    --bucket your-bucket-name \
    --bucket-logging-status file://logging.json
```

#### 設定 CloudWatch 警示
- 監控 4xx/5xx 錯誤率
- 監控請求數量
- 監控資料傳輸量

#### 使用 CloudFront 存取日誌
- 分析訪問模式
- 識別熱門內容
- 偵測異常流量

---

## 附錄

### A. 常用 AWS CLI 指令

```bash
# 列出所有 Bucket
aws s3 ls

# 列出 Bucket 中的檔案
aws s3 ls s3://your-bucket-name --recursive

# 上傳單一檔案
aws s3 cp index.html s3://your-bucket-name/

# 下載單一檔案
aws s3 cp s3://your-bucket-name/index.html .

# 刪除檔案
aws s3 rm s3://your-bucket-name/old-file.html

# 刪除 Bucket（必須先清空）
aws s3 rb s3://your-bucket-name --force

# 取得 Bucket 大小
aws s3 ls s3://your-bucket-name --recursive --summarize

# 設定檔案為公開
aws s3api put-object-acl \
    --bucket your-bucket-name \
    --key index.html \
    --acl public-read
```

### B. 故障排除檢查清單

- [ ] AWS CLI 已安裝並設定憑證
- [ ] S3 Bucket 已建立
- [ ] 靜態網站託管已啟用
- [ ] Bucket 政策已設定為公開讀取
- [ ] 封鎖公開存取已取消勾選
- [ ] 檔案已成功上傳
- [ ] index.html 存在於 Bucket 根目錄
- [ ] CORS 設定已套用（如需要）
- [ ] CloudFront Distribution 已建立（如使用）
- [ ] SSL 憑證已申請並驗證（如使用自訂網域）
- [ ] DNS 記錄已設定（如使用自訂網域）
- [ ] Google OAuth Client ID 已設定
- [ ] 授權的 JavaScript 來源包含您的網域

### C. 相關資源

- [AWS S3 官方文件](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront 官方文件](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI 指令參考](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [專案 GitHub Repository](https://github.com/Dtparzival/procurement-approval-system)

---

## 聯絡支援

如果您在部署過程中遇到問題，請：

1. 查看[故障排除](#故障排除)章節
2. 檢查 [GitHub Issues](https://github.com/Dtparzival/procurement-approval-system/issues)
3. 開啟新的 Issue 並提供詳細資訊

---

**最後更新**: 2025-12-06  
**版本**: 1.0.0  
**作者**: AI 智能公文簽核系統團隊
