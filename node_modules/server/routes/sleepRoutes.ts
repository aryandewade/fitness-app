import { Router } from 'express';
import { getSleepLogs, logSleep, deleteSleepLog } from '../controllers/sleepController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getSleepLogs);
router.post('/', logSleep);
router.delete('/:id', deleteSleepLog);

export default router;
