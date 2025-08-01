/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            ref: true,
            svgo: false,
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
