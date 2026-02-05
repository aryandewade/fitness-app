import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import workoutRoutes from './routes/workoutRoutes';
import runRoutes from './routes/runRoutes';
import sleepRoutes from './routes/sleepRoutes';
import weightRoutes from './routes/weightRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Fitness Tracker API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
