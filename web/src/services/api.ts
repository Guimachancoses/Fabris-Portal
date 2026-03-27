import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  // baseURL: "http://ec2-3-147-238-182.us-east-2.compute.amazonaws.com:8000",
});

export default api;
