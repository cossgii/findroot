import 'dotenv/config';
import { PrismaClient, PlaceCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create a test user
  const hashedPassword = await bcrypt.hash('test1234!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test3@test.com' },
    update: {},
    create: {
      email: 'test3@test.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.name} (ID: ${user.id})`);

  // 2. Create some places associated with the user
  const placesData = [
    {
      name: '강남역 맛집',
      latitude: 37.4979,
      longitude: 127.0276,
      address: '서울특별시 강남구 강남대로',
      description: '강남역 근처의 맛있는 식당입니다.',
      category: PlaceCategory.MEAL, // Changed to Enum
      creatorId: user.id,
    },
    {
      name: '홍대입구역 카페',
      latitude: 37.5569,
      longitude: 126.9239,
      address: '서울특별시 마포구 양화로',
      description: '분위기 좋은 홍대 카페입니다.',
      category: PlaceCategory.DRINK, // Changed to Enum
      creatorId: user.id,
    },
    {
      name: '이태원 펍',
      latitude: 37.5345,
      longitude: 126.9941,
      address: '서울특별시 용산구 이태원로',
      description: '이태원에서 즐기는 신나는 펍!',
      category: PlaceCategory.MEAL, // Changed to Enum
      creatorId: user.id,
    },
    {
      name: '강남역 또 다른 맛집',
      latitude: 37.4985,
      longitude: 127.028,
      address: '서울특별시 강남구 테헤란로',
      description: '강남역의 숨겨진 맛집.',
      category: PlaceCategory.MEAL, // Changed to Enum
      creatorId: user.id,
    },
  ];

  for (const data of placesData) {
    const place = await prisma.place.create({
      data,
    });
    console.log(`Created place: ${place.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
