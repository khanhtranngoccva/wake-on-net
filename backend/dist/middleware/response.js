export function enableStandardResponse(app) {
    app.use((req, res, next) => {
        res.jsonSuccess = (arg) => {
            res.json({
                success: true,
                data: arg,
            });
        };
        next();
    });
}
