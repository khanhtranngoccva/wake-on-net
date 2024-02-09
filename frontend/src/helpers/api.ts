import axios from "axios";

export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_HTTP_URL,
  responseType: "json",
  withCredentials: true,
});
