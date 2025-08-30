import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('시드 데이터 생성 시작...');

  // 기존 데이터 삭제
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.package.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // 사용자 생성
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@rsvshop.com',
      password: 'admin123',
      name: '관리자',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: 'user123',
      name: '홍길동',
      role: 'USER',
    },
  });

  // 객실 생성
  const room1 = await prisma.room.create({
    data: {
      name: '디럭스 더블',
      description: '2명 수용 가능한 디럭스 더블룸',
      capacity: 2,
      imageUrl: 'https://example.com/room1.jpg',
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: '스위트',
      description: '4명 수용 가능한 프리미엄 스위트',
      capacity: 4,
      imageUrl: 'https://example.com/room2.jpg',
    },
  });

  // 패키지 생성
  const package1 = await prisma.package.create({
    data: {
      name: '조식 패키지',
      description: '아침 식사 포함',
      price: 15000,
      roomId: room1.id,
    },
  });

  const package2 = await prisma.package.create({
    data: {
      name: '스파 패키지',
      description: '스파 서비스 포함',
      price: 50000,
      roomId: room2.id,
    },
  });

  // 인벤토리 생성
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    await prisma.inventory.create({
      data: {
        date: date,
        roomId: room1.id,
        totalCount: 10,
        bookedCount: Math.floor(Math.random() * 5),
      },
    });

    await prisma.inventory.create({
      data: {
        date: date,
        roomId: room2.id,
        totalCount: 5,
        bookedCount: Math.floor(Math.random() * 3),
      },
    });
  }

  console.log('시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 