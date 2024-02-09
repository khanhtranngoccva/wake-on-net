import express from "express";

export function enableStandardResponse(app: express.Express) {
  app.use((req, res: express.Response, next) => {
    res.jsonSuccess = (arg) => {
      res.json({
        success: true,
        data: arg,
      });
    };
    next();
  });
}
