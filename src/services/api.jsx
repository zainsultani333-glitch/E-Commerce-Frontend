import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Helper to set Authorization header dynamically
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// ✅🔥 ADD THIS (VERY IMPORTANT)
const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

// ✅🔥 INTERCEPTOR (extra safety)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;