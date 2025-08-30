import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: '객실을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('객실 조회 실패:', error);
    return NextResponse.json(
      { error: '객실 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    // 객실 삭제
    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json({ message: '객실이 삭제되었습니다.' });
  } catch (error) {
    console.error('객실 삭제 실패:', error);
    return NextResponse.json(
      { error: '객실 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 