const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({
        where: { role: 'SYSTEM_ADMIN' }
    })

    if (!user) {
        console.error("No admin user found")
        return
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 14) // 2 weeks from now
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 2) // Weekend

    const event = await prisma.event.create({
        data: {
            title: "Forårs-klargøring (Test)",
            type: "WORK_WEEKEND",
            scope: "ALL_MEMBERS",
            startAt: startDate,
            endAt: endDate,
            createdByUserId: user.id,
            description: "Den årlige forårs-klargøring. Vi skal have bådene i vandet, malet vinduerne i hovedhuset, og gjort klar til sæsonen.",

            tasks: {
                create: [
                    {
                        title: "Klargøring af Traktor",
                        category: "MAINTENANCE",
                        criticality: "HIGH",
                        status: "APPROVED",
                        createdByUserId: user.id
                    },
                    {
                        title: "Indkøb til fælles middag Lørdag",
                        category: "SHOPPING",
                        criticality: "MEDIUM",
                        status: "PROPOSED",
                        createdByUserId: user.id
                    }
                ]
            }
        }
    })

    console.log("Seeded test event:", event.id)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
