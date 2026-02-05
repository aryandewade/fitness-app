import { Router } from 'express';
import { getWorkouts, createWorkout, deleteWorkout } from '../controllers/workoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getWorkouts);
router.post('/', createWorkout);
router.delete('/:id', deleteWorkout);

export default router;
