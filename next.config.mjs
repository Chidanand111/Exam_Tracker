/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_1cLPkeRG7pEb@ep-late-glade-b5jtr33d-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true",
    DIRECT_URL:
      process.env.DIRECT_URL ||
      "postgresql://neondb_owner:npg_1cLPkeRG7pEb@ep-late-glade-b5jtr33d-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require",
    JWT_SECRET:
      process.env.JWT_SECRET ||
      "bharat-exam-tracker-dev-key-local-only-super-safe",
  },
  images: {
    domains: ["images.unsplash.com", "upload.wikimedia.org"],
  },
};

export default nextConfig;
