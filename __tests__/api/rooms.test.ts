import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/rooms/route';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    room: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('/api/rooms', () => {
  describe('GET', () => {
    it('should return rooms list', async () => {
      const { req } = createMocks({ method: 'GET' });
      
      const mockRooms = [
        {
          id: '1',
          name: 'Test Room',
          description: 'Test Description',
          capacity: 2,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          packages: [],
        },
      ];

      // Mock Prisma response
      require('@prisma/client').PrismaClient.mockImplementation(() => ({
        room: {
          findMany: jest.fn().mockResolvedValue(mockRooms),
        },
      }));

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRooms);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
    });

    it('should handle database errors', async () => {
      const { req } = createMocks({ method: 'GET' });

      // Mock Prisma error
      require('@prisma/client').PrismaClient.mockImplementation(() => ({
        room: {
          findMany: jest.fn().mockRejectedValue(new Error('DB Error')),
        },
      }));

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('객실 목록을 불러오는데 실패했습니다.');
    });
  });

  describe('POST', () => {
    it('should create a new room', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New Room',
          description: 'New Description',
          capacity: '2',
          imageUrl: 'test.jpg',
          isPublic: true,
        },
      });

      const mockRoom = {
        id: '1',
        name: 'New Room',
        description: 'New Description',
        capacity: 2,
        imageUrl: 'test.jpg',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma response
      require('@prisma/client').PrismaClient.mockImplementation(() => ({
        room: {
          create: jest.fn().mockResolvedValue(mockRoom),
        },
      }));

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRoom);
      expect(data.message).toBe('객실이 성공적으로 생성되었습니다.');
    });

    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '',
          description: 'Description',
          capacity: '2',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('필수 필드가 누락되었습니다.');
    });
  });
});