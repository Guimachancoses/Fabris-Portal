import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "http://18.224.5.103:8080",
});

export default api;
