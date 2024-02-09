import express from "express";
import "express-async-errors";
import cors from "cors";
import {enableStandardResponse} from "@/middleware/response.ts";

const app = express();
app.set("trust proxy", true);
enableStandardResponse(app);
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

export default app;
