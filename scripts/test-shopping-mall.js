const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testShoppingMall() {
  try {
    console.log('=== 쇼핑몰 API 테스트 시작 ===');
    
    // 1. 데이터베이스 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 데이터베이스 연결 성공');
    
    // 2. ShoppingMall 테이블 존재 확인
    console.log('2. ShoppingMall 테이블 확인...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'ShoppingMall'
    `;
    console.log('테이블 목록:', tables);
    
    if (tables.length === 0) {
      console.log('❌ ShoppingMall 테이블이 존재하지 않습니다.');
      console.log('스키마 마이그레이션을 실행하세요: npx prisma db push');
      return;
    }
    
    // 3. 기존 쇼핑몰 조회
    console.log('3. 기존 쇼핑몰 조회...');
    const existingMalls = await prisma.shoppingMall.findMany();
    console.log('기존 쇼핑몰:', existingMalls);
    
    // 4. 새 쇼핑몰 생성 테스트
    console.log('4. 새 쇼핑몰 생성 테스트...');
    const newMall = await prisma.shoppingMall.create({
      data: {
        name: '테스트 쇼핑몰',
        commissionRate: 5.0,
        description: '테스트용 쇼핑몰입니다.'
      }
    });
    console.log('✅ 새 쇼핑몰 생성 성공:', newMall);
    
    // 5. 생성된 쇼핑몰 조회
    console.log('5. 생성된 쇼핑몰 조회...');
    const createdMall = await prisma.shoppingMall.findUnique({
      where: { id: newMall.id }
    });
    console.log('조회된 쇼핑몰:', createdMall);
    
    // 6. 테스트 데이터 삭제
    console.log('6. 테스트 데이터 삭제...');
    await prisma.shoppingMall.delete({
      where: { id: newMall.id }
    });
    console.log('✅ 테스트 데이터 삭제 완료');
    
    console.log('=== 모든 테스트 성공! ===');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    console.error('오류 상세:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 해결방법: 쇼핑몰명이 중복되었습니다.');
    } else if (error.code === 'P2025') {
      console.log('💡 해결방법: 레코드를 찾을 수 없습니다.');
    } else if (error.code === 'P1001') {
      console.log('💡 해결방법: 데이터베이스 연결에 실패했습니다.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testShoppingMall(); 