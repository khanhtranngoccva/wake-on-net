declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      BACKEND_HTTP_URL: string;
      BACKEND_WS_URL: string;
    }
  }
}

export {};
