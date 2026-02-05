import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const workouts = await prisma.workout.findMany({
            where: { userId },
            include: { exercises: true },
            orderBy: { date: 'desc' }
        });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workouts', error });
    }
};

export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { date, type, notes, exercises } = req.body;

        const workout = await prisma.workout.create({
            data: {
                userId,
                date: new Date(date),
                type,
                notes,
                exercises: {
                    create: (exercises || []).map((ex: any) => ({
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight,
                        duration: ex.duration
                    }))
                }
            },
            include: { exercises: true }
        });

        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Error creating workout', error });
    }
};

export const deleteWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const workout = await prisma.workout.findUnique({
            where: { id: id as string }
        });

        if (!workout) {
            res.status(404).json({ message: 'Workout not found' });
            return;
        }

        if (workout.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.workout.delete({
            where: { id: id as string }
        });

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workout', error });
    }
};
