import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
} from '../controllers/assignmentController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', authorizeRoles('ADMIN', 'RESPONDER'), getAssignments);
router.get('/:id', authorizeRoles('ADMIN', 'RESPONDER'), getAssignmentById);
router.post('/', authorizeRoles('ADMIN'), createAssignment);
router.put('/:id', authorizeRoles('ADMIN', 'RESPONDER'), updateAssignment);

export default router;
