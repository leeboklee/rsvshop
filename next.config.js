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
  
  // 성능 최적화 설정
  swcMinify: true,
  
  // 실험적 기능으로 성능 향상
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 이미지 최적화
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  

  
  // Cross Origin 허용 설정 (개발 환경)
  allowedDevOrigins: [
    '172.19.254.74',
    'localhost',
    '127.0.0.1'
  ],
  
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
      config.devtool = 'eval-cheap-module-source-map';
      
      // 개발 모드에서 번들 분석 비활성화
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
      
      // 캐시 최적화 (개발 모드에서는 비활성화)
      // config.cache = {
      //   type: 'filesystem',
      //   buildDependencies: {
      //     config: [__filename],
      //   },
      //   cacheDirectory: require('path').resolve(__dirname, '.next/cache/webpack'),
      // };
      
      // 모듈 해결 최적화
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@': require('path').resolve(__dirname, './'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      };
      
      // 로더 최적화는 Next.js 기본 설정 사용
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
