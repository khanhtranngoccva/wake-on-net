import { AlreadySignedInError, NoCredentialsError } from "@/helpers/errors.js";
export const requireUserAuthenticationState = function (param) {
    return function decorator(target, propertyKey, descriptor) {
        let method = descriptor.value;
        descriptor.value = function (req, res, next) {
            const authenticated = req.isAuthenticated();
            if (!authenticated && param) {
                throw new NoCredentialsError();
            }
            else if (authenticated && !param) {
                throw new AlreadySignedInError();
            }
            return method.call(this, req, res, next);
        };
    };
};
