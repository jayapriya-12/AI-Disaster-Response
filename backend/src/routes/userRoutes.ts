import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/userController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', authorizeRoles('ADMIN', 'RESPONDER'), getUsers);
router.get('/:id', getUserById);

export default router;
