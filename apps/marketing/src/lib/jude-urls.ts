export const JUDE_DEMO_URL =
  process.env.NEXT_PUBLIC_JUDE_DEMO_URL ||
  (process.env.NODE_ENV === "production" ? "https://jude.one" : "http://localhost:3002");
