declare global {
  namespace Application {
    interface User {
      id: string;
      email: string;
      displayName: string;
      profilePicture: string;
    }

    interface Node {
      id: string;
      userId: string | null;
      user?: User | null;
      name: string;
      totpId: string | null;
      totp?: Totp | null;
      devices?: Device[];
    }

    interface Device {
      id: string;
      name: string;
      nodeId: string;
      node?: Node;
      ipAddress: string;
      macAddress: string;
    }

    interface NodeWithDevices extends Node {
      devices: Device[]
    }

    interface OnlineStatus {
      id: string;
      online: boolean;
    }

    interface NodeOnlineStatus extends OnlineStatus {}
  }

  namespace Api {
    interface Response<T> {
      success: true,
      data: T
    }

    interface FailResponse {
      success: false,
      error: {
        type: string,
        message: string,
      },
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_HTTP_URL: string;
      NEXT_PUBLIC_BACKEND_WS_URL: string;
    }
  }
}

export {};
