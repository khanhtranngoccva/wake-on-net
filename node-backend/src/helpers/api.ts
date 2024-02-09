import axios from "axios";
import envHelper from "@/helpers/env-helper.ts";

const api = axios.create({
  baseURL: envHelper.get("BACKEND_HTTP_URL")
});

export default api;
