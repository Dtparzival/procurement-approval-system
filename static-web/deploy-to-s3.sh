#!/bin/bash

# AWS S3 部署腳本
# 使用方法: ./deploy-to-s3.sh <bucket-name>

set -e

# 檢查參數
if [ -z "$1" ]; then
    echo "錯誤: 請提供 S3 bucket 名稱"
    echo "使用方法: ./deploy-to-s3.sh <bucket-name>"
    exit 1
fi

BUCKET_NAME=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================="
echo "部署 AI 採購簽呈生成系統到 AWS S3"
echo "=========================================="
echo ""
echo "Bucket: $BUCKET_NAME"
echo "來源目錄: $SCRIPT_DIR"
echo ""

# 檢查 AWS CLI 是否安裝
if ! command -v aws &> /dev/null; then
    echo "錯誤: AWS CLI 未安裝"
    echo "請安裝 AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# 檢查 AWS 憑證
if ! aws sts get-caller-identity &> /dev/null; then
    echo "錯誤: AWS 憑證未設定"
    echo "請執行: aws configure"
    exit 1
fi

echo "✓ AWS CLI 已安裝並已設定憑證"
echo ""

# 檢查 bucket 是否存在
if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
    echo "Bucket 不存在，正在建立..."
    aws s3 mb "s3://$BUCKET_NAME"
    echo "✓ Bucket 已建立"
else
    echo "✓ Bucket 已存在"
fi

echo ""
echo "正在設定靜態網站託管..."

# 設定靜態網站託管
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html

echo "✓ 靜態網站託管已設定"
echo ""

# 設定 Bucket 政策（公開讀取）
echo "正在設定 Bucket 政策..."

BUCKET_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
)

echo "$BUCKET_POLICY" | aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///dev/stdin

echo "✓ Bucket 政策已設定"
echo ""

# 上傳檔案
echo "正在上傳檔案..."

aws s3 sync "$SCRIPT_DIR" "s3://$BUCKET_NAME" \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude ".DS_Store" \
    --delete \
    --cache-control "public, max-age=3600" \
    --metadata-directive REPLACE

echo "✓ 檔案已上傳"
echo ""

# 設定 CORS（如果需要）
echo "正在設定 CORS..."

CORS_CONFIG=$(cat <<EOF
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
EOF
)

echo "$CORS_CONFIG" | aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file:///dev/stdin

echo "✓ CORS 已設定"
echo ""

# 取得網站 URL
REGION=$(aws s3api get-bucket-location --bucket "$BUCKET_NAME" --query 'LocationConstraint' --output text)

if [ "$REGION" = "None" ] || [ "$REGION" = "null" ]; then
    REGION="us-east-1"
fi

if [ "$REGION" = "us-east-1" ]; then
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
else
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
fi

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "網站 URL: $WEBSITE_URL"
echo ""
echo "注意事項："
echo "1. 請在設定中輸入您的 API Key"
echo "2. 建議使用 CloudFront 設定 HTTPS"
echo "3. 定期檢查 S3 費用"
echo ""
