import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const shares = [
        { name: 'Andel 1', color: 'bg-red-500' },
        { name: 'Andel 2', color: 'bg-blue-500' },
        { name: 'Andel 3', color: 'bg-green-500' },
        { name: 'Andel 4', color: 'bg-yellow-500' },
        { name: 'Andel 5', color: 'bg-purple-500' },
    ]

    for (let i = 0; i < shares.length; i++) {
        const shareData = shares[i]

        // Create Share
        const share = await prisma.share.create({
            data: shareData,
        })

        // Create a default user for each share
        // Email: andel1@enehoje.dk, Password: password123 (Change immediately!)
        const email = `andel${i + 1}@enehoje.dk`
        await prisma.user.create({
            data: {
                email: email,
                name: `Ejer ${shareData.name}`,
                password: "password123", // In a real app, hash this! (But NextAuth Credentials simple logic we wrote compares strings)
                role: "MEMBER",
                shareId: share.id
            }
        })
        console.log(`Created share ${shareData.name} and user ${email}`)
    }

    console.log('Seeded 5 shares and users')
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
