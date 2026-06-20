import axios from "axios";

// In development: uses VITE_API_URL from .env (http://localhost:5000)
// In production:  uses VITE_API_URL from Vercel env vars (your Render URL)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export default API;
