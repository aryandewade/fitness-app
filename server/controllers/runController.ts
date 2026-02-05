import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getRuns = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const runs = await prisma.run.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(runs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching runs', error });
    }
};

export const logRun = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { date, distance, duration } = req.body;

        // Calculate pace (minutes per km/mile) if not provided, or frontend can send it.
        // Assuming simple calculation: duration / distance
        const pace = distance > 0 ? duration / distance : 0;

        const run = await prisma.run.create({
            data: {
                userId,
                date: new Date(date),
                distance: parseFloat(distance),
                duration: parseInt(duration),
                pace
            }
        });

        res.status(201).json(run);
    } catch (error) {
        res.status(500).json({ message: 'Error logging run', error });
    }
};

export const deleteRun = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: 'Missing run ID' });
            return;
        }

        const run = await prisma.run.findUnique({ where: { id: id as string } });

        if (!run) {
            res.status(404).json({ message: 'Run not found' });
            return;
        }

        if (run.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.run.delete({ where: { id: id as string } });
        res.json({ message: 'Run deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting run', error });
    }
};
