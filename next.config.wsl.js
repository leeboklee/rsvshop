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
  
  // WSL2 환경 최적화
  experimental: {
    // WSL2에서 안정적인 기능들만 활성화
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // 웹팩 최적화 (WSL2 환경 고려)
  webpack: (config, { dev, isServer }) => {
    // 개발 모드에서만 적용되는 최적화
    if (dev) {
      // WSL2에서 안정적인 HMR 설정
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // WSL2에서 빠른 소스맵
      config.devtool = 'eval-cheap-module-source-map';
      
      // 개발 모드에서 번들 분석 비활성화
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    
    // WSL2에서 안정적인 서버 설정
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    
    // WSL2에서 안정적인 로더 설정
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
            oneOfRule.options = {
              ...oneOfRule.options,
              // WSL2에서 안정적인 Babel 설정
              cacheDirectory: true,
              compact: false,
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
    
    // WSL2에서 안정적인 파일 감시 설정
    if (dev) {
      config.watchOptions = {
        // WSL2에서 안정적인 폴링 설정
        poll: 2000,
        aggregateTimeout: 500,
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/logs', '**/test-results'],
      };
    }
    
    return config;
  },
  
  // WSL2 환경 헤더 설정
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
          // WSL2 환경 최적화 헤더
          {
            key: 'X-WSL-Optimized',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
