const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { old: 'Andel 1', newName: 'Andel FK' },
    { old: 'Andel 2', newName: 'Andel HT' },
    { old: 'Andel 3', newName: 'Andel OT' },
    { old: 'Andel 4', newName: 'Andel KP' },
    { old: 'Andel 5', newName: 'Andel AF' }
  ];

  for (const update of updates) {
    const share = await prisma.share.findFirst({ where: { name: update.old } });
    if (share) {
      await prisma.share.update({
        where: { id: share.id },
        data: { name: update.newName }
      });
      console.log(`Updated ${update.old} to ${update.newName}`);
    } else {
      console.log(`Could not find ${update.old}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
