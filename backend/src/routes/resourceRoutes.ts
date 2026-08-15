import { Router } from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/', authorizeRoles('ADMIN'), createResource);
router.put('/:id', authorizeRoles('ADMIN', 'RESPONDER'), updateResource);
router.delete('/:id', authorizeRoles('ADMIN'), deleteResource);

export default router;
