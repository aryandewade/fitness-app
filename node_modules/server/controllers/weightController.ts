import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getWeightLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const logs = await prisma.weightLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weight logs', error });
    }
};

export const logWeight = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { date, weight, bodyFat } = req.body;

        const log = await prisma.weightLog.create({
            data: {
                userId,
                date: new Date(date),
                weight: parseFloat(weight),
                bodyFat: bodyFat ? parseFloat(bodyFat) : null
            }
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Error logging weight', error });
    }
};

export const deleteWeightLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: 'Missing weight log ID' });
            return;
        }

        const log = await prisma.weightLog.findUnique({ where: { id: id as string } });

        if (!log) {
            res.status(404).json({ message: 'Weight log not found' });
            return;
        }

        if (log.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.weightLog.delete({ where: { id: id as string } });
        res.json({ message: 'Weight log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting weight log', error });
    }
};
