declare global {
  namespace Application {
    interface AuthenticationData {
      nodeId: string;
      totp: Totp;
    }

    interface Totp {
      id: string;
      algorithm: string;
      interval: number;
      secret: string;
      digits: number;
    }

    interface User {
      id: string;
      email: string;
      displayName: string;
      profilePicture: string;
    }

    interface Node {
      id: string;
      userId: string | null;
      name: string;
      totpId: string | null;
    }

    interface NodeConfig extends Node {
      totp: Totp;
    }

    interface Device {
      id: string;
      name: string;
      nodeId: string;
      ipAddress: string;
      macAddress: string;
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
