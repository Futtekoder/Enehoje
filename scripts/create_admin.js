const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
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
            password: 'password123' // Simple text compare per previous codebase config
        }
    });
    console.log("Admin user created/updated successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
