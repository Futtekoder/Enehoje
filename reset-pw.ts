import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPasswords() {
    const newPassword = await bcrypt.hash('Enehoje2026', 10)

    const res = await prisma.user.updateMany({
        where: {
            email: {
                in: ['s.scagensstierne@gmail.com', 'sbs@byggeri']
            }
        },
        data: {
            password: newPassword
        }
    })
    console.log(`Passwords reset to Enehoje2026 for ${res.count} users.`)
}

resetPasswords().catch(e => {
    console.error(e)
}).finally(() => {
    prisma.$disconnect()
})
