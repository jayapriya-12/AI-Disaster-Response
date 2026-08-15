import { Router } from 'express';
import { getReports, getReportById, createReport, verifyReport } from '../controllers/reportController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.put('/:id/verify', authorizeRoles('ADMIN', 'RESPONDER'), verifyReport);

export default router;
