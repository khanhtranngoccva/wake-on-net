import http from "http";
import app from "@/config/server/app.ts";

const server = new http.Server(app);

export default server;
