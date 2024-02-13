class SystemError extends Error {
}

export interface SocketIOError extends Error {
  data?: {
    type: string;
  }
  type: string;
}

export class CustomError extends Error {
  code: number;
  data: {
    type: string;
  }

  constructor(code: number = 500, message: string = "Unspecified server error.") {
    super(message);
    this.code = code;
    this.data = {
      type: this.constructor.name
    }
  }
}

export class EnvironmentError extends SystemError {
  constructor(variable: string) {
    super(`Environment variable ${variable} is missing or inaccurate. Check your environment or .env file.`);
  }
}

export class UnavailableError extends CustomError {
  constructor(message: string = "Endpoint not available yet.") {
    super(503, message);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = "Bad request.") {
    super(400, message);
  }
}

export class AlreadySignedInError extends BadRequestError {
  constructor(message: string = "You have already signed in, sign out to use this endpoint.") {
    super(message);
  }
}
