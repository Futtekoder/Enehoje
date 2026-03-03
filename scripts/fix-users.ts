import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log("Fixing all users...")

    // 1. Get all users
    const users = await prisma.user.findMany()

    // 2. Hash a new password
    const hashedPassword = await bcrypt.hash("12341234", 10)

    // 3. Update all users to APPROVED and set password to 12341234
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                status: "APPROVED"
            }
        })
        console.log(`Updated user ${user.email} (Status: APPROVED, Password: 12341234)`)
    }

    // Also explicitly ensure s.scagensstierne@gmail.com exists since we want to test with it
    const sebastian = await prisma.user.findUnique({
        where: { email: "s.scagensstierne@gmail.com" }
    });

    if (!sebastian) {
        // Find a share to attach him to
        const share = await prisma.share.findFirst();
        if (share) {
            await prisma.user.create({
                data: {
                    email: "s.scagensstierne@gmail.com",
                    name: "Sebastian Scagensstierne",
                    password: hashedPassword,
                    role: "SYSTEM_ADMIN",
                    status: "APPROVED",
                    shareId: share.id
                }
            })
            console.log("Created test admin user: s.scagensstierne@gmail.com")
        }
    } else {
        await prisma.user.update({
            where: { email: "s.scagensstierne@gmail.com" },
            data: {
                role: "SYSTEM_ADMIN",
                status: "APPROVED",
                password: hashedPassword
            }
        })
        console.log("Ensured s.scagensstierne@gmail.com is SYSTEM_ADMIN and APPROVED")
    }

    console.log('Done fixing users.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
