import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sosRouter from "./sos";
import contactsRouter from "./contacts";
import incidentsRouter from "./incidents";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sosRouter);
router.use(contactsRouter);
router.use(incidentsRouter);
router.use(dashboardRouter);

export default router;
