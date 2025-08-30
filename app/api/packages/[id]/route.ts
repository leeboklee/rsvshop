import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;

    // 패키지 삭제
    await prisma.package.delete({
      where: { id: packageId },
    });

    return NextResponse.json({ message: '패키지가 삭제되었습니다.' });
  } catch (error) {
    console.error('패키지 삭제 실패:', error);
    return NextResponse.json(
      { error: '패키지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 