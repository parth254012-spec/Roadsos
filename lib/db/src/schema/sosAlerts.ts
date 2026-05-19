import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertTypeEnum = pgEnum("alert_type", ["accident", "breakdown", "medical", "fire", "other"]);
export const alertStatusEnum = pgEnum("alert_status", ["active", "resolved", "cancelled"]);

export const sosAlertsTable = pgTable("sos_alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: alertTypeEnum("type").notNull(),
  status: alertStatusEnum("status").notNull().default("active"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSosAlertSchema = createInsertSchema(sosAlertsTable).omit({ createdAt: true });
export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type SosAlert = typeof sosAlertsTable.$inferSelect;
