import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { InsertProcurementApproval, InsertUploadedDocument, procurementApprovals, uploadedDocuments } from "../drizzle/schema";
import { desc } from "drizzle-orm";

/**
 * 創建新的採購簽呈記錄
 */
export async function createProcurementApproval(data: InsertProcurementApproval) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(procurementApprovals).values(data);
  return result[0].insertId;
}

/**
 * 獲取使用者的所有簽呈記錄
 */
export async function getUserApprovals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(procurementApprovals)
    .where(eq(procurementApprovals.userId, userId))
    .orderBy(desc(procurementApprovals.createdAt));
}

/**
 * 獲取單一簽呈詳情
 */
export async function getApprovalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(procurementApprovals)
    .where(eq(procurementApprovals.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 刪除簽呈記錄
 */
export async function deleteApproval(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(procurementApprovals).where(eq(procurementApprovals.id, id));
}

/**
 * 儲存上傳文件記錄
 */
export async function saveUploadedDocument(data: InsertUploadedDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(uploadedDocuments).values(data);
  return result[0].insertId;
}

/**
 * 獲取簽呈的所有附件
 */
export async function getApprovalDocuments(approvalId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.approvalId, approvalId));
}
