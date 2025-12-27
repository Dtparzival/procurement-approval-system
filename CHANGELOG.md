# Release 分支變更記錄

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
