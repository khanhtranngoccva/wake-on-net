import "express-async-errors";
import express from "express";
import enablePassportAuth from "@/config/passport/index.js";
import envHelper from "@/helpers/env-helper.js";
import cors from "cors";
import {enableStandardResponse} from "@/middleware/response.js";

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
