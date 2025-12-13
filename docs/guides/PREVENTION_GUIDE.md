# 預防措施實施指南

**目的**: 防止類似的 JavaScript 語法錯誤再次導致系統失效  
**優先級**: 🔴 Critical  
**實施時間**: 立即

---

## 📋 快速實施清單

### ✅ 第 1 步：安裝 ESLint（5 分鐘）

```bash
# 1. 初始化 package.json（如果還沒有）
npm init -y

# 2. 安裝 ESLint
npm install --save-dev eslint

# 3. 創建 ESLint 配置文件
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "script"
  },
  "rules": {
    "no-redeclare": "error",
    "no-unused-vars": "warn",
    "no-undef": "error",
    "no-console": "off"
  },
  "globals": {
    "docx": "readonly",
    "saveAs": "readonly",
    "CONFIG": "readonly",
    "Storage": "readonly",
    "Auth": "readonly",
    "UI": "readonly",
    "API": "readonly"
  }
}
EOF

# 4. 添加 .eslintignore
cat > .eslintignore << 'EOF'
node_modules/
*.min.js
EOF
```

### ✅ 第 2 步：添加 NPM 腳本（2 分鐘）

編輯 `package.json`，添加以下 scripts:

```json
{
  "scripts": {
    "lint": "eslint js/*.js",
    "lint:fix": "eslint js/*.js --fix",
    "check": "node --check js/app.js && node --check js/api.js && node --check js/auth.js && node --check js/config.js && node --check js/storage.js && node --check js/ui.js",
    "test": "npm run check && npm run lint"
  }
}
```

### ✅ 第 3 步：運行檢查並修復（5 分鐘）

```bash
# 1. 檢查語法
npm run check

# 2. 運行 ESLint
npm run lint

# 3. 自動修復可修復的問題
npm run lint:fix

# 4. 手動修復剩餘問題
# 根據 ESLint 輸出的錯誤訊息進行修復
```

### ✅ 第 4 步：設置 Git Hook（3 分鐘）

```bash
# 1. 安裝 husky（Git Hook 管理工具）
npm install --save-dev husky

# 2. 啟用 Git Hooks
npx husky install

# 3. 添加 pre-commit hook
npx husky add .git/hooks/pre-commit "npm test"

# 4. 使 hook 可執行
chmod +x .git/hooks/pre-commit
```

**或者手動創建** (如果不想使用 husky):

```bash
# 創建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

echo "Running pre-commit checks..."

# 檢查語法
npm run check
if [ $? -ne 0 ]; then
    echo "❌ 語法檢查失敗，請修復錯誤後再提交"
    exit 1
fi

# 運行 ESLint
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint 檢查失敗，請修復錯誤後再提交"
    exit 1
fi

echo "✅ 所有檢查通過"
exit 0
EOF

# 使 hook 可執行
chmod +x .git/hooks/pre-commit
```

### ✅ 第 5 步：創建 Pull Request 模板（2 分鐘）

```bash
# 創建 .github 目錄
mkdir -p .github

# 創建 PR 模板
cat > .github/pull_request_template.md << 'EOF'
## 變更描述
<!-- 描述這個 PR 的變更內容 -->

## 變更類型
- [ ] Bug 修復
- [ ] 新功能
- [ ] 重構
- [ ] 文件更新
- [ ] 性能優化

## 檢查清單
- [ ] 代碼已通過 `npm run check` 語法檢查
- [ ] 代碼已通過 `npm run lint` ESLint 檢查
- [ ] 已在瀏覽器中測試（Chrome/Firefox/Safari）
- [ ] 已清除瀏覽器快取測試
- [ ] 已更新相關文件
- [ ] 已測試所有受影響的功能

## 測試說明
<!-- 描述如何測試這個變更 -->

## 截圖（如適用）
<!-- 添加截圖以展示變更 -->

## 相關 Issue
<!-- 關聯相關的 Issue，例如：Closes #123 -->
EOF
```

---

## 🔧 使用指南

### 日常開發流程

#### 1. 開發前

```bash
# 拉取最新代碼
git pull origin DEV

# 確保依賴已安裝
npm install
```

#### 2. 開發中

```bash
# 隨時運行檢查
npm run check  # 快速語法檢查
npm run lint   # 完整 ESLint 檢查

# 自動修復簡單問題
npm run lint:fix
```

#### 3. 提交前

```bash
# 運行所有檢查
npm test

# 如果通過，提交代碼
git add .
git commit -m "feat: 添加新功能"

# Git Hook 會自動運行檢查
# 如果檢查失敗，提交會被阻止
```

#### 4. 推送前

```bash
# 在瀏覽器中測試
python3 -m http.server 8000

# 打開瀏覽器訪問 http://localhost:8000
# 按 Ctrl+Shift+R 清除快取
# 測試所有功能

# 如果一切正常，推送代碼
git push origin DEV
```

### 常見問題處理

#### 問題 1: ESLint 報錯 "no-undef"

**原因**: 使用了未定義的全局變數

**解決方案**: 在 `.eslintrc.json` 的 `globals` 中添加:

```json
{
  "globals": {
    "yourGlobalVariable": "readonly"
  }
}
```

#### 問題 2: ESLint 報錯 "no-redeclare"

**原因**: 變數重複聲明（這正是我們要防止的問題！）

**解決方案**: 
1. 找到重複聲明的位置
2. 移除其中一個聲明
3. 如果需要在不同作用域使用，考慮重命名

#### 問題 3: Git Hook 沒有運行

**原因**: Hook 文件沒有執行權限

**解決方案**:

```bash
chmod +x .git/hooks/pre-commit
```

#### 問題 4: 想要跳過 Git Hook

**不推薦，但緊急情況下可以使用**:

```bash
git commit --no-verify -m "緊急修復"
```

---

## 📊 效果驗證

### 驗證 ESLint 是否正常工作

```bash
# 創建一個測試文件
cat > test-duplicate.js << 'EOF'
const test = 1;
const test = 2; // 重複聲明
EOF

# 運行 ESLint
npx eslint test-duplicate.js

# 應該看到錯誤：
# error  Parsing error: Identifier 'test' has already been declared

# 刪除測試文件
rm test-duplicate.js
```

### 驗證 Git Hook 是否正常工作

```bash
# 創建一個有錯誤的文件
echo "const test = 1; const test = 2;" > js/test.js

# 嘗試提交
git add js/test.js
git commit -m "test"

# 應該看到錯誤並阻止提交

# 刪除測試文件
rm js/test.js
git reset
```

---

## 🎯 成功標準

實施完成後，應該達到以下標準：

- ✅ 運行 `npm run check` 沒有錯誤
- ✅ 運行 `npm run lint` 沒有錯誤
- ✅ Git commit 時自動運行檢查
- ✅ 有語法錯誤時無法提交
- ✅ Pull Request 使用統一的模板

---

## 📚 延伸閱讀

- [ESLint 官方文件](https://eslint.org/docs/latest/)
- [Husky 官方文件](https://typicode.github.io/husky/)
- [JavaScript 最佳實踐](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🆘 需要幫助？

如果在實施過程中遇到問題：

1. 檢查 Node.js 版本：`node --version`（建議 >= 14.x）
2. 檢查 npm 版本：`npm --version`（建議 >= 6.x）
3. 查看 ESLint 輸出的詳細錯誤訊息
4. 參考本文件的「常見問題處理」章節

---

**實施完成後，請更新 CHANGELOG_DEV.md 記錄這些改進！**
