import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const sequence = await prisma.shareSequenceItem.findMany({
            orderBy: { position: 'asc' },
            include: { share: true } // Ensure share info is sent
        });
        return NextResponse.json(sequence);
    } catch (error) {
        console.error("Failed to fetch sequence", error);
        return NextResponse.json({ error: "Failed to fetch sequence" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sequenceIds } = body;

        if (!Array.isArray(sequenceIds)) {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }

        // Extremely simple atomic replacement
        await prisma.$transaction(async (tx) => {
            await tx.shareSequenceItem.deleteMany({});
            for (let i = 0; i < sequenceIds.length; i++) {
                await tx.shareSequenceItem.create({
                    data: {
                        position: i,
                        shareId: sequenceIds[i]
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update sequence", error);
        return NextResponse.json({ error: "Failed to update sequence" }, { status: 500 });
    }
}
