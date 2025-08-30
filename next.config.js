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
  
  // 실험적 기능 최소화 (개발 안정성 우선)
  experimental: {
    // turbo: false, // 이 설정 제거
  },
  
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    // 개발 모드에서만 적용되는 최적화
    if (dev) {
      // HMR 최적화
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // 소스맵 최적화 (빠른 로딩)
      config.devtool = 'eval-source-map';
      
      // 개발 모드에서 번들 분석 비활성화
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    
    // 개발 서버에서 커스텀 청크 분할 비활성화 (ESM/CJS 충돌 회피)
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    
    // 로더 최적화
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
            oneOfRule.options = {
              ...oneOfRule.options,
              // Babel 캐시 활성화
              cacheDirectory: true,
              // 빠른 모드 활성화
              compact: false,
              // 불필요한 변환 비활성화
              presets: [
                ['@babel/preset-env', { 
                  targets: { node: 'current' },
                  modules: false 
                }],
                '@babel/preset-react'
              ],
            };
          }
        });
      }
    });
    
    // 개발 모드에서 파일 감시 최적화
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    
    return config;
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
 
  // `/customer`는 고객용 예약 페이지이므로 관리자 경로와 매핑하지 않음
};

module.exports = nextConfig;
