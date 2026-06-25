import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy top-level page consolidated into the canonical /resources/* path
      // the site's navigation links to. 308 (permanent) so search engines
      // transfer ranking signals to the canonical URL.
      {
        source: "/rent-vs-sell",
        destination: "/resources/rent-vs-sell",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
