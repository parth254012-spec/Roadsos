import { Router } from "express";
import { db, incidentsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ReportIncidentBody, ListIncidentsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/incidents", async (req, res) => {
  const parsed = ListIncidentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const incidents = await db
    .select()
    .from(incidentsTable)
    .orderBy(desc(incidentsTable.createdAt))
    .limit(50);

  res.json(incidents.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

router.post("/incidents", async (req, res) => {
  const parsed = ReportIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const id = randomUUID();
  const [incident] = await db
    .insert(incidentsTable)
    .values({ id, ...parsed.data })
    .returning();
  res.status(201).json({ ...incident, createdAt: incident.createdAt.toISOString() });
});

export default router;
