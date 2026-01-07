/**
 * GitHub Pages serves this site from a subpath: /TrustFundMe-FE/
 * So we must prefix all assets and routes with the repo name.
 *
 * If you ever change the repo name, update `repo` below.
 */
const repo = "TrustFundMe-FE";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
