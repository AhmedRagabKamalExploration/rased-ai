import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// Organizations table - multi-tenant support with domain validation
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  secretApiKey: text("secret_api_key").notNull().unique(),
  whitelistedDomains: text("whitelisted_domains").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table - tracks user sessions across transactions
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .references(() => organizations.id)
      .notNull(),
    deviceId: text("device_id").notNull(),
    sessionToken: text("session_token").unique(),
    handshakeHash: text("handshake_hash"), // For validating token requests
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  },
  (table) => ({
    orgDeviceIdx: index("sessions_org_device_idx").on(
      table.organizationId,
      table.deviceId
    ),
    tokenIdx: index("sessions_token_idx").on(table.sessionToken),
  })
);

// Transactions table - individual user actions within a session
export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .references(() => sessions.id)
      .notNull(),
    organizationId: text("organization_id")
      .references(() => organizations.id)
      .notNull(),
    status: text("status", {
      enum: ["pending", "active", "completed", "failed"],
    })
      .default("pending")
      .notNull(),
    metadata: jsonb("metadata"), // For additional transaction context
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    sessionIdx: index("transactions_session_idx").on(table.sessionId),
    orgIdx: index("transactions_org_idx").on(table.organizationId),
  })
);

// Events table - stores all behavioral and fingerprinting data
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id")
      .references(() => transactions.id)
      .notNull(),
    organizationId: text("organization_id")
      .references(() => organizations.id)
      .notNull(),
    sessionId: text("session_id").notNull(),
    deviceId: text("device_id").notNull(),
    batchId: text("batch_id").notNull(),
    eventType: text("event_type").notNull(), // e.g., "mouse", "keyboard", "webrtc"
    payload: jsonb("payload").notNull(),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
  },
  (table) => ({
    transactionIdx: index("events_transaction_idx").on(table.transactionId),
    orgIdx: index("events_org_idx").on(table.organizationId),
    sessionIdx: index("events_session_idx").on(table.sessionId),
    batchIdx: index("events_batch_idx").on(table.batchId),
    typeIdx: index("events_type_idx").on(table.eventType),
  })
);

// Export types for TypeScript inference
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
