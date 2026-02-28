const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
      console.log(`Updated ${update.name} with code ${update.code}`);
    } else {
      console.log(`Could not find ${update.name}`);
    }
  }

  // Create base settings
  const existingSettings = await prisma.calendarSettings.findFirst();
  if (!existingSettings) {
    await prisma.calendarSettings.create({
        data: { anchorShareIndex: 0 }
    });
    console.log("Created CalendarSettings");
  }

  // Create base sequence if missing
  const sequenceCount = await prisma.shareSequenceItem.count();
  if (sequenceCount === 0) {
    // We assume the updates array is the order
    for (let i = 0; i < updates.length; i++) {
        const share = await prisma.share.findFirst({ where: { code: updates[i].code } });
        if (share) {
            await prisma.shareSequenceItem.create({
                data: {
                    position: i,
                    shareId: share.id
                }
            });
            console.log(`Added ${share.code} to sequence position ${i}`);
        }
    }
  }

}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
