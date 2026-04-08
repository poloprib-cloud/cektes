/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PRIVATE_API_URL
  ? new URL(process.env.NEXT_PRIVATE_API_URL).hostname
  : null;

const nextConfig = {
  poweredByHeader: false,

  images: {
    domains: [
      "127.0.0.1",
      "localhost",
      "assets.tripay.co.id",
      "tripay.co.id",
      "assets.tokopay.id",
      "paydisini.co.id",
      "api.qrispy.id",
      "api.dompetx.com",
      "api.kallpolostore.id",
      ...(apiUrl ? [apiUrl] : []),
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Powered-By", value: "Kallpolo" },
        ],
      },
    ];
  },
};

export default nextConfig;
