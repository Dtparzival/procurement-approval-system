#!/bin/bash

# ==========================================
# AWS S3 部署腳本 - AI 智能公文簽核系統
# ==========================================
# 
# 使用方法: ./deploy-to-s3.sh <bucket-name> [options]
#
# 選項:
#   --region REGION        指定 AWS 區域 (預設: ap-northeast-1)
#   --profile PROFILE      使用指定的 AWS Profile
#   --no-cache-control     不設定快取控制
#   --skip-cors            跳過 CORS 設定
#   --cloudfront-id ID     部署後清除 CloudFront 快取
#   --help                 顯示此說明
#
# 範例:
#   ./deploy-to-s3.sh my-bucket
#   ./deploy-to-s3.sh my-bucket --region us-east-1
#   ./deploy-to-s3.sh my-bucket --cloudfront-id E1234567890ABC
#

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 預設值
REGION="ap-northeast-1"
PROFILE=""
CACHE_CONTROL=true
SKIP_CORS=false
CLOUDFRONT_ID=""

# 顯示說明
show_help() {
    head -n 20 "$0" | tail -n +3 | sed 's/^# //'
    exit 0
}

# 顯示錯誤訊息並退出
error() {
    echo -e "${RED}✗ 錯誤: $1${NC}" >&2
    exit 1
}

# 顯示成功訊息
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 顯示警告訊息
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 顯示資訊訊息
info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# 解析參數
BUCKET_NAME=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            REGION="$2"
            shift 2
            ;;
        --profile)
            PROFILE="$2"
            shift 2
            ;;
        --no-cache-control)
            CACHE_CONTROL=false
            shift
            ;;
        --skip-cors)
            SKIP_CORS=true
            shift
            ;;
        --cloudfront-id)
            CLOUDFRONT_ID="$2"
            shift 2
            ;;
        --help)
            show_help
            ;;
        -*)
            error "未知選項: $1"
            ;;
        *)
            if [ -z "$BUCKET_NAME" ]; then
                BUCKET_NAME="$1"
            else
                error "太多參數"
            fi
            shift
            ;;
    esac
done

# 檢查 Bucket 名稱
if [ -z "$BUCKET_NAME" ]; then
    error "請提供 S3 bucket 名稱\n使用方法: ./deploy-to-s3.sh <bucket-name>"
fi

# 設定 AWS CLI 參數
AWS_CMD="aws"
if [ -n "$PROFILE" ]; then
    AWS_CMD="aws --profile $PROFILE"
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "=========================================="
echo "  部署 AI 智能公文簽核系統到 AWS S3"
echo "=========================================="
echo ""
info "Bucket: $BUCKET_NAME"
info "區域: $REGION"
info "來源目錄: $SCRIPT_DIR"
if [ -n "$PROFILE" ]; then
    info "AWS Profile: $PROFILE"
fi
if [ -n "$CLOUDFRONT_ID" ]; then
    info "CloudFront ID: $CLOUDFRONT_ID"
fi
echo ""

# 檢查 AWS CLI 是否安裝
if ! command -v aws &> /dev/null; then
    error "AWS CLI 未安裝\n請安裝 AWS CLI: https://aws.amazon.com/cli/"
fi

success "AWS CLI 已安裝"

# 檢查 AWS 憑證
if ! $AWS_CMD sts get-caller-identity &> /dev/null; then
    error "AWS 憑證未設定\n請執行: aws configure"
fi

# 顯示當前 AWS 身份
ACCOUNT_ID=$($AWS_CMD sts get-caller-identity --query 'Account' --output text)
USER_ARN=$($AWS_CMD sts get-caller-identity --query 'Arn' --output text)
success "AWS 憑證已設定"
info "帳戶 ID: $ACCOUNT_ID"
info "使用者: $USER_ARN"
echo ""

# 檢查 bucket 是否存在
info "檢查 Bucket 是否存在..."
if ! $AWS_CMD s3 ls "s3://$BUCKET_NAME" --region "$REGION" &> /dev/null; then
    warning "Bucket 不存在，正在建立..."
    $AWS_CMD s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    success "Bucket 已建立"
else
    success "Bucket 已存在"
fi

echo ""
info "正在設定靜態網站託管..."

# 設定靜態網站託管
$AWS_CMD s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html \
    --region "$REGION"

success "靜態網站託管已設定"
echo ""

# 檢查並取消封鎖公開存取
info "檢查公開存取設定..."
if $AWS_CMD s3api get-public-access-block --bucket "$BUCKET_NAME" --region "$REGION" &> /dev/null; then
    warning "偵測到公開存取封鎖，正在移除..."
    $AWS_CMD s3api delete-public-access-block --bucket "$BUCKET_NAME" --region "$REGION"
    success "公開存取封鎖已移除"
fi

# 設定 Bucket 政策（公開讀取）
info "正在設定 Bucket 政策..."

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

echo "$BUCKET_POLICY" | $AWS_CMD s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///dev/stdin \
    --region "$REGION"

success "Bucket 政策已設定"
echo ""

# 上傳檔案
info "正在上傳檔案..."

SYNC_CMD="$AWS_CMD s3 sync \"$SCRIPT_DIR\" \"s3://$BUCKET_NAME\" \
    --region \"$REGION\" \
    --exclude \".git/*\" \
    --exclude \"*.md\" \
    --exclude \"*.sh\" \
    --exclude \".DS_Store\" \
    --exclude \".gitignore\" \
    --exclude \"node_modules/*\" \
    --exclude \"*.backup\" \
    --delete"

if [ "$CACHE_CONTROL" = true ]; then
    SYNC_CMD="$SYNC_CMD --cache-control \"public, max-age=3600\""
fi

eval $SYNC_CMD

success "檔案已上傳"
echo ""

# 設定 CORS（如果需要）
if [ "$SKIP_CORS" = false ]; then
    info "正在設定 CORS..."

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

    echo "$CORS_CONFIG" | $AWS_CMD s3api put-bucket-cors \
        --bucket "$BUCKET_NAME" \
        --cors-configuration file:///dev/stdin \
        --region "$REGION"

    success "CORS 已設定"
    echo ""
fi

# 清除 CloudFront 快取（如果提供）
if [ -n "$CLOUDFRONT_ID" ]; then
    info "正在清除 CloudFront 快取..."
    
    INVALIDATION_ID=$($AWS_CMD cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    success "CloudFront 快取清除請求已建立"
    info "失效 ID: $INVALIDATION_ID"
    warning "快取清除通常需要 5-10 分鐘完成"
    echo ""
fi

# 取得網站 URL
BUCKET_REGION=$($AWS_CMD s3api get-bucket-location --bucket "$BUCKET_NAME" --query 'LocationConstraint' --output text)

if [ "$BUCKET_REGION" = "None" ] || [ "$BUCKET_REGION" = "null" ]; then
    BUCKET_REGION="us-east-1"
fi

if [ "$BUCKET_REGION" = "us-east-1" ]; then
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
else
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-$BUCKET_REGION.amazonaws.com"
fi

# 計算上傳的檔案數量和大小
FILE_COUNT=$($AWS_CMD s3 ls s3://$BUCKET_NAME --recursive --region "$REGION" | wc -l)
TOTAL_SIZE=$($AWS_CMD s3 ls s3://$BUCKET_NAME --recursive --summarize --human-readable --region "$REGION" | grep "Total Size" | awk '{print $3 " " $4}')

echo ""
echo "=========================================="
echo "  🎉 部署完成！"
echo "=========================================="
echo ""
success "網站 URL: $WEBSITE_URL"
echo ""
info "檔案數量: $FILE_COUNT"
info "總大小: $TOTAL_SIZE"
echo ""
echo "📋 後續步驟:"
echo ""
echo "1. 開啟網站並測試功能"
echo "2. 在設定中輸入您的 API Key"
echo "3. 設定 Google OAuth Client ID (參考 GOOGLE_OAUTH_SETUP.md)"
echo ""
if [ -z "$CLOUDFRONT_ID" ]; then
    echo "4. (建議) 設定 CloudFront 以啟用 HTTPS:"
    echo "   - 參考 AWS_S3_DEPLOYMENT_GUIDE.md 的 CloudFront 章節"
fi
echo ""
echo "📚 相關文件:"
echo "   - 部署指南: AWS_S3_DEPLOYMENT_GUIDE.md"
echo "   - Google OAuth: GOOGLE_OAUTH_SETUP.md"
echo "   - 專案說明: README.md"
echo ""
warning "注意事項:"
echo "   • 定期檢查 AWS 費用"
echo "   • 建議設定預算警示"
echo "   • 保護好您的 API Key"
echo ""
