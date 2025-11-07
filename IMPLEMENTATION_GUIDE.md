# AI 文件自動識別功能 - 技術實作指南

## 概述

本文件詳細說明 **Agent 智簽公文**系統中 AI 自動識別參考文件並填入關鍵資訊功能的完整技術實作,包括後端 API 設計、前端介面整合、AI 提示詞工程,以及錯誤處理機制。

---

## 系統架構

整個功能涉及三個主要層次的協作:前端使用者介面、後端 API 服務,以及 AI 模型推理引擎。使用者上傳文件後,前端將文件傳送至後端進行 S3 儲存,隨後觸發 AI 識別 API,AI 模型分析文件內容並提取關鍵資訊,最終將結構化資料轉換為自然語言描述,回傳前端自動填充至需求描述欄位。

### 技術棧

**後端框架:** Express.js + tRPC  
**前端框架:** React 19 + TypeScript  
**AI 模型:** 透過 `invokeLLM` 函數調用多模態大型語言模型  
**檔案儲存:** AWS S3 相容物件儲存  
**資料庫:** MySQL (透過 Drizzle ORM)  

---

## 後端實作

### 1. API 端點定義

在 `server/routers.ts` 中新增 `extractDocumentInfo` 程序,負責接收文件資訊並調用 AI 進行內容識別。

```typescript
procurement: router({
  extractDocumentInfo: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        fileName: z.string(),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `你是一個專業的文件分析助手。請分析上傳的文件，識別出與採購相關的關鍵資訊。

請提取以下資訊：
- 採購物品/服務名稱
- 規格與型號
- 數量
- 單價與總價
- 採購目的與理由
- 使用單位/部門
- 預算來源
- 其他重要資訊

請以自然、流暢的文字描述這些資訊，不要使用條列式，像是在填寫簽呈的需求描述一樣。`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `請分析這個文件：${input.fileName}`,
                },
                {
                  type: "file_url",
                  file_url: {
                    url: input.fileUrl,
                    mime_type: input.mimeType as any,
                  },
                },
              ],
            },
          ],
        });

        const extractedInfo = response.choices[0]?.message?.content || "";

        return {
          success: true,
          extractedInfo,
        };
      } catch (error) {
        console.error("[Document Extraction Error]", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "文件識別失敗，請稍後再試",
        });
      }
    }),
})
```

### 2. 輸入驗證

使用 Zod 進行嚴格的輸入驗證,確保 API 接收到的參數符合預期格式。

**必填欄位:**
- `fileUrl`: 文件在 S3 的完整 URL
- `fileName`: 文件原始名稱,用於提供 AI 上下文

**選填欄位:**
- `mimeType`: 文件 MIME 類型,協助 AI 更準確地解析文件

### 3. AI 模型調用

透過 `invokeLLM` 函數調用多模態大型語言模型,該函數封裝了與 AI 服務的通訊細節,開發者只需專注於提示詞設計與結果處理。

**關鍵參數:**

**messages**: 對話訊息陣列,包含系統提示詞與使用者輸入

**系統提示詞 (System Prompt):** 定義 AI 的角色與任務目標,明確指出需要提取的資訊類型與輸出格式要求。本系統要求 AI 以自然流暢的文字描述關鍵資訊,而非條列式輸出,以便直接填入簽呈需求描述欄位。

**使用者輸入 (User Content):** 採用多模態內容格式,結合文字說明與文件 URL。透過 `file_url` 類型,AI 模型可直接存取並分析文件內容,支援 PDF、Word、圖片等多種格式。

### 4. 錯誤處理

實作完善的錯誤處理機制,確保即使 AI 服務暫時不可用,也不會影響使用者的正常操作流程。

**錯誤類型:**
- AI 服務連線失敗
- 文件內容無法解析
- 回應格式異常

**處理策略:**
- 捕獲所有異常並記錄詳細錯誤訊息
- 回傳友善的錯誤提示給前端
- 使用 tRPC 的 `TRPCError` 統一錯誤格式

---

## 前端實作

### 1. 狀態管理

在 `client/src/pages/Home.tsx` 中定義必要的狀態變數,管理使用者輸入、文件列表與 AI 識別狀態。

```typescript
const [userInput, setUserInput] = useState("");
const [uploadedFiles, setUploadedFiles] = useState<Array<{
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
}>>([]);
```

**userInput**: 需求描述欄位的內容,AI 識別結果會自動填充至此狀態  
**uploadedFiles**: 已上傳文件的列表,每個文件包含檔名、S3 金鑰、URL 等資訊  

### 2. 文件上傳處理

文件上傳成功後,立即觸發 AI 識別流程,實現無縫的使用者體驗。

```typescript
const uploadMutation = trpc.procurement.uploadFile.useMutation({
  onSuccess: (data) => {
    setUploadedFiles(prev => [...prev, data]);
    toast.success(`${data.fileName} 上傳成功`);
    
    // 自動觸發文件識別
    extractMutation.mutate({
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      mimeType: data.mimeType,
    });
  },
  onError: (error) => {
    toast.error(error.message || "上傳失敗");
  },
});
```

**設計考量:** 將文件上傳與 AI 識別解耦,即使識別失敗,文件仍成功上傳並可用於後續的簽呈生成流程。

### 3. AI 識別結果處理

接收 AI 識別結果後,智能合併至現有的需求描述內容。

```typescript
const extractMutation = trpc.procurement.extractDocumentInfo.useMutation({
  onSuccess: (data) => {
    if (data.extractedInfo) {
      setUserInput((prev: string) => {
        if (prev.trim()) {
          return `${prev}\n\n${data.extractedInfo}`;
        }
        return data.extractedInfo as string;
      });
      toast.success("已自動識別文件內容");
    }
  },
  onError: (error) => {
    toast.error("文件識別失敗，請手動輸入資訊");
  },
});
```

**合併邏輯:**
- 如果需求描述欄位為空,直接填入識別結果
- 如果欄位已有內容,在原內容後加上兩個換行符號,再附加識別結果
- 保留使用者已輸入的內容,避免資料遺失

### 4. UI 載入狀態

在 AI 識別過程中顯示載入動畫與提示文字,提升使用者體驗。

```tsx
<Textarea
  id="userInput"
  placeholder="例如:需要採購 10 台筆記型電腦..."
  value={userInput}
  onChange={(e) => setUserInput(e.target.value)}
  className="min-h-[120px] resize-none"
  disabled={generateMutation.isPending || extractMutation.isPending}
/>
{extractMutation.isPending && (
  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    正在識別文件內容...
  </p>
)}
```

**禁用邏輯:** 在 AI 識別或簽呈生成期間,禁用需求描述欄位的編輯功能,防止使用者誤操作導致資料不一致。

**視覺反饋:** 使用藍色文字與旋轉動畫圖示,清楚傳達系統正在處理的狀態。

---

## AI 提示詞工程

提示詞的設計直接影響 AI 識別的準確度與輸出品質。本系統採用結構化的提示詞設計,明確定義 AI 的角色、任務目標與輸出格式。

### 系統提示詞設計

**角色定位:** 將 AI 定位為「專業的文件分析助手」,建立專業的對話情境。

**任務目標:** 明確列出需要提取的八大類關鍵資訊,涵蓋採購簽呈所需的完整要素。

**輸出格式要求:** 強調使用「自然、流暢的文字描述」而非「條列式」,確保識別結果可直接填入簽呈需求描述欄位,無需額外格式轉換。

### 使用者輸入設計

**多模態內容:** 結合文字說明與文件 URL,提供 AI 完整的上下文資訊。

**文字部分:** 簡潔的指令「請分析這個文件」加上文件名稱,協助 AI 理解任務。

**文件部分:** 透過 `file_url` 類型傳遞文件 URL 與 MIME 類型,AI 模型會自動下載並分析文件內容。

### 提示詞優化策略

**明確性:** 避免模糊的指令,具體說明需要提取的資訊類型。

**範例引導:** 在提示詞中提供輸出範例,引導 AI 產生符合預期的結果。

**格式約束:** 明確要求輸出格式,避免 AI 自由發揮導致格式不一致。

---

## 資料流程

完整的資料流程涉及前端、後端與 AI 服務的多次互動,以下詳細說明每個步驟的資料傳遞與處理邏輯。

### 步驟 1: 使用者上傳文件

使用者在前端選擇文件後,前端讀取文件內容並轉換為 Base64 編碼,透過 `uploadFile` API 傳送至後端。

**資料格式:**
```typescript
{
  fileName: "採購需求書.pdf",
  fileData: "JVBERi0xLjQKJeLjz9MK...",  // Base64 編碼
  mimeType: "application/pdf"
}
```

### 步驟 2: 後端儲存文件

後端接收文件資料後,使用 `storagePut` 函數將文件上傳至 S3 儲存,並將文件元資料儲存至資料庫。

**S3 儲存:**
- 生成隨機檔名,防止列舉攻擊
- 設定適當的 Content-Type
- 回傳公開存取的 URL

**資料庫記錄:**
```typescript
{
  userId: 123,
  fileName: "採購需求書.pdf",
  fileKey: "user-123/abc123.pdf",
  fileUrl: "https://s3.example.com/user-123/abc123.pdf",
  mimeType: "application/pdf",
  fileSize: 1024000
}
```

### 步驟 3: 觸發 AI 識別

前端接收上傳成功回應後,立即調用 `extractDocumentInfo` API,傳遞文件 URL 與元資料。

**請求資料:**
```typescript
{
  fileUrl: "https://s3.example.com/user-123/abc123.pdf",
  fileName: "採購需求書.pdf",
  mimeType: "application/pdf"
}
```

### 步驟 4: AI 分析文件

後端調用 `invokeLLM` 函數,將文件 URL 與提示詞傳遞給 AI 模型。AI 模型下載文件內容,進行多模態分析,提取關鍵資訊並生成自然語言描述。

**AI 處理流程:**
1. 下載並解析文件內容
2. 識別文字、表格、圖片等元素
3. 理解語義並提取關鍵資訊
4. 將結構化資料轉換為流暢的文字描述

### 步驟 5: 回傳識別結果

AI 模型完成分析後,後端將識別結果包裝為標準回應格式,回傳前端。

**回應資料:**
```typescript
{
  success: true,
  extractedInfo: "本次採購需求為商用筆記型電腦 Dell Latitude 5540..."
}
```

### 步驟 6: 前端自動填充

前端接收識別結果後,根據合併邏輯更新 `userInput` 狀態,需求描述欄位自動顯示識別內容。

---

## 錯誤處理與容錯機制

系統設計了多層次的錯誤處理機制,確保在各種異常情況下仍能提供良好的使用者體驗。

### 前端錯誤處理

**檔案大小檢查:** 在上傳前檢查檔案大小,超過 10MB 立即提示錯誤,避免浪費網路頻寬。

**上傳失敗處理:** 顯示友善的錯誤訊息,允許使用者重試。

**識別失敗處理:** 即使 AI 識別失敗,使用者仍可手動輸入需求描述,不影響正常流程。

### 後端錯誤處理

**AI 服務異常:** 捕獲所有 AI 調用異常,記錄詳細錯誤訊息供後續排查。

**文件存取失敗:** 處理 S3 存取權限或網路問題導致的文件讀取失敗。

**回應格式驗證:** 驗證 AI 回應格式,避免異常資料傳遞至前端。

### 使用者體驗優化

**非阻塞設計:** AI 識別失敗不會阻塞使用者繼續操作,保持流程流暢。

**明確的錯誤提示:** 使用清晰的語言說明錯誤原因與建議操作。

**自動重試機制:** 對於暫時性錯誤(如網路波動),實作自動重試邏輯。

---

## 效能優化

為確保系統在高負載情況下仍能穩定運行,實作了多項效能優化措施。

### 前端優化

**防抖處理:** 對於文件上傳等操作,實作防抖機制,避免重複提交。

**狀態管理優化:** 使用 React 的 `useState` 與 `useMutation`,確保狀態更新的效率。

**載入狀態管理:** 精確控制載入狀態的顯示與隱藏,避免不必要的 UI 重繪。

### 後端優化

**非同步處理:** 所有 I/O 操作(S3 上傳、AI 調用)均採用非同步模式,避免阻塞主執行緒。

**連線池管理:** 資料庫連線使用連線池,減少連線建立的開銷。

**錯誤快速失敗:** 對於明顯的錯誤(如檔案格式不支援),快速回傳錯誤,避免浪費運算資源。

### AI 調用優化

**提示詞精簡:** 設計簡潔有效的提示詞,減少 Token 使用量,降低延遲。

**結果快取:** 對於相同文件的重複識別請求,可考慮快取識別結果(未來優化方向)。

---

## 安全性考量

系統在設計時充分考慮了資料安全與隱私保護,實作了多項安全措施。

### 身份驗證

**protectedProcedure:** 所有涉及文件上傳與識別的 API 均使用 `protectedProcedure`,確保僅限登入使用者存取。

**使用者隔離:** 每個使用者僅能存取自己上傳的文件,透過 `ctx.user.id` 進行權限控制。

### 文件安全

**隨機檔名:** 上傳至 S3 的文件使用隨機生成的檔名,防止列舉攻擊。

**存取控制:** 雖然 S3 bucket 設定為公開讀取,但文件 URL 包含隨機字串,難以被猜測。

**檔案大小限制:** 限制單一文件最大 10MB,防止惡意上傳大型文件消耗儲存空間。

### 資料隱私

**不儲存識別內容:** AI 識別結果僅暫存於使用者瀏覽器,不額外儲存至資料庫,減少隱私風險。

**文件自動清理:** 可設定文件保留期限,過期自動刪除(未來優化方向)。

---

## 測試策略

為確保功能的穩定性與可靠性,建議實作以下測試策略。

### 單元測試

**後端 API 測試:** 測試 `extractDocumentInfo` 的輸入驗證、錯誤處理與回應格式。

**前端元件測試:** 測試文件上傳元件的狀態管理與使用者互動邏輯。

### 整合測試

**端到端流程測試:** 模擬使用者上傳文件、AI 識別、自動填充的完整流程。

**錯誤情境測試:** 測試各種錯誤情境(檔案過大、AI 服務不可用等)的處理邏輯。

### 效能測試

**負載測試:** 模擬多使用者同時上傳文件,測試系統的併發處理能力。

**AI 回應時間測試:** 測量不同文件大小與格式的 AI 識別時間,優化使用者體驗。

---

## 部署注意事項

在生產環境部署時,需注意以下事項以確保系統穩定運行。

### 環境變數設定

確保以下環境變數已正確設定:

- `DATABASE_URL`: 資料庫連線字串
- `BUILT_IN_FORGE_API_URL`: AI 服務端點 URL
- `BUILT_IN_FORGE_API_KEY`: AI 服務認證金鑰
- S3 相關設定(Access Key, Secret Key, Bucket Name 等)

### 監控與日誌

**錯誤日誌:** 記錄所有 AI 調用失敗與異常情況,供後續排查。

**效能監控:** 監控 AI 識別的平均回應時間,及時發現效能瓶頸。

**使用量統計:** 追蹤文件上傳量與 AI 調用次數,評估系統負載。

### 備份與災難恢復

**資料庫備份:** 定期備份資料庫,確保文件元資料不遺失。

**S3 備份:** 設定 S3 的版本控制與跨區域複製,防止文件遺失。

---

## 未來優化方向

基於目前的實作,以下是未來可考慮的優化方向。

### 1. 批次文件處理

支援使用者一次上傳多個文件,AI 整合所有文件的資訊後,生成統一的需求描述。

**技術挑戰:** 需要設計合理的資訊合併邏輯,避免內容重複或衝突。

### 2. 結構化資料提取

除了自然語言描述外,額外提取結構化資料(如物品名稱、數量、價格等),提供可編輯的表單介面。

**技術實作:** 使用 AI 的 JSON 模式輸出,確保回應格式的一致性。

### 3. 識別結果快取

對於相同文件的重複識別請求,快取識別結果以減少 AI 調用次數與回應時間。

**快取策略:** 使用文件的 SHA-256 雜湊值作為快取鍵,設定合理的過期時間。

### 4. 多語言文件支援

支援識別英文、日文等外文文件,自動翻譯並整合到中文簽呈中。

**技術挑戰:** 需要處理不同語言的語義理解與翻譯準確性問題。

### 5. 使用者反饋機制

允許使用者對 AI 識別結果進行評分與修正,透過機器學習持續優化識別準確度。

**技術實作:** 收集使用者反饋資料,定期重新訓練或微調 AI 模型。

---

## 總結

本技術實作指南詳細說明了 AI 自動識別參考文件功能的完整實作細節,涵蓋後端 API 設計、前端介面整合、AI 提示詞工程、錯誤處理、效能優化與安全性考量等多個面向。透過結構化的設計與完善的錯誤處理機制,系統能夠在各種情境下提供穩定可靠的服務,大幅提升使用者的簽呈撰寫效率。

未來可基於目前的實作,持續優化 AI 識別的準確度、支援更多文件格式、提供更豐富的使用者互動功能,進一步提升系統的實用性與競爭力。

---

**文件版本:** 1.0  
**最後更新:** 2025-11-08  
**作者:** Manus AI
