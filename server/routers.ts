import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  procurement: router({
    /**
     * 識別文件內容並提取關鍵資訊
     */
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
          // 使用 AI 分析文件內容
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

    /**
     * 生成採購簽呈
     */
    generate: protectedProcedure
      .input(
        z.object({
          userInput: z.string().min(10, "請提供至少10個字的描述"),
          attachments: z.array(z.object({
            fileName: z.string(),
            fileUrl: z.string(),
            fileKey: z.string(),
            mimeType: z.string().optional(),
            fileSize: z.number().optional(),
          })).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 構建系統提示詞
        const systemPrompt = `你是一個專業的公文簽呈撰寫助手。請根據使用者提供的資訊,生成一份完整的採購簽呈公文。

簽呈格式要求:
1. 標題:明確標示「採購簽呈」及主要採購項目
2. 主旨:簡明說明採購目的與必要性
3. 說明:
   - 採購物品/服務名稱與規格
   - 數量與單價
   - 預估總金額
   - 供應商資訊(如有)
   - 使用單位/部門
   - 使用目的與預期效益
4. 辦法:說明採購方式(公開招標/比價/小額採購等)
5. 預算來源:說明經費編列科目
6. 結論:提出具體建議(例如:「擬請核示」)

請使用正式公文語氣,條理清晰,內容完整。`;

        let userMessage = `請根據以下資訊生成採購簽呈:\n\n${input.userInput}`;
        
        if (input.attachments && input.attachments.length > 0) {
          userMessage += `\n\n附件檔案:${input.attachments.map(a => a.fileName).join(", ")}`;
        }

        // 調用 LLM 生成簽呈
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const generatedContent = typeof rawContent === 'string' ? rawContent : "";
        
        if (!generatedContent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "生成簽呈失敗,請稍後再試",
          });
        }

        // 提取標題(從生成內容的第一行或使用預設)
        const titleMatch = generatedContent.match(/^#?\s*(.+?)$/m);
        const title = titleMatch ? titleMatch[1].trim() : "採購簽呈";

        // 儲存簽呈記錄
        const approvalId = await db.createProcurementApproval({
          userId: ctx.user.id,
          userInput: input.userInput,
          generatedContent,
          title,
        });

        // 儲存附件記錄
        if (input.attachments && input.attachments.length > 0) {
          for (const attachment of input.attachments) {
            await db.saveUploadedDocument({
              approvalId: Number(approvalId),
              fileName: attachment.fileName,
              fileKey: attachment.fileKey,
              fileUrl: attachment.fileUrl,
              mimeType: attachment.mimeType,
              fileSize: attachment.fileSize,
            });
          }
        }

        return {
          id: approvalId,
          title,
          content: generatedContent,
        };
      }),

    /**
     * 上傳檔案到 S3
     */
    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 將 base64 轉換為 Buffer
        const buffer = Buffer.from(input.fileData, "base64");
        const fileSize = buffer.length;
        
        // 生成唯一檔案名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileExt = input.fileName.split(".").pop();
        const fileKey = `user-${ctx.user.id}/procurement-docs/${timestamp}-${randomStr}.${fileExt}`;

        // 上傳到 S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return {
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize,
        };
      }),

    /**
     * 獲取用戶的所有簽呈歷史
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserApprovals(ctx.user.id);
    }),

    /**
     * 獲取單一簽呈詳情
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const approval = await db.getApprovalById(input.id);
        
        if (!approval) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "簽呈不存在",
          });
        }

        // 檢查權限
        if (approval.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "無權查看此簽呈",
          });
        }

        const documents = await db.getApprovalDocuments(input.id);

        return {
          ...approval,
          documents,
        };
      }),

    /**
     * 刪除簽呈
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const approval = await db.getApprovalById(input.id);
        
        if (!approval) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "簽呈不存在",
          });
        }

        if (approval.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "無權刪除此簽呈",
          });
        }

        await db.deleteApproval(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
