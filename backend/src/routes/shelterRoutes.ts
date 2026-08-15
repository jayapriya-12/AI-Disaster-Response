import { Router } from 'express';
import {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} from '../controllers/shelterController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.post('/', authorizeRoles('ADMIN'), createShelter);
router.put('/:id', authorizeRoles('ADMIN', 'RESPONDER'), updateShelter);
router.delete('/:id', authorizeRoles('ADMIN'), deleteShelter);

export default router;
