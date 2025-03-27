const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  
  // Hash passwords first
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create tables
  await prisma.table.create({
    data: { tableNumber: 1, capacity: 4, isDivisible: false, tableType: 'normal', splitStatus: null }
  });

  await prisma.table.create({
    data: { tableNumber: 2, capacity: 6, isDivisible: true, tableType: 'business', splitStatus: null }
  });

  await prisma.table.create({
    data: { tableNumber: 3, capacity: 8, isDivisible: true, tableType: 'dinner', splitStatus: null }
  });

  await prisma.table.create({
    data: { tableNumber: 4, capacity: 2, isDivisible: false, tableType: 'normal', splitStatus: null }
  });

  await prisma.table.create({
    data: { tableNumber: 5, capacity: 4, isDivisible: false, tableType: 'business', splitStatus: null }
  });

  // Create users
  const superAdmin = await prisma.users.create({
    data: {
      username: 'superadmin_main',
      password: hashedPassword,
      email: 'superadmin_main@elmanzah.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN'
    }
  });

  const admin = await prisma.users.create({
    data: {
      username: 'admin_main',
      password: adminPassword,
      email: 'admin_main@elmanzah.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  console.log('Successfully seeded tables and users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });