const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@enehoje.dk' } }).then(u => { console.log(JSON.stringify(u)); prisma.$disconnect(); });
