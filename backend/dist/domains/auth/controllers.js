class HTTPController {
    static async signOut(req, res) {
        req.logout(() => {
            req.session.destroy(() => {
                res.jsonSuccess();
            });
        });
    }
    static async getCurrentUser(req, res) {
        res.jsonSuccess(req.user);
    }
}
export default class AuthController {
    static http = HTTPController;
}
