/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // TypeScript 검사 비활성화 (개발 속도 향상)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 검사 비활성화 (개발 속도 향상)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 프로덕션 소스맵 비활성화
  productionBrowserSourceMaps: false,
  
  // 압축 활성화
  compress: true,
  
  // 이미지 최적화
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
