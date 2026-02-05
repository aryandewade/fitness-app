import { Router } from 'express';
import { getRuns, logRun, deleteRun } from '../controllers/runController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getRuns);
router.post('/', logRun);
router.delete('/:id', deleteRun);

export default router;
