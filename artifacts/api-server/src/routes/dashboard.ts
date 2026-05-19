import { Router } from "express";
import { db, sosAlertsTable, emergencyContactsTable, incidentsTable } from "@workspace/db";
import { eq, count, and, gte } from "drizzle-orm";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { userId } = parsed.data;

  const [alertCounts] = await db
    .select({ total: count() })
    .from(sosAlertsTable)
    .where(eq(sosAlertsTable.userId, userId));

  const [activeAlerts] = await db
    .select({ total: count() })
    .from(sosAlertsTable)
    .where(and(eq(sosAlertsTable.userId, userId), eq(sosAlertsTable.status, "active")));

  const [resolvedAlerts] = await db
    .select({ total: count() })
    .from(sosAlertsTable)
    .where(and(eq(sosAlertsTable.userId, userId), eq(sosAlertsTable.status, "resolved")));

  const [contactCounts] = await db
    .select({ total: count() })
    .from(emergencyContactsTable)
    .where(eq(emergencyContactsTable.userId, userId));

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentIncidents] = await db
    .select({ total: count() })
    .from(incidentsTable)
    .where(gte(incidentsTable.createdAt, oneDayAgo));

  res.json({
    totalAlerts: alertCounts?.total ?? 0,
    activeAlerts: activeAlerts?.total ?? 0,
    resolvedAlerts: resolvedAlerts?.total ?? 0,
    totalContacts: contactCounts?.total ?? 0,
    recentIncidents: recentIncidents?.total ?? 0,
  });
});

export default router;
