/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enables static export mode
  trailingSlash: true, // Ensures proper routing for static pages
};

module.exports = nextConfig;
