declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_BACKEND_URL: string;
    NODE_ENV: "development" | "production" | "test";
    JWT_SECRET: string;
    NEXT_PUBLIC_OAUTH_CLIENT_ID: string;
    NEXT_PUBLIC_OAUTH_REDIRECT_URL: string;

    // Tambahkan env variables lain yang dibutuhkan
  }
}
