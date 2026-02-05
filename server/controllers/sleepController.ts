import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getSleepLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const logs = await prisma.sleepLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sleep logs', error });
    }
};

export const logSleep = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { date, duration, quality, bedTime, wakeTime } = req.body;

        const log = await prisma.sleepLog.create({
            data: {
                userId,
                date: new Date(date),
                duration: parseInt(duration),
                quality: parseInt(quality),
                bedTime: bedTime ? new Date(bedTime) : null,
                wakeTime: wakeTime ? new Date(wakeTime) : null
            }
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Error logging sleep', error });
    }
};

export const deleteSleepLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: 'Missing sleep log ID' });
            return;
        }

        const log = await prisma.sleepLog.findUnique({ where: { id: id as string } });

        if (!log) {
            res.status(404).json({ message: 'Sleep log not found' });
            return;
        }

        if (log.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.sleepLog.delete({ where: { id: id as string } });
        res.json({ message: 'Sleep log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sleep log', error });
    }
};
