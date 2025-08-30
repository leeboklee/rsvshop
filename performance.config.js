/**
 * RSVShop 성능 최적화 설정
 * 페이지 로드 속도 향상을 위한 설정들
 */

module.exports = {
  // Next.js 성능 최적화
  next: {
    // 개발 모드 최적화
    development: {
      // 빠른 새로고침 활성화
      fastRefresh: true,
      // 소스맵 비활성화 (빠른 빌드)
      sourceMaps: false,
      // 번들 분석 비활성화
      bundleAnalyzer: false,
      // 실험적 기능 최소화
      experimental: false,
    },
    
    // 웹팩 최적화
    webpack: {
      // 개발 모드에서 번들 최적화
      devOptimization: {
        minimize: false,
        splitChunks: false,
        removeEmptyChunks: false,
      },
      
      // 로더 최적화
      loaderOptimization: {
        babelCache: true,
        babelCompact: false,
        babelPresets: ['@babel/preset-env', '@babel/preset-react'],
      },
      
      // 파일 감시 최적화
      watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      },
    },
  },
  
  // Nodemon 성능 최적화
  nodemon: {
    // 감시 지연 시간 단축
    delay: 500,
    // 감시 스로틀링 최적화
    watchThrottle: 50,
    // 메모리 사용량 최적화
    memoryLimit: 1024,
  },
  
  // Node.js 성능 최적화
  node: {
    // 메모리 제한
    maxOldSpaceSize: 1024,
    maxSemiSpaceSize: 128,
    
    // 가비지 컬렉션 최적화
    gc: {
      // 개발 모드에서 GC 비활성화
      development: false,
      // 프로덕션에서 GC 최적화
      production: true,
    },
  },
  
  // 개발 서버 최적화
  devServer: {
    // 포트 설정
    port: 4900,
    
    // 호스트 설정
    host: '0.0.0.0',
    
    // HTTPS 설정 (필요시)
    https: false,
    
    // 압축 설정
    compress: true,
    
    // 핫 리로드 최적화
    hotReload: {
      enabled: true,
      interval: 1000,
      timeout: 5000,
    },
  },
  
  // 캐시 최적화
  cache: {
    // Next.js 캐시
    next: {
      enabled: true,
      maxAge: 3600,
      directory: '.next/cache',
    },
    
    // Babel 캐시
    babel: {
      enabled: true,
      directory: 'node_modules/.cache/babel-loader',
    },
    
    // 웹팩 캐시
    webpack: {
      enabled: true,
      directory: 'node_modules/.cache/webpack',
    },
  },
  
  // 번들 최적화
  bundle: {
    // 청크 분할 최적화
    chunks: {
      // 개발 모드에서 청크 분할 비활성화
      development: false,
      // 프로덕션에서 청크 분할 활성화
      production: true,
    },
    
    // 트리 쉐이킹
    treeShaking: {
      // 개발 모드에서 트리 쉐이킹 비활성화
      development: false,
      // 프로덕션에서 트리 쉐이킹 활성화
      production: true,
    },
  },
};
