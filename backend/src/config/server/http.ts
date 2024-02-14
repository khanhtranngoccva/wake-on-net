import http from "http";
import app from "@/config/server/app.js";

const server = new http.Server(app);

export default server;
