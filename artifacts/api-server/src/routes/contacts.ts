import { Router } from "express";
import { db, emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  CreateContactBody,
  DeleteContactParams,
  ListContactsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/contacts", async (req, res) => {
  const parsed = ListContactsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const contacts = await db
    .select()
    .from(emergencyContactsTable)
    .where(eq(emergencyContactsTable.userId, parsed.data.userId));
  res.json(contacts);
});

router.post("/contacts", async (req, res) => {
  const parsed = CreateContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const id = randomUUID();
  const [contact] = await db
    .insert(emergencyContactsTable)
    .values({ id, ...parsed.data })
    .returning();
  res.status(201).json(contact);
});

router.delete("/contacts/:contactId", async (req, res) => {
  const parsed = DeleteContactParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(emergencyContactsTable)
    .where(eq(emergencyContactsTable.id, parsed.data.contactId));
  res.status(204).send();
});

export default router;
