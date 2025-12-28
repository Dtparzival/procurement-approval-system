# 變更記錄

## [v1.9.7] - 2025-12-28

### 文件整理

#### 合併 README 相關檔案

- **問題描述**：專案中存在 `BRANCH_README.md` 檔案，這是開發分支的說明文件，在 release 分支中已不再需要獨立存在。

- **處理內容**：
  - 將 `BRANCH_README.md` 的重要內容（API 整合、測試狀態、部署方式）整合到 `README.md`
  - 刪除 `BRANCH_README.md` 檔案
  - 更新所有引用 `BRANCH_README.md` 的文件連結

#### 更新分支描述

- 更新 `docs/README.md` 中的「DEV 分支」描述為「release 分支」
- 更新 `docs/testing/README.md` 中的分支描述
- 更新 `FEATURE_GENERATE_API.md` 中的相關文件連結

#### 更新的文件

- `README.md`：整合 API 整合、測試狀態、部署方式等內容
- `docs/README.md`：移除「DEV 分支」描述
- `docs/testing/README.md`：更新分支描述為 release
- `FEATURE_GENERATE_API.md`：更新相關文件連結

### 技術改進

- 更新 CSS 版本號為 1.9.7
- 統一使用 `README.md` 作為專案主要說明文件

---

## [v1.9.6] - 2025-12-28

### 文件整理

#### 合併重複的變更記錄檔案

- **問題描述**：專案中同時存在 `CHANGELOG.md` 和 `CHANGELOG_DEV.md` 兩個類似檔名的檔案，造成文件管理混亂。

- **處理內容**：
  - 將 `CHANGELOG_DEV.md` 的歷史記錄整合到 `CHANGELOG.md`
  - 刪除 `CHANGELOG_DEV.md` 檔案
  - 更新所有引用 `CHANGELOG_DEV.md` 的文件連結

#### 更新的文件

- `README.md`：移除 `CHANGELOG_DEV.md` 的引用
- `docs/README.md`：更新所有連結指向 `CHANGELOG.md`
- `docs/testing/README.md`：更新相關文件連結
- `docs/testing/core-features-test-2025-12-13.md`：更新相關文件連結
- `docs/bugfix/archive/BUGFIX_v1.5.1.md`：更新相關文件連結
- `docs/bugfix/archive/BUGFIX_v1.5.4.md`：更新相關文件連結
- `BRANCH_README.md`：更新相關文件連結

### 技術改進

- 更新 CSS 版本號為 1.9.6
- 統一使用單一的 `CHANGELOG.md` 檔案紀錄所有版本變更

---

## [v1.9.5] - 2025-12-28

### 修復

#### 修正 iPhone 14 Pro Max 橫向模式下參考文件區塊未正常顯示的問題

- **問題描述**：iPhone 14 Pro Max 等手機在橫向模式下，不管有無上傳文件，參考文件區塊會發生未正常顯示的問題。

- **修復內容**：
  - 縮小橫向模式下上傳區域的 padding 和文字大小
  - 優化已上傳文件列表的橫向顯示
  - 設定最大高度和滾動以適應有限的垂直空間

#### 修正 iPhone 14 Pro Max 橫向模式下產生失敗畫面未完整呈現的問題

- **問題描述**：iPhone 14 Pro Max 等手機在橫向模式下，「產生失敗」畫面未完整呈現，「需要幫助？」區塊被截斷。

- **修復內容**：
  - 大幅縮小錯誤狀態的圖示、標題、訊息尺寸
  - 按鈕改為橫向排列以節省垂直空間
  - 幫助連結區域改為橫向排列並縮小字體
  - 在更小高度橫向模式下隱藏幫助連結區域

#### 優化橫向模式下的結果容器滾動

- **問題描述**：橫向模式下結果容器可能無法顯示完整內容。

- **修復內容**：
  - 設定結果容器的最大高度和滾動
  - 優化內容包裝器和右側欄位的滾動行為

### 技術改進

- 更新 CSS 版本號為 1.9.5
- 新增約 250 行橫向模式專用樣式

---

## [v1.9.4] - 2025-12-28

### 修復

#### 修正錯誤狀態和空狀態同時顯示的問題

- **問題描述**：iPhone 14 Pro Max 等手機在直向模式下，「尚未生成簽呈」和「產生失敗」兩個狀態會同時顯示。

- **修復內容**：
  - 新增 CSS `:has()` 選擇器以確保狀態互斥顯示
  - 當錯誤狀態顯示時，自動隱藏空狀態
  - 當載入狀態或生成內容顯示時，自動隱藏其他狀態

#### 修正手機版參考文件區塊顯示問題

- **問題描述**：iPhone 14 Pro Max 等手機在直向模式下，參考文件區塊未完整顯示。

- **修復內容**：
  - 優化手機版上傳區域的 padding 和文字大小
  - 設定已上傳文件列表的最大高度和滾動
  - 針對更小螢幕進行進一步優化

#### 修正手機版錯誤狀態顯示問題

- **問題描述**：手機版錯誤狀態的佈局需要優化。

- **修復內容**：
  - 調整錯誤狀態圖示、標題、訊息的大小
  - 按鈕改為垂直排列並全寬顯示
  - 幫助連結區域改為垂直排列

### 技術改進

- 更新 CSS 版本號為 1.9.4
- 使用 CSS `:has()` 選擇器實現狀態互斥顯示邏輯

---

## [v1.9.3] - 2025-12-28

### 修復

#### 修正 iPhone 14 Pro Max 橫向模式下「產生失敗」畫面的 scroll bar 問題

- **問題描述**：iPhone 14 Pro Max 等大螢幕手機在橫向模式下，「產生失敗」錯誤狀態畫面會出現不必要的滾動條。

- **修復內容**：
  - 新增橫向模式專用的錯誤狀態樣式（`@media (max-height: 500px) and (orientation: landscape)`）
  - 設定錯誤狀態區域的 `overflow: hidden` 和 `min-height: auto`
  - 縮小錯誤狀態的圖示、文字和按鈕尺寸

#### 修正 iPhone 14 Pro Max 橫向模式下 Footer 未顯示的問題

- **問題描述**：iPhone 14 Pro Max 等大螢幕手機在橫向模式下，Footer 被完全隱藏，影響品牌一致性。

- **修復內容**：
  - 覆蓋原本隱藏 Footer 的設定，改為顯示精簡版 Footer
  - Footer Grid 改為單行顯示，僅保留品牌區域和版權資訊
  - 隱藏詳細內容區塊以節省空間

### 技術改進

- 更新 CSS 版本號為 1.9.3
- 新增橫向模式整體佈局優化，確保頁面可以正常滾動到 Footer

---

## [v1.9.2] - 2025-12-28

### 修復

#### 修正 OpenAI API 模型名稱對應問題

- **問題描述**：UI 顯示的模型名稱（GPT-5.2、GPT-5 Mini、GPT-5 Nano）與實際 API 呼叫使用的模型名稱不一致，導致 API 呼叫失敗。

- **修復內容**：
  - 更新 `config.js` 中的 `DEFAULT_MODEL` 從 `gpt-4o-mini` 改為 `gpt-5-mini`
  - 更新 `config.js` 中的 `MODELS` 陣列，包含正確的模型 ID：`gpt-5-mini`、`gpt-5-nano`、`gpt-5.2`
  - 更新 `index.html` 中自訂下拉選單的 `data-value` 屬性，確保與 API 模型名稱一致

#### 修正 OpenAI API 參數相容性問題

- **問題描述**：GPT-5 系列模型不支援 `max_tokens` 和自訂 `temperature` 參數。

- **修復內容**：
  - 將 `api.js` 中的 `max_tokens` 參數改為 `max_completion_tokens`
  - 移除 `temperature` 參數以使用模型預設值

### 技術改進

- 更新 CSS 版本號為 1.9.2
- 確保 UI 模型選擇與 API 呼叫的模型名稱完全一致

---

## [v1.9.1] - 2025-12-28

### 新增

- 新增畫面呈現相關資訊一覽表文件 (`docs/UI_DISPLAY_INFO.md`)

### 變更

- 更新 OpenAI API 可選用的模型為 GPT-5.2、GPT-5 Mini、GPT-5 Nano

### 修復

- 修正 iPhone 14 Pro Max 橫向模式下的畫面呈現問題
- 優化手機橫向模式下的主要內容區域佈局

---

## [v1.9.0] - 2025-12-28

### 新增功能

#### 系統設定新增 OpenAI API 開關

- **功能描述**：在系統設定中新增「使用 OpenAI API」開關，讓使用者可以選擇使用自己的 OpenAI API Key 或內建的 AWS API Gateway。

- **開關開啟時**：
  - 顯示 API Key 輸入欄位
  - 顯示 AI 模型選擇（GPT-4o Mini、GPT-3.5 Turbo、GPT-4o）
  - 顯示取得 OpenAI API Key 連結
  - 顯示提示訊息（如何確認 API Key 是否正確）

- **開關關閉時**：
  - 隱藏 API Key 輸入欄位和 AI 模型選擇
  - 維持使用內建 AWS API Gateway

### 問題修復

#### 修正 iPhone 橫向模式下的 scroll bar 問題

- **問題描述**：iPhone 14 Pro Max 等大螢幕手機在橫向模式下，「尚未生成簽呈」區域會出現不必要的滾動條，與其他裝置的顯示效果不一致。

- **修復方案**：
  - 新增橫向模式專用的媒體查詢（`@media (orientation: landscape) and (max-height: 500px)`）
  - 設定空狀態區域的 `overflow: visible` 和 `min-height: auto`
  - 調整空狀態圖示和文字的大小

### 文件更新

- 更新 `docs/ERROR_CODES.md`，新增 API 模式說明區塊

### 技術改進

- 在 `config.js` 中新增 `USE_OPENAI` 儲存 key
- 在 `storage.js` 中新增 `useOpenAI` 的 getter 和 setter
- 在 `ui.js` 中新增 `bindOpenAIToggle()` 函數
- 在 `api.js` 中修改 `generateApproval()` 函數，支援 OpenAI API 和 AWS API 的切換

---

## [v1.8.3] - 2025-12-27

### 功能優化

#### 生成結果區域下緣邊框優化

- **問題描述**：生成結果內容區域的下緣邊框過寬，影響使用者體驗。

- **優化方案**：
  - 減少生成內容區域的底部 padding，從 48px (3rem) 減少到 16px (1rem)
  - 響應式設計支援不同裝置的底部 padding
  - 提升內容顯示的緊湊度

### 技術改進

- 更新所有螢幕尺寸的 `#generatedContent` 底部 padding
- 更新 `.scrollable-content` 和 `#generatedContent:not(.hidden)` 的底部 padding

---

## [v1.8.2] - 2025-12-27

### 功能優化

#### 參考文件區塊恢復與固定大小

- **問題描述**：需要恢復到上一版參考文件區塊的大小，並固定其區塊大小不會因為上傳文件而改變。

- **優化方案**：
  - 恢復到 v1.8.0 的參考文件區塊 HTML 結構
  - 區塊容器高度固定為 200px
  - 文件列表最大高度 80px，超過則滾動顯示
  - 保留文件計數顯示和優化的文件列表 UI

### 技術改進

- 使用 `.upload-content-wrapper` 類別取代 `.upload-content-container`
- 響應式設計支援不同裝置的容器高度

---

## [v1.8.1] - 2025-12-27

### 功能優化

#### 參考文件區塊固定大小和 UI/UX 優化

- **問題描述**：參考文件區塊會因為上傳文件多寡而改變大小，影響整體佈局。

- **優化方案**：
  - 區塊大小固定為 180px，不因上傳文件而改變
  - 新增文件計數顯示（右上角顯示「X 個文件」）
  - 優化文件列表 UI：
    - 使用綠色 `file-text` 圖示
    - 文件名稱有 tooltip 顯示完整名稱
    - 刪除按鈕有 hover 效果
    - 文件列表有滾動條
  - 縮小上傳區域，讓文件列表有更多空間

### 技術改進

- 新增 `.upload-section-fixed` 類別用於固定區塊大小
- 新增 `.upload-content-container` 類別用於固定容器高度
- 新增 `.uploaded-file-item` 等類別用於文件列表樣式
- 新增 `updateFileCount()` 函數用於更新文件計數
- 響應式設計支援不同裝置的容器高度

---

## [v1.8.0] - 2025-12-27

### 功能優化

#### 固定參考文件區塊大小

- **問題描述**：參考文件區塊會因為上傳文件多寡而無限地向下延伸，影響整體佈局。

- **優化方案**：
  - 設定已上傳文件列表的最大高度（桌面版 120px，平板版 100px，手機版 120px）
  - 當文件數量超過顯示範圍時，提供滾動查看功能
  - 縮小上傳區域的 padding 和圖示大小，優化空間利用

### 技術改進

- 新增 `#uploadSection` ID 用於樣式控制
- 新增 `#uploadedFilesList` 的滾動條樣式
- 響應式設計支援不同裝置的最大高度設定

---

## [v1.7.9] - 2025-12-27

### 問題修復

#### 修正桌面版左右對齊問題

- **問題描述**：桌面版左右兩邊上下沒有對齊，右側「生成簽呈」按鈕與左側「參考文件」區塊底部不在同一水平線。

- **修復方案**：
  - 在 Grid 容器添加 `lg:items-stretch` 讓左右等高
  - 右側欄位使用 Flexbox 佈局，跟隨左側高度
  - 設定 `contentWrapper` 的 `max-height: 600px` 限制內容區域最大高度
  - 確保 `contentWrapper` 有 `overflow-y: auto` 允許滾動

### 技術改進

- 左右欄位使用 CSS Grid 的 `items-stretch` 實現等高對齊
- 右側結果區域使用 Flexbox 填滿可用空間
- 生成結果內容有獨立的滾動條，不會影響整體佈局

---

## [v1.7.8] - 2025-12-27

### 問題修復

#### 修正 v1.7.7 造成的桌面版佈局問題

- **問題描述**：v1.7.7 使用 `lg:items-stretch` 導致右側內容延伸到很長，沒有 scroll bar，左右不對齊。

- **修復方案**：
  - 移除 `lg:items-stretch`，改用 `align-self: flex-start` 讓左右頂部對齊
  - 恢復右側欄位的 `sticky` 定位和固定最大高度
  - 確保 `contentWrapper` 有 `overflow-y: auto` 允許滾動
  - 設定 `resultContainer` 的 `max-height` 限制結果區域高度

### 技術改進

- 右側欄位使用 `position: sticky` 固定在視窗頂部
- 生成結果區域有獨立的滾動條，不會隨左側內容高度變化

---

## [v1.7.7] - 2025-12-27

### 問題修復

#### 修復 API 呼叫時前次文件資料殘留問題

- **問題描述**：當用戶刪除上傳的文件後，下次點擊「生成簽呈」或「重新試一次」時，API 呼叫仍會帶到已刪除文件的內容資料。

- **根本原因**：`UI.removeUploadedFile()` 函數只移除了 DOM 元素，但沒有同步更新 `app.uploadedFiles` 陣列。

- **修復方案**：
  - 在 `showUploadedFile()` 函數中添加 `data-filename` 屬性以便識別文件
  - 修改 `removeUploadedFile()` 函數，在移除 DOM 元素的同時同步更新 `window.app.uploadedFiles` 陣列

#### 修復桌面版左右欄位上下對齊問題

- **問題描述**：桌面版左右兩邊上下沒有對齊，右側「生成簽呈」按鈕與左側「參考文件」區塊底部不在同一水平線。

- **根本原因**：右側欄位使用了 `sticky` 定位和 `align-self: flex-start`，導致不會隨左側高度變化。

- **修復方案**：
  - 在 Grid 容器添加 `lg:items-stretch` 讓左右等高
  - 移除右側欄位的 `sticky` 定位和 `align-self: flex-start`
  - 使用 Flexbox 的 `flex-1` 讓右側結果區域填滿可用空間

### 技術改進

- 統一使用 CSS Flexbox 佈局控制左右欄位高度對齊
- 確保文件刪除操作同步更新 JavaScript 狀態和 DOM

---

## [v1.7.6] - 2025-12-27

### 問題修復

#### 修復桌面版生成結果區域滾動問題

- **問題描述**：當左側上傳多個文件時，右側生成結果區域的底部內容會被遮蔽，無法滾動查看完整內容。

- **根本原因**：CSS 規則 `#contentWrapper:has(#generatedContent:not(.hidden))` 將 `overflow-y` 設為 `hidden`，導致內容無法滾動。

- **修復方案**：將 `overflow-y: hidden` 改為 `overflow-y: auto`，允許內容區域正常滾動顯示完整內容。

### 驗證項目

- **API 呼叫邏輯**：確認 `handleGenerate()` 和 `retryGenerate()` 函數每次都會讀取最新的表單資料，並生成新的 `sessionId`，確保每次 API 呼叫都帶新資料。

---

## [v1.7.5] - 2025-12-24

### 問題修復

#### 修復手機版 iOS Safari 自動縮放問題

- **問題描述**：手機版在點選草稿標題、採購需求描述欄位時，畫面會突然放大。待輸入完畢，螢幕鍵盤消失後，畫面不會回復原尺寸，導致畫面可移動偏移走位。

- **修改 viewport meta tag**：將 `maximum-scale=5.0, user-scalable=yes` 改為 `maximum-scale=1.0, user-scalable=no`，禁止用戶縮放以防止 iOS Safari 自動縮放。

- **確保輸入欄位字體至少 16px**：iOS Safari 只會對字體小於 16px 的輸入框進行自動縮放，已在 CSS 中強制設定所有輸入欄位字體為 16px。

- **添加 JavaScript 縮放修復**：在 `app.js` 中添加 `setupIOSZoomFix()` 和 `resetIOSZoom()` 方法，在輸入欄位 blur 時重置縮放比例和滾動位置。

- **防止水平滾動**：在 CSS 中設定 `html, body { overflow-x: hidden }`，防止頁面水平偏移。

### 技術改進

- 添加 iOS Safari 特定的 CSS 樣式（使用 `@supports (-webkit-touch-callout: none)`）
- 添加 `touch-action: manipulation` 以禁止雙擊縮放
- 添加 `-webkit-text-size-adjust: 100%` 防止文字大小自動調整

---

## [v1.7.4] - 2025-12-21

### 問題修復

#### 徹底修復桌面版生成結果滾動內容底部遮蔽問題

- **調整 max-height 計算值**：將 `contentWrapper` 的 `max-height` 從 `calc(100vh - 260px)` 調整為 `calc(100vh - 220px)`，增加 40px 的可用空間。
- **增加底部 padding**：將 `generatedContent` 的 `padding-bottom` 從 32px 增加到 48px，確保內容有足夠的呼吸空間。
- **移除 JavaScript 高度設定**：簡化 `setupLayoutAlignment` 函數，不再用 JavaScript 設定 `rightColumn.maxHeight`，讓 CSS 完全控制高度。
- **添加 CSS 版本號**：在 HTML 中添加 `?v=1.7.4` 以強制瀏覽器重新載入 CSS。

### 技術改進

- 統一使用 CSS 的響應式設計來控制內容區域高度，避免 JavaScript 和 CSS 的設定衝突。

---

## [v1.7.3] - 2025-12-21

### 問題修復

#### 桌面版滾動內容底部遮蔽問題徹底修復

- **移除固定 max-height 限制**：將 generatedContent 的 max-height 從固定計算值改為 none，讓 flex: 1 自動填滿 contentWrapper 的空間。
- **消除高度差距**：修復前 generatedContent 與 contentWrapper 有 60px 的高度差距，修復後差距為 0px。
- **全裝置支援**：針對所有 5 種響應式斷點統一修改，確保桌面版、平板版和手機版都能正常顯示完整內容。

---

## [v1.7.2] - 2025-12-21

### 🐛 問題修復

#### 滾動內容底部遮蔽問題修復

- **增加內容區域可用空間**：調整所有響應式斷點的 `max-height` 計算值，增加約 40px 的可用空間，確保滾動時底部內容不會被遮蔽。
- **Flexbox 佈局優化**：為 `#contentWrapper` 和 `#generatedContent` 添加 `flex: 1` 和 `min-height: 0`，讓內容區域能夠彈性填滿空間。
- **跨裝置一致性**：針對 5 種螢幕尺寸優化佈局，確保桌面版、平板版和手機版都能正常顯示完整內容。

---

## [v1.7.1] - 2025-12-21

### 🐛 問題修復

#### Scroll Bar 底部遮擋問題修復

- **修復底部內容被截斷問題**：解決了生成結果區塊底部有一塊空白區域遮擋內容的問題，現在內容可以完整滾動到底部。
- **添加底部 padding**：在 `.scrollable-content` 和 `#generatedContent:not(.hidden)` 添加 `padding-bottom: 2rem`，確保內容不被截斷且有足夠的呼吸空間。

#### 響應式設計優化

針對 5 種螢幕尺寸優化 `max-height` 計算：

| 裝置類型 | 螢幕寬度 | max-height |
|---------|---------|------------|
| 大螢幕 | 1280px+ | calc(100vh - 340px) |
| 標準螢幕 | 1024px - 1279px | calc(100vh - 360px) |
| 平板 | 768px - 1023px | calc(100vh - 320px) |
| 大手機 | 480px - 767px | calc(100vh - 280px) |
| 小手機 | <480px | calc(100vh - 260px) |

#### 小螢幕字體優化

- 在小手機上稍微縮小字體大小至 `0.875rem`，提升可讀性。

---

## [v1.7.0] - 2025-12-21

### 🐛 問題修復

#### Scroll Bar 穩定顯示問題修復

- **問題描述**：當生成結果內容超出可見區域時，scroll bar 顯示不穩定，有時會消失或無法正常滾動。
- **解決方案**：
  - 移除 HTML 中的 `overflow-y-auto` Tailwind class，避免與自定義 CSS 衝突
  - 添加自定義 `scrollable-content` class，使用 `!important` 確保 CSS 優先級
  - 設定明確的 `max-height: calc(100vh - 320px)` 限制內容區域高度
  - 自定義 webkit-scrollbar 樣式（10px 寬度、漸層背景）

### 📝 修改檔案

- `index.html`：修改 `#generatedContent` 的 class
- `css/style.css`：添加 scroll bar 穩定樣式
- `js/app.js`：簡化 `setupLayoutAlignment` 函數


---

## [v1.6.0] - 2025-12-14

### 功能增強、優化與修復

本次更新主要聚焦於提升使用者體驗和修復 PDF 下載功能的相關問題。

#### 功能增強

- **文件智能讀取 (文件上傳)**：實現了核心的文件上傳與內容提取功能。使用者現在可以上傳 PDF 或 Word (.docx) 格式的參考文件，系統會自動提取其純文字內容，並將其與採購需求描述一同提交給 LLM。這使得 AI 能夠參考更豐富的上下文資訊，從而生成更精準、更貼合需求的簽呈內容。
- **技術實現**：前端透過 `pdf.js` 和 `mammoth.js` 函式庫來解析文件內容。
- **問題修復**：修復了因文件內容過大導致 `localStorage` 配額超出的問題，確保大文件的處理穩定性。

#### 視覺與體驗優化

- **AI 生成動畫**：根據使用者回饋，我們調整了 AI 生成簽呈時的載入動畫。移除了先前版本中較為複雜的粒子與光環效果，回歸到一個更為簡潔、專注的設計理念。新的動畫以「大腦」圖示為核心，透過多層次的光環與波紋效果，營造出 AI 正在深度思考的視覺氛圍，提升了互動的專業感與科技感。
- **首頁文案優化**：優化了首頁「文件識別」功能的文字描述，使其更準確地反映其「文件智能讀取」的核心能力，降低了使用者的理解門檻。

#### PDF 功能全方位修復

針對使用者回報的 PDF 下載功能問題，我們進行了多次迭代修復，最終採用了最穩定可靠的方案。

1. **格式變更 (Word → PDF)**：將原本的 Word (.docx) 下載功能，全面升級為 PDF 格式，以確保在任何裝置上都有一致的瀏覽體驗。
2. **跨裝置排版問題修復**：解決了在不同裝置（特別是手機與桌面）下載 PDF 時，因響應式佈局導致的排版錯亂問題。現在，所有 PDF 都會以標準的 A4 格式生成。
3. **內容空白/截斷問題修復**：解決了因渲染問題導致的 PDF 內容空白或不完整的問題。
4. **中文亂碼與浮水印問題修復**：
   - **最終方案**：放棄了有相容性問題的第三方函式庫 (`html2pdf.js`)，改為呼叫瀏覽器內建的原生列印功能 (`window.print()`)。此方案徹底解決了中文亂碼、內容截斷等所有已知問題。
   - **浮水印異常修復**：修正了因 CSS 換行符轉譯錯誤，導致浮水印中出現多餘「A」字母的問題。

#### 內控合規增強

- **PDF 安全標示**：為所有下載的 PDF 文件自動加入了符合內控與稽核要求的安全標示：
  - **中央浮水印**：「公司內部文件，請勿外流傳閱」
  - **頁腳警語**：詳細的保密條款聲明

### 技術實作亮點

- **動畫效果**：透過純 CSS 實現了多層次的 AI 思考動畫，兼顧了視覺效果與效能。
- **PDF 生成**：在多次嘗試第三方函式庫失敗後，回歸到使用瀏覽器原生 `window.print()` 功能，並透過 `@media print` 媒體查詢和動態 `<iframe>` 注入樣式，實現了穩定、可靠且帶有動態浮水印的 PDF 生成方案。

---

## [v1.5.4] - 2025-12-13

### Critical Hotfix

- **JavaScript 語法錯誤**: 修復 `js/app.js` 中 `draftsModal` 變數重複聲明的問題（第 155 行）
  - 移除重複的事件監聽器代碼（第 155-162 行）
  - 保留第 65-76 行的正確實現
  - 修復後所有功能恢復正常

### 影響範圍

**修復前**:
- JavaScript 語法錯誤導致整個 `app.js` 文件無法執行
- 所有功能失效（草稿、生成、下載）
- `ProcurementApp` 類無法被創建

**修復後**:
- JavaScript 語法錯誤已修復
- 所有功能恢復正常
- `ProcurementApp` 類可以被正確創建

### 文件更新

- 新增 `BUGFIX_v1.5.4.md` 詳細修復報告

### 重要提示

**清除快取**: 用戶需要清除瀏覽器快取（Ctrl+Shift+R）以確保使用最新版本的 JavaScript 文件。

---

## [v1.5.3] - 2025-12-13

### 修復

- **模型配置錯誤**: 修正不存在的模型名稱，從 `gpt-4.1-mini` 更新為 OpenAI 實際支援的 `gpt-4o-mini`。
- **模型選項更新**: 更新模型選項為：
  - `gpt-4o-mini` (GPT-4o Mini - 推薦)
  - `gpt-3.5-turbo` (GPT-3.5 Turbo - 快速)
  - `gpt-4o` (GPT-4o - 最強)
- **Word 下載功能**: 改進 `handleDownload()` 函數，新增：
  - 檢查 `docx` 和 `FileSaver` 庫是否已加載
  - 詳細的調試日誌（console.log）
  - 明確的錯誤訊息和解決方案

### 驗證完成

- 草稿功能代碼正確（事件委派機制）
- Word 下載功能代碼正確（庫已加載）
- 模型配置已更新為 OpenAI 支援的模型

### 文件更新

- 新增 `BUGFIX_v1.5.3_comprehensive.md` 綜合修復報告
- 整合了之前的所有 BUGFIX 文件

### 重要提示

**API Key 安全**: 如果您在對話中分享了 API Key，請立即前往 [OpenAI Platform](https://platform.openai.com/api-keys) 輪換 API Key。

---

## [v1.5.1] - 2025-12-13

### 修復

- **登入狀態顯示**: 修復登入後回到首頁仍顯示『登入』按鈕的問題，現在會正確檢查 `current_user` 狀態並隱藏登入按鈕。
- **表單樣式一致性**: 統一草稿標題和需求描述欄位的邊框線條樣式，使用相同的 `border`, `padding` 和 `rounded-lg` 類別。
- **Word 文件下載功能**: 大幅改進 Word 文件生成功能，新增：
  - 智能辨識標題格式（支援 Markdown `#` 和中文編號）
  - 自訂樣式設定（標題加粗、顏色、間距）
  - 頁面邊界設定
  - 文件名稱加上日期戲記
  - 更完善的錯誤處理和用戶反饋

### 優化

- **登入狀態管理**: 改進 `showHero()` 函數的登入狀態檢查邏輯，同時處理頂部和 Hero 區塊的登入按鈕。
- **使用者體驗**: 下載 Word 文件時顯示「正在生成 Word 文件...」的提示訊息。

### 測試完成

本次更新修復的功能：
- 登入後回到首頁不顯示登入按鈕
- 草稿標題和需求描述欄位樣式一致
- 草稿管理功能正常運作（查看、載入、刪除）
- Word 文件下載功能正常運作

---

## [v1.5.0] - 2025-12-13

### 新增

- **草稿管理功能**: 新增「查看草稿」按鈕，提供完整的草稿瀏覽 Modal，可查看、使用和刪除草稿。
- **Word 檔案下載**: 生成結果可直接下載為 Word 檔案（.docx 格式）。
- **測試報告**: 新增完整的測試報告文件（TESTING_REPORT.md）。

### 優化

- **首頁 UI 優化**: 移除大型 icon，改為更專業的標籤樣式。
- **彈跳視窗體驗**: Modal 打開時背景頁面無法滾動，提升使用者體驗。
- **複製功能優化**: 複製簽呈內容時改為複製純文字（使用 `textContent` 屬性）。
- **首頁登入按鈕邏輯**: 根據 localStorage 中的使用記錄判斷是否顯示登入按鈕。

### 修復

- **下載功能**: 修正下載按鈕無反應的問題，更新 CDN 連結（docx 7.8.2 + file-saver 2.0.5）。
- **草稿資料結構**: 修正 `showDraftsModal()` 和 `loadDraft()` 中的 `draft.content` → `draft.userInput`。
- **草稿時間戳記**: 修正時間戳記顯示，從 `draft.savedAt` 改為 `draft.updatedAt || draft.createdAt || draft.id`。
- **首頁登入按鈕**: 修正 `showHero()` 函數中的登入狀態檢查邏輯。

### 測試完成

所有核心功能均已測試通過：
- 首頁登入按鈕邏輯
- 草稿管理功能（查看、載入、刪除）
- Modal 背景滾動控制
- Word 檔案下載功能
- API 生成功能
- 設定功能
- 歷史記錄功能
- 複製功能（純文字）

---

## [2025-12-12] 復刻 main 分支 UI/UX 設計

### UI/UX 全面升級

**參考 main 分支的專業設計**
- 復刻 main 分支的應用程式介面設計，提供更專業、清晰的 UI/UX
- 保留 DEV 分支的 AI Agent 風格首頁和深藍色主題
- 保留已優化的 hover 效果和絲滑感

**頂部導航優化**
- 新增使用者資訊顯示
- 新增登出按鈕
- 統一按鈕樣式

**卡片設計優化**
- 所有卡片改用 `shadow-lg`，增強層次感
- 邊框改為 `border-gray-100`，更柔和

**採購需求描述區域優化**
- 新增卡片標題和說明文字
- 新增字數統計功能
- 改善上次儲存時間顯示

**生成結果區域優化**
- 新增下載按鈕
- 改善按鈕樣式

### 新功能

- **登出功能**: 點擊登出按鈕可清除認證狀態並重新載入頁面
- **下載功能**: 可將生成結果下載為 .txt 檔案
- **字數統計**: 即時顯示輸入框的字數

### 程式碼重構

**HTML**
- `index.html`: 大幅重構應用程式介面，參考 main 分支的結構

**CSS**
- `css/style.css`: 保持不變，保留增強的 hover 效果

**JavaScript**
- `js/app.js`: 新增 `handleLogout`, `handleDownload` 方法，並在 `bindEvents` 中添加新按鈕的事件監聽
- `js/ui.js`: 新增 `updateCharCount`, `updateLastSaved`, `updateUserInfo` 方法
- `js/storage.js`: 新增 `clearAuth` 方法

### 文件更新

- `README.md`: 更新核心特色，反映新的 UI/UX 設計
- `CHANGELOG.md`: 新增本次變更記錄

---

## [2025-12-06] UI 優化和 Google 認證整合

### 視覺設計升級

**Hero 區塊重新設計**
- 參考 main 分支的精美設計風格
- 新增大型應用程式圖示（藍色漸層圓角方塊）
- 優化主標題和副標題排版
- 新增「開始使用」CTA 按鈕
- 新增核心功能特色卡片展示：
  - AI 智能生成
  - 文件識別
  - 草稿管理

**設計系統統一**
- 採用藍色漸層主題色（#2563eb → #4f46e5）
- 現代化的卡片式佈局
- 統一的陰影和圓角設計
- 流暢的過渡動畫效果

### Google 認證功能

**OAuth 2.0 整合**
- 整合 Google Identity Services SDK
- 實作登入對話框
- 實作 Google Sign-In 按鈕
- 實作用戶狀態管理
- 實作登出功能

**多用戶支援**
- 用戶資料隔離機制
- 按用戶儲存 API Key
- 按用戶儲存草稿和歷史記錄
- 用戶資訊顯示（頭像、名稱、Email）

### 程式碼重構

**新增檔案**
- `js/auth.js` - Google 認證模組
- `GOOGLE_OAUTH_SETUP.md` - OAuth 設定指南
- `TEST_RESULTS.md` - 測試結果文件

**重寫檔案**
- `index.html` - 完整重寫，新增 Hero 區塊和登入對話框
- `js/app.js` - 重寫主應用程式邏輯
- `js/ui.js` - 重寫 UI 管理模組
- `js/storage.js` - 更新以支援多用戶資料隔離

**更新檔案**
- `css/style.css` - 新增 Google Sign-In 和空狀態樣式
- `js/config.js` - 修正 API 端點配置

### 技術改進

**模組化設計**
- 認證邏輯獨立成 auth.js 模組
- 清晰的模組職責劃分
- 完整的程式碼註解

**使用者體驗**
- 友善的登入流程
- 清晰的視覺反饋
- 流暢的動畫效果
- Toast 通知系統

**安全性**
- API Key 按用戶隔離
- 資料僅儲存在 localStorage
- 不會上傳到伺服器

### 文件更新

**新增文件**
- Google OAuth 設定完整指南
- 包含常見問題解答
- 包含進階配置說明

**測試文件**
- 完整的測試結果記錄
- 包含已知問題和解決方案
- 包含效能和安全性測試

### 部署準備

**靜態網頁就緒**
- 所有檔案都是靜態的
- 可直接部署到 AWS S3
- 可部署到 GitHub Pages
- 可部署到 Netlify/Vercel

**部署腳本**
- deploy-to-s3.sh 已準備好
- 包含完整的部署指令
- 包含 CORS 和快取設定

---

## [2025-12-06] API 端點修正

### Bug 修復

**修正 API 404 錯誤**
- 修正 Manus Forge API 端點
- 從 `https://api.manus.im/v1` 改為 `https://forge.manus.im`
- 更新設定介面說明文字
- 更新 README 中的 API Key 取得說明

---

## [2025-12-06] 清理 DEV 分支

### 重構

**移除全端版本檔案**
- 移除 client/ 目錄（React 前端）
- 移除 server/ 目錄（Express 後端）
- 移除 drizzle/ 目錄（資料庫）
- 移除 shared/ 目錄（共用型別）
- 移除 Node.js 配置檔案
- 移除 TypeScript 配置檔案

**保留靜態網頁版本**
- 保留 index.html
- 保留 css/ 目錄
- 保留 js/ 目錄
- 保留部署腳本
- 保留文件檔案

**目錄結構簡化**
- 將 static-web/ 的內容移到根目錄
- 更新 .gitignore
- 更新 README

---

## [2025-12-06] 初始靜態網頁版本

### 新功能

**靜態網頁版本建立**
- 建立 HTML/CSS/JavaScript 靜態網頁
- 實作 AI 簽呈生成功能
- 實作草稿管理功能
- 實作歷史記錄功能
- 實作檔案上傳功能

**技術實作**
- 使用 Tailwind CSS CDN
- 使用 Lucide Icons
- 使用 Marked.js 渲染 Markdown
- 使用 localStorage 儲存資料

**部署準備**
- 建立 AWS S3 部署腳本
- 建立 README 說明文件
- 建立 DEPLOYMENT 文件
