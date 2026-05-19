import { Router } from "express";
import { db, sosAlertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  CreateSosAlertBody,
  UpdateSosAlertBody,
  GetSosAlertParams,
  UpdateSosAlertParams,
  ListSosAlertsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/sos/alerts", async (req, res) => {
  const parsed = ListSosAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { userId, limit = 20 } = parsed.data;
  const query = db
    .select()
    .from(sosAlertsTable)
    .orderBy(desc(sosAlertsTable.createdAt))
    .limit(limit);
  const alerts = userId
    ? await db.select().from(sosAlertsTable).where(eq(sosAlertsTable.userId, userId)).orderBy(desc(sosAlertsTable.createdAt)).limit(limit)
    : await query;
  res.json(alerts.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
});

router.post("/sos/alerts", async (req, res) => {
  const parsed = CreateSosAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const id = randomUUID();
  const [alert] = await db
    .insert(sosAlertsTable)
    .values({ id, ...parsed.data, status: "active" })
    .returning();
  res.status(201).json({ ...alert, createdAt: alert.createdAt.toISOString() });
});

router.get("/sos/alerts/:alertId", async (req, res) => {
  const parsed = GetSosAlertParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [alert] = await db
    .select()
    .from(sosAlertsTable)
    .where(eq(sosAlertsTable.id, parsed.data.alertId));
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json({ ...alert, createdAt: alert.createdAt.toISOString() });
});

router.patch("/sos/alerts/:alertId", async (req, res) => {
  const paramsParsed = UpdateSosAlertParams.safeParse(req.params);
  const bodyParsed = UpdateSosAlertBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (bodyParsed.data.status) updates.status = bodyParsed.data.status;
  if (bodyParsed.data.description) updates.description = bodyParsed.data.description;
  const [alert] = await db
    .update(sosAlertsTable)
    .set(updates)
    .where(eq(sosAlertsTable.id, paramsParsed.data.alertId))
    .returning();
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json({ ...alert, createdAt: alert.createdAt.toISOString() });
});

export default router;
