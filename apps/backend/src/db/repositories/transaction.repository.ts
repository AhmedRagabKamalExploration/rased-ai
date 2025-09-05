import { db } from "@/db";
import { transactions } from "../schema";
import { eq, and } from "drizzle-orm";
import type { Transaction, NewTransaction } from "../schema";

export class TransactionRepository {
  public async findById(id: string): Promise<Transaction | undefined> {
    return db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });
  }

  public async create(data: NewTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(data).returning();
    return result[0];
  }

  public async updateStatus(
    id: string,
    status: "pending" | "active" | "completed" | "failed",
    completedAt?: Date
  ): Promise<Transaction | null> {
    const updateData: any = { status };
    if (completedAt) {
      updateData.completedAt = completedAt;
    }

    const result = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    return result[0] || null;
  }

  public async findBySessionId(sessionId: string): Promise<Transaction[]> {
    return db.query.transactions.findMany({
      where: eq(transactions.sessionId, sessionId),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });
  }

  public async validateTransaction(
    transactionId: string,
    sessionId: string,
    organizationId: string
  ): Promise<boolean> {
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.sessionId, sessionId),
        eq(transactions.organizationId, organizationId)
      ),
    });
    return !!transaction;
  }
}
