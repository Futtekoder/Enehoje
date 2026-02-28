import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB setup...");

    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@enehoje.dk' },
        update: {
            role: 'SYSTEM_ADMIN',
            status: 'APPROVED',
            password: hashedPassword
        },
        create: {
            email: 'admin@enehoje.dk',
            name: 'System Admin',
            role: 'SYSTEM_ADMIN',
            status: 'APPROVED',
            password: hashedPassword
        }
    });

    console.log("Admin OK");

    const seqCount = await prisma.shareSequenceItem.count();
    if (seqCount === 0) {
        console.log("Generating default Share Sequences...");
        const updates = [
            { name: 'Andel FK', code: 'FK' },
            { name: 'Andel HT', code: 'HT' },
            { name: 'Andel OT', code: 'OT' },
            { name: 'Andel KP', code: 'KP' },
            { name: 'Andel AF', code: 'AF' }
        ];

        for (const update of updates) {
            const share = await prisma.share.findFirst({ where: { name: update.name } });
            if (share) {
                await prisma.share.update({
                    where: { id: share.id },
                    data: { code: update.code }
                });
            }
        }

        for (let i = 0; i < updates.length; i++) {
            const share = await prisma.share.findFirst({ where: { code: updates[i].code } });
            if (share) {
                await prisma.shareSequenceItem.create({
                    data: { position: i, shareId: share.id }
                });
            }
        }

        await prisma.calendarSettings.create({
            data: { anchorShareIndex: 0 }
        });
        console.log("Sequences OK");
    }

    console.log("Success!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
