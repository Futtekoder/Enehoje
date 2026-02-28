import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const user = await prisma.user.upsert({
            where: { email: 'admin@enehoje.dk' },
            update: {
                role: 'SYSTEM_ADMIN',
                status: 'APPROVED',
                password: 'password123'
            },
            create: {
                email: 'admin@enehoje.dk',
                name: 'System Admin',
                role: 'SYSTEM_ADMIN',
                status: 'APPROVED',
                password: 'password123'
            }
        });

        // Also ensure share sequences exist if the previous script silently failed
        const seqCount = await prisma.shareSequenceItem.count();
        if (seqCount === 0) {
            const updates = [
                { name: 'Andel FK', code: 'FK' },
                { name: 'Andel HT', code: 'HT' },
                { name: 'Andel OT', code: 'OT' },
                { name: 'Andel KP', code: 'KP' },
                { name: 'Andel AF', code: 'AF' }
            ];

            // set codes
            for (const update of updates) {
                const share = await prisma.share.findFirst({ where: { name: update.name } });
                if (share) {
                    await prisma.share.update({
                        where: { id: share.id },
                        data: { code: update.code }
                    });
                }
            }

            // create sequence
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
        }

        return NextResponse.json({ success: true, message: "Admin and seeds setup", user });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
