import { NextRequest, NextResponse } from 'next/server';
import { createApiKey, revokeApiKey, listApiKeys } from '@/app/lib/apiKeyAuth';

// GET: API 키 목록 조회
export async function GET(request: NextRequest) {
  try {
    const apiKeys = listApiKeys();
    return NextResponse.json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error('API 키 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: 'API 키 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새로운 API 키 생성
export async function POST(request: NextRequest) {
  try {
    const { name, permissions } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'API 키 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const apiKey = createApiKey(name, permissions || ['reservations.read']);
    
    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // 생성 시에만 키 값 반환
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      },
      message: 'API 키가 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('API 키 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: 'API 키 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: API 키 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '삭제할 API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const success = revokeApiKey(apiKey);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'API 키가 성공적으로 삭제되었습니다.',
      });
    } else {
      return NextResponse.json(
        { success: false, error: '해당 API 키를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API 키 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: 'API 키 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 