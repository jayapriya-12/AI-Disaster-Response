import { Router } from 'express';
import {
  getDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
} from '../controllers/disasterController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getDisasters);
router.get('/:id', getDisasterById);
router.post('/', createDisaster);
router.put('/:id', authorizeRoles('ADMIN', 'RESPONDER'), updateDisaster);
router.delete('/:id', authorizeRoles('ADMIN'), deleteDisaster);

export default router;
