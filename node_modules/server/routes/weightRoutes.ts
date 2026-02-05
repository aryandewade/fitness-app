import { Router } from 'express';
import { getWeightLogs, logWeight, deleteWeightLog } from '../controllers/weightController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getWeightLogs);
router.post('/', logWeight);
router.delete('/:id', deleteWeightLog);

export default router;
