/** @type {import('next').NextConfig} */
const nextConfig = {
  // 5990 포트 전용 설정
  experimental: {
    appDir: true,
  },
  
  // Webpack 최적화
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  // 이미지 최적화
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // 환경 변수
  env: {
    CUSTOMER_PORT: '5990',
    ADMIN_PORT: '4900',
  },
};

module.exports = nextConfig;
