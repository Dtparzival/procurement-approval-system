import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 採購簽呈記錄表
 * 儲存使用者生成的採購簽呈內容與相關資訊
 */
export const procurementApprovals = mysqlTable("procurement_approvals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 使用者輸入的自然語言描述 */
  userInput: text("userInput").notNull(),
  /** AI 生成的簽呈內容 */
  generatedContent: text("generatedContent"),
  /** 簽呈標題(從內容中提取或生成) */
  title: varchar("title", { length: 255 }),
  /** 簽呈狀態: draft(草稿), completed(已完成) */
  status: mysqlEnum("status", ["draft", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcurementApproval = typeof procurementApprovals.$inferSelect;
export type InsertProcurementApproval = typeof procurementApprovals.$inferInsert;

/**
 * 上傳文件表
 * 儲存使用者上傳的參考文件資訊
 */
export const uploadedDocuments = mysqlTable("uploaded_documents", {
  id: int("id").autoincrement().primaryKey(),
  approvalId: int("approvalId").notNull(),
  /** 原始檔案名稱 */
  fileName: varchar("fileName", { length: 255 }).notNull(),
  /** S3 儲存路徑 */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** S3 公開 URL */
  fileUrl: text("fileUrl").notNull(),
  /** 檔案類型 */
  mimeType: varchar("mimeType", { length: 100 }),
  /** 檔案大小(bytes) */
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadedDocument = typeof uploadedDocuments.$inferSelect;
export type InsertUploadedDocument = typeof uploadedDocuments.$inferInsert;