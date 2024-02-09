declare global {
  namespace Application {
    interface AuthenticationData {
      nodeId: string;
      totp: TotpConfig;
    }

    interface TotpConfig {
      id: string;
      algorithm: string;
      interval: number;
      secret: string;
      digits: number;
    }

    interface NodeConfig {
      id: string;
      totp: TotpConfig;
      userId: string|null;
    }
  }

  namespace Api {
    interface Response<T> {
      success: true,
      data: T
    }
  }
}

export {};
