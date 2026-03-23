/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
};

module.exports = nextConfig;