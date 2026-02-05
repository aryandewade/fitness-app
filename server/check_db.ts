
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Attempting to connect to database...')
        const userCount = await prisma.user.count()
        console.log(`Connection successful. User count: ${userCount}`)

        // Check if new tables exist by counting them
        const workoutCount = await prisma.workout.count()
        console.log(`Workout count: ${workoutCount}`)

    } catch (e) {
        console.error('Connection failed:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
