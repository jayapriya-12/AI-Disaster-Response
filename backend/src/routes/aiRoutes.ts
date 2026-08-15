import { Router } from 'express';
import { predictSeverity, prioritizeReports, recommendRelief } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/predict-severity', predictSeverity);
router.get('/prioritize-reports', prioritizeReports);
router.post('/recommend-relief', recommendRelief);

export default router;
