class SystemError extends Error {
}
export class CustomError extends Error {
    code;
    data;
    constructor(code = 500, message = "Unspecified server error.") {
        super(message);
        this.code = code;
        this.data = {
            type: this.constructor.name,
            message: this.message,
        };
    }
}
export class EnvironmentError extends SystemError {
    constructor(variable) {
        super(`Environment variable ${variable} is missing or inaccurate. Check your environment or .env file.`);
    }
}
export class AuthenticationError extends CustomError {
    constructor(message = "Authentication error.") {
        super(401, message);
    }
}
export class NoCredentialsError extends AuthenticationError {
    constructor(message = "You must sign in to the service.") {
        super(message);
    }
}
export class InvalidCredentialsError extends AuthenticationError {
    constructor(message = "Invalid login credentials.") {
        super(message);
    }
}
export class ResourceUnboundError extends AuthenticationError {
    constructor(message = "Resource must be bound to the user before being usable.") {
        super(message);
    }
}
export class AuthorizationError extends CustomError {
    constructor(message = "You are not allowed access to this resource.") {
        super(403, message);
    }
}
export class BadRequestError extends CustomError {
    constructor(message = "Bad request.") {
        super(400, message);
    }
}
export class AlreadySignedInError extends BadRequestError {
    constructor(message = "You have already signed in, sign out to use this endpoint.") {
        super(message);
    }
}
