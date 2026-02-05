import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const [workoutCount, runCount, totalRunDistance, sleepAvg, latestWeight] = await Promise.all([
            prisma.workout.count({ where: { userId } }),
            prisma.run.count({ where: { userId } }),
            prisma.run.aggregate({
                where: { userId },
                _sum: { distance: true }
            }),
            prisma.sleepLog.aggregate({
                where: { userId },
                _avg: { duration: true, quality: true }
            }),
            prisma.weightLog.findFirst({
                where: { userId },
                orderBy: { date: 'desc' }
            })
        ]);

        const recentWorkouts = await prisma.workout.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 5
        });

        res.json({
            counts: {
                workouts: workoutCount,
                runs: runCount,
                totalRunDistance: totalRunDistance._sum.distance || 0,
                avgSleepDuration: sleepAvg._avg.duration || 0,
                avgSleepQuality: sleepAvg._avg.quality || 0,
                currentWeight: latestWeight?.weight || null,
            },
            recentWorkouts
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
};
