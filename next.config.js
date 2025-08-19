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
    domains: ['example.com', 'rsvshop.local'],
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

  // 개발 환경에서 HTTP → HTTPS 자동 리다이렉트
  async redirects() {
    // 개발 환경에서만 HTTPS 리다이렉트 활성화
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_DEV_HTTPS === 'true') {
      return [
        // localhost HTTP → HTTPS 리다이렉트
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://localhost:4900/:path*',
          permanent: false,
        },
        // rsvshop.local HTTP → HTTPS 리다이렉트
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://rsvshop.local:4900/:path*',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
