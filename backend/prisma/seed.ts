import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
  const responderHashedPassword = await bcrypt.hash('Responder123!', 10);
  const userHashedPassword = await bcrypt.hash('User12345!', 10);

  // 1. Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Commander Admin',
      role: 'ADMIN',
      password: adminHashedPassword,
    },
    create: {
      name: 'System Commander Admin',
      email: adminEmail,
      phone: '+1-800-555-0199',
      password: adminHashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Upsert Responders
  const responder1 = await prisma.user.upsert({
    where: { email: 'responder1@disaster.gov' },
    update: { role: 'RESPONDER' },
    create: {
      name: 'Captain Alex Vance (Search & Rescue)',
      email: 'responder1@disaster.gov',
      phone: '+1-800-555-0210',
      password: responderHashedPassword,
      role: 'RESPONDER',
    },
  });

  const responder2 = await prisma.user.upsert({
    where: { email: 'responder2@disaster.gov' },
    update: { role: 'RESPONDER' },
    create: {
      name: 'Dr. Elena Rostova (Medical Response)',
      email: 'responder2@disaster.gov',
      phone: '+1-800-555-0211',
      password: responderHashedPassword,
      role: 'RESPONDER',
    },
  });

  // 3. Upsert Standard User
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'user@example.com',
      phone: '+1-800-555-0322',
      password: userHashedPassword,
      role: 'USER',
    },
  });

  console.log('✅ Users seeded:');
  console.log(` - Admin: ${admin.email}`);
  console.log(` - Responder 1: ${responder1.email}`);
  console.log(` - Responder 2: ${responder2.email}`);
  console.log(` - User: ${normalUser.email}`);

  // 4. Seed Shelters
  await prisma.shelter.deleteMany();
  const shelter1 = await prisma.shelter.create({
    data: {
      name: 'Central Emergency Arena Shelter',
      location: '100 Stadium Way, Downtown City',
      latitude: 37.7749,
      longitude: -122.4194,
      capacity: 500,
      currentOccupancy: 120,
      contactNumber: '+1-800-555-9001',
      status: 'OPEN',
    },
  });

  const shelter2 = await prisma.shelter.create({
    data: {
      name: 'Northside High Community Center',
      location: '450 School District Rd, North District',
      latitude: 37.7833,
      longitude: -122.4167,
      capacity: 250,
      currentOccupancy: 235,
      contactNumber: '+1-800-555-9002',
      status: 'OPEN',
    },
  });

  const shelter3 = await prisma.shelter.create({
    data: {
      name: 'Harbor Light Medical & Relief Station',
      location: '12 Marina Blvd, Coastline Harbor',
      latitude: 37.8083,
      longitude: -122.4100,
      capacity: 150,
      currentOccupancy: 150,
      contactNumber: '+1-800-555-9003',
      status: 'FULL',
    },
  });

  console.log('✅ Shelters seeded');

  // 5. Seed Relief Resources
  await prisma.reliefResource.deleteMany();
  await prisma.reliefResource.createMany({
    data: [
      {
        name: 'Emergency Mineral Water',
        category: 'Water',
        quantity: 4500,
        unit: 'liters',
        location: 'Central Depot Warehouse A',
        status: 'AVAILABLE',
      },
      {
        name: 'Ready-to-Eat Food Packs (MRE)',
        category: 'Food',
        quantity: 3200,
        unit: 'packs',
        location: 'Central Depot Warehouse A',
        status: 'AVAILABLE',
      },
      {
        name: 'Trauma & First Aid Medical Kits',
        category: 'Medicine',
        quantity: 150,
        unit: 'boxes',
        location: 'Harbor Medical Station',
        status: 'LOW',
      },
      {
        name: 'Thermal Fleece Blankets',
        category: 'Blankets',
        quantity: 1200,
        unit: 'units',
        location: 'Northside School Depot',
        status: 'AVAILABLE',
      },
      {
        name: 'Emergency Inflatable Life Vests',
        category: 'Emergency Kits',
        quantity: 400,
        unit: 'units',
        location: 'Coastline Harbor Station',
        status: 'AVAILABLE',
      },
      {
        name: 'Insulated Tents (4-Person)',
        category: 'Emergency Kits',
        quantity: 15,
        unit: 'units',
        location: 'Central Depot Warehouse B',
        status: 'OUT_OF_STOCK',
      },
    ],
  });

  console.log('✅ Relief Resources seeded');

  // 6. Seed Disasters & Reports
  await prisma.responseAssignment.deleteMany();
  await prisma.disasterReport.deleteMany();
  await prisma.disaster.deleteMany();

  const disaster1 = await prisma.disaster.create({
    data: {
      title: 'Flash Flood in River Valley Sector 4',
      description: 'Sudden heavy torrential rainfall caused severe flash flooding up to 4 feet deep. Multiple families trapped on rooftops.',
      type: 'Flood',
      severity: 'Critical',
      location: 'River Valley Sector 4, Eastside',
      latitude: 37.7695,
      longitude: -122.4270,
      status: 'Active',
      reportedById: normalUser.id,
    },
  });

  const disaster2 = await prisma.disaster.create({
    data: {
      title: 'Substation Electrical Fire',
      description: 'Transformer explosion led to structural fire near commercial district. Smoke plume extending west.',
      type: 'Fire',
      severity: 'High',
      location: 'Industrial Park Block 12',
      latitude: 37.7510,
      longitude: -122.4050,
      status: 'Verified',
      reportedById: normalUser.id,
    },
  });

  const disaster3 = await prisma.disaster.create({
    data: {
      title: 'Minor Earthquake Tremor & Landslide Alert',
      description: 'Magnitude 4.8 seismic tremor reported along coastal ridge. Minor debris falling on highway.',
      type: 'Earthquake',
      severity: 'Medium',
      location: 'Coastal Highway Ridge KM 14',
      latitude: 37.8200,
      longitude: -122.4780,
      status: 'Pending',
      reportedById: normalUser.id,
    },
  });

  console.log('✅ Disasters seeded');

  // Seed Disaster Reports
  await prisma.disasterReport.create({
    data: {
      disasterId: disaster1.id,
      userId: normalUser.id,
      description: 'Water level rising quickly in residential neighborhood. Need immediate boat evacuation support.',
      location: 'River Valley Sector 4, Eastside',
      latitude: 37.7695,
      longitude: -122.4270,
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      status: 'Verified',
    },
  });

  // Seed Response Assignment
  await prisma.responseAssignment.create({
    data: {
      disasterId: disaster1.id,
      responderId: responder1.id,
      status: 'In Progress',
      notes: 'Deployed 2 rescue boat squads and medical personnel. 45 citizens evacuated to Central Emergency Arena Shelter.',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
