import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// API 키 관리 인터페이스
interface ApiKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

// 메모리 기반 API 키 저장소 (실제 운영에서는 데이터베이스 사용 권장)
const apiKeys: Map<string, ApiKey> = new Map();

// 기본 API 키 생성 (개발용)
const generateDefaultApiKey = () => {
  const key = crypto.randomBytes(32).toString('hex');
  const defaultKey: ApiKey = {
    id: 'default',
    key,
    name: '기본 API 키',
    permissions: ['reservations.read', 'reservations.write', 'rooms.read', 'packages.read'],
    isActive: true,
    createdAt: new Date(),
  };
  apiKeys.set(key, defaultKey);
  return key;
};

// API 키 검증 함수
export const validateApiKey = (apiKey: string): ApiKey | null => {
  const key = apiKeys.get(apiKey);
  if (!key || !key.isActive) {
    return null;
  }
  
  // 마지막 사용 시간 업데이트
  key.lastUsed = new Date();
  return key;
};

// 권한 검증 함수
export const hasPermission = (apiKey: ApiKey, permission: string): boolean => {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*');
};

// API 키 미들웨어
export const withApiKeyAuth = (
  handler: (request: NextRequest, apiKey: ApiKey) => Promise<NextResponse>,
  requiredPermissions: string[] = []
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // API 키 추출
      const authHeader = request.headers.get('authorization');
      const apiKey = authHeader?.replace('Bearer ', '') || 
                    request.nextUrl.searchParams.get('apiKey');

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API 키가 필요합니다.' },
          { status: 401 }
        );
      }

      // API 키 검증
      const validKey = validateApiKey(apiKey);
      if (!validKey) {
        return NextResponse.json(
          { error: '유효하지 않은 API 키입니다.' },
          { status: 401 }
        );
      }

      // 권한 검증
      for (const permission of requiredPermissions) {
        if (!hasPermission(validKey, permission)) {
          return NextResponse.json(
            { error: `권한이 없습니다: ${permission}` },
            { status: 403 }
          );
        }
      }

      // 핸들러 실행
      return await handler(request, validKey);
    } catch (error) {
      console.error('API 키 인증 오류:', error);
      return NextResponse.json(
        { error: '인증 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  };
};

// API 키 관리 함수들
export const createApiKey = (name: string, permissions: string[]): ApiKey => {
  const key = crypto.randomBytes(32).toString('hex');
  const apiKey: ApiKey = {
    id: crypto.randomUUID(),
    key,
    name,
    permissions,
    isActive: true,
    createdAt: new Date(),
  };
  apiKeys.set(key, apiKey);
  return apiKey;
};

export const revokeApiKey = (apiKey: string): boolean => {
  const key = apiKeys.get(apiKey);
  if (key) {
    key.isActive = false;
    return true;
  }
  return false;
};

export const listApiKeys = (): Omit<ApiKey, 'key'>[] => {
  return Array.from(apiKeys.values()).map(({ key, ...rest }) => rest);
};

// 기본 API 키 초기화
const defaultKey = generateDefaultApiKey();
console.log('기본 API 키 생성됨:', defaultKey); 