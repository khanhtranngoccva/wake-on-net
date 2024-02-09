import "express-async-errors";
import express from "express";
import enablePassportAuth from "@/config/passport/index.ts";
import envHelper from "@/helpers/env-helper.ts";
import cors from "cors";
import {enableStandardResponse} from "@/middleware/response.ts";

const app = express();
app.set("trust proxy", true);
enableStandardResponse(app);
app.use(express.urlencoded());
app.use(express.json());
app.use(cors({
  origin: envHelper.get("FRONTEND_URL"),
  credentials: true,
}));
enablePassportAuth(app);

export default app;
