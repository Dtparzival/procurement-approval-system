# CloudFront 快速設定指南

> 為 AI 智能公文簽核系統設定 CloudFront CDN 和 HTTPS

---

## 為什麼需要 CloudFront？

1. **HTTPS 支援** - S3 靜態網站託管不支援 HTTPS
2. **全球加速** - 透過 CDN 邊緣節點加速內容傳遞
3. **降低成本** - CloudFront 資料傳輸費用較 S3 低
4. **自訂網域** - 支援 HTTPS 的自訂網域
5. **安全性** - 保護 API Key 傳輸安全

---

## 快速設定步驟

### 步驟 1: 建立 CloudFront Distribution

1. 登入 [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. 點擊「建立分發」
3. 填寫以下設定:

#### 來源設定

| 欄位 | 值 | 說明 |
|------|-----|------|
| Origin domain | `your-bucket.s3-website-region.amazonaws.com` | **重要**: 使用網站端點，不是 Bucket 本身 |
| Protocol | HTTP only | S3 網站端點只支援 HTTP |
| Name | 自動產生 | 保持預設 |

**如何找到網站端點**:
```bash
# 使用 AWS CLI
aws s3api get-bucket-website --bucket your-bucket-name
```

或在 S3 Console → Bucket → 屬性 → 靜態網站託管

#### 預設快取行為

| 欄位 | 值 | 說明 |
|------|-----|------|
| Viewer protocol policy | Redirect HTTP to HTTPS | 自動重定向到 HTTPS |
| Allowed HTTP methods | GET, HEAD | 靜態網站只需要這兩個 |
| Cache policy | CachingOptimized | 最佳化快取設定 |

#### 設定

| 欄位 | 值 | 說明 |
|------|-----|------|
| Price class | Use all edge locations | 最佳效能（或選擇較便宜的選項） |
| Alternate domain names | `www.example.com` | 如果有自訂網域 |
| Custom SSL certificate | 選擇您的 ACM 憑證 | 如果有自訂網域 |
| Default root object | `index.html` | 預設首頁 |

4. 點擊「建立分發」

### 步驟 2: 等待部署完成

- 部署時間: 通常 15-20 分鐘
- 狀態: 從「Deploying」變為「Enabled」
- 可以在 CloudFront Console 查看進度

### 步驟 3: 測試 CloudFront

```bash
# 取得 CloudFront Domain Name
# 格式: d1234567890.cloudfront.net

# 測試 HTTPS
curl -I https://d1234567890.cloudfront.net

# 應該返回 200 OK
```

### 步驟 4: 更新部署腳本

```bash
# 之後部署時自動清除 CloudFront 快取
./deploy-to-s3.sh your-bucket-name --cloudfront-id E1234567890ABC
```

---

## 自訂網域設定

### 前置條件

- 已建立 CloudFront Distribution
- 擁有網域（例如: example.com）

### 步驟 1: 申請 SSL 憑證

1. 登入 [ACM Console](https://console.aws.amazon.com/acm/)
2. **重要**: 切換到 **us-east-1** 區域
3. 點擊「請求憑證」
4. 選擇「請求公有憑證」
5. 輸入網域:
   - `example.com`
   - `*.example.com` (萬用字元，支援所有子網域)
6. 驗證方法: DNS 驗證（推薦）
7. 點擊「請求」

### 步驟 2: 驗證網域

#### 使用 Route 53（自動）

1. 在 ACM Console 點擊您的憑證
2. 點擊「在 Route 53 中建立記錄」
3. 點擊「建立記錄」
4. 等待驗證完成（通常幾分鐘）

#### 使用其他 DNS 提供商（手動）

1. 在 ACM Console 查看 CNAME 記錄
2. 在您的 DNS 提供商新增 CNAME 記錄:
   - Name: `_abc123...`
   - Value: `_xyz789...acm-validations.aws.`
3. 等待驗證完成（可能需要幾小時）

### 步驟 3: 設定 CloudFront

1. 前往 [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. 選擇您的 Distribution
3. 點擊「編輯」
4. 設定以下欄位:
   - Alternate domain names: `example.com`, `www.example.com`
   - Custom SSL certificate: 選擇您的 ACM 憑證
5. 點擊「儲存變更」

### 步驟 4: 設定 DNS

#### 使用 Route 53

1. 登入 [Route 53 Console](https://console.aws.amazon.com/route53/)
2. 選擇您的 Hosted Zone
3. 建立 A 記錄:
   - Record name: 留空（根網域）或 `www`
   - Record type: A
   - Alias: 是
   - Route traffic to: CloudFront distribution
   - 選擇您的 Distribution
4. 點擊「建立記錄」

#### 使用其他 DNS 提供商

新增 CNAME 記錄:
- Type: CNAME
- Name: `www`
- Value: `d1234567890.cloudfront.net`
- TTL: 3600

**注意**: 根網域（example.com）通常不能使用 CNAME，建議使用 Route 53。

### 步驟 5: 測試自訂網域

```bash
# 測試 HTTPS
curl -I https://www.example.com

# 測試 HTTP 重定向
curl -I http://www.example.com

# 應該自動重定向到 HTTPS
```

---

## 效能優化

### 1. 快取設定

#### 建立自訂快取政策

1. 前往 CloudFront Console → Policies → Cache
2. 點擊「建立快取政策」
3. 設定:
   - Name: `StaticWebsiteCache`
   - TTL 設定:
     - Minimum: 1 秒
     - Maximum: 31536000 秒（1 年）
     - Default: 86400 秒（1 天）
   - Cache key settings: 
     - Headers: None
     - Query strings: None
     - Cookies: None
4. 點擊「建立」

#### 套用快取政策

1. 編輯 CloudFront Distribution
2. 在「Default cache behavior」選擇您的快取政策
3. 儲存變更

### 2. 壓縮設定

1. 編輯 CloudFront Distribution
2. 在「Default cache behavior」啟用「Compress objects automatically」
3. 儲存變更

這會自動壓縮文字檔案（HTML、CSS、JS），減少傳輸大小。

### 3. 設定不同檔案類型的快取時間

建立多個行為規則:

| 路徑模式 | 快取時間 | 說明 |
|---------|---------|------|
| `*.html` | 1 小時 | HTML 檔案，較短快取 |
| `*.css` | 1 天 | CSS 檔案 |
| `*.js` | 1 天 | JavaScript 檔案 |
| `*.png` | 1 週 | 圖片檔案，較長快取 |
| `*.jpg` | 1 週 | 圖片檔案 |

---

## 清除快取

### 使用 AWS CLI

```bash
# 清除所有檔案
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/*"

# 清除特定檔案
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/index.html" "/css/style.css"

# 清除特定目錄
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/js/*"
```

### 使用 AWS Console

1. 前往 CloudFront Console
2. 選擇您的 Distribution
3. 前往「Invalidations」標籤
4. 點擊「Create invalidation」
5. 輸入路徑: `/*`
6. 點擊「Create invalidation」

**注意**:
- 每月前 1,000 次失效請求免費
- 之後每次 $0.005
- 失效通常需要 5-10 分鐘完成

---

## 監控與日誌

### 啟用存取日誌

1. 建立日誌儲存 Bucket:
```bash
aws s3 mb s3://your-logs-bucket
```

2. 設定 CloudFront 日誌:
   - 前往 CloudFront Console
   - 編輯 Distribution
   - Standard logging: On
   - S3 bucket: `your-logs-bucket.s3.amazonaws.com`
   - Log prefix: `cloudfront/`
   - 儲存變更

### 查看 CloudWatch 指標

1. 前往 [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. 選擇「Metrics」→「CloudFront」
3. 查看以下指標:
   - Requests: 請求數量
   - BytesDownloaded: 下載流量
   - 4xxErrorRate: 客戶端錯誤率
   - 5xxErrorRate: 伺服器錯誤率

### 設定警示

```bash
# 建立 4xx 錯誤率警示
aws cloudwatch put-metric-alarm \
    --alarm-name cloudfront-4xx-errors \
    --alarm-description "CloudFront 4xx error rate is too high" \
    --metric-name 4xxErrorRate \
    --namespace AWS/CloudFront \
    --statistic Average \
    --period 300 \
    --threshold 5 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

---

## 成本優化

### 1. 選擇適當的 Price Class

| Price Class | 覆蓋區域 | 相對成本 |
|------------|---------|---------|
| Use all edge locations | 全球所有邊緣節點 | 最高 |
| Use only North America and Europe | 北美和歐洲 | 中等 |
| Use only North America, Europe, Asia, Middle East, and Africa | 排除南美和大洋洲 | 較低 |

**建議**: 根據您的目標用戶分布選擇

### 2. 設定適當的 TTL

- HTML: 1 小時（經常更新）
- CSS/JS: 1 天（偶爾更新）
- 圖片: 1 週（很少更新）

較長的 TTL 可以減少回源請求，降低成本。

### 3. 啟用壓縮

啟用自動壓縮可以減少傳輸大小，降低資料傳輸成本。

---

## 故障排除

### 問題 1: CloudFront 顯示 403 錯誤

**可能原因**:
- S3 Bucket 政策未正確設定
- CloudFront 來源設定錯誤

**解決方案**:
1. 確認使用 S3 網站端點作為來源
2. 確認 Bucket 政策允許公開讀取
3. 檢查 CloudFront 錯誤頁面設定

### 問題 2: 自訂網域無法存取

**可能原因**:
- DNS 記錄未正確設定
- SSL 憑證未驗證
- CloudFront 設定錯誤

**解決方案**:
```bash
# 檢查 DNS 記錄
dig www.example.com

# 檢查 SSL 憑證
openssl s_client -connect www.example.com:443 -servername www.example.com
```

### 問題 3: 更新後仍顯示舊內容

**可能原因**:
- CloudFront 快取未清除

**解決方案**:
```bash
# 清除 CloudFront 快取
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/*"

# 或使用部署腳本
./deploy-to-s3.sh your-bucket --cloudfront-id E1234567890ABC
```

---

## 最佳實踐

### 1. 安全性

- ✅ 始終使用 HTTPS
- ✅ 設定適當的 CORS 政策
- ✅ 定期更新 SSL 憑證
- ✅ 啟用 CloudFront 存取日誌

### 2. 效能

- ✅ 啟用自動壓縮
- ✅ 設定適當的快取時間
- ✅ 使用 HTTP/2
- ✅ 選擇適當的 Price Class

### 3. 成本

- ✅ 監控使用量
- ✅ 設定預算警示
- ✅ 優化快取策略
- ✅ 定期清理舊的失效請求

### 4. 維護

- ✅ 定期檢查 CloudWatch 指標
- ✅ 分析存取日誌
- ✅ 更新快取政策
- ✅ 測試故障轉移

---

## 相關資源

- [AWS CloudFront 官方文件](https://docs.aws.amazon.com/cloudfront/)
- [AWS Certificate Manager 文件](https://docs.aws.amazon.com/acm/)
- [CloudFront 定價](https://aws.amazon.com/cloudfront/pricing/)
- [完整部署指南](AWS_S3_DEPLOYMENT_GUIDE.md)

---

**最後更新**: 2025-12-06  
**版本**: 1.0.0
