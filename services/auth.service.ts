import axios from "axios";

export class AuthService {
  static async login(
    usernameOrEmail: string,
    password: string,
    remember: boolean = false
  ) {
    try {
      const res = await axios.post("/api/auth/login", {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
        remember: remember, // Kirim sebagai boolean, bukan string
      });

      if (res.data.success && res.data.token) {
        this.setToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      return res;
    } catch (error: any) {
      // Log the actual error response
      console.error("Login error details:", error.response?.data);
      throw error;
    }
  }

  static async logout() {
    return axios.post("/api/auth/logout");
  }

  static async checkAuth() {
    return axios.get("/api/auth/check");
  }

  static getStoredAuth() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return { token, user: user ? JSON.parse(user) : null };
  }

  static clearStoredAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  static getToken(): string | null {
    const token = localStorage.getItem("token");
    return token ? token : null;
  }

  static getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static setToken(token: string) {
    // Remove 'Bearer ' prefix if exists
    const cleanToken = token.replace("Bearer ", "");
    localStorage.setItem("token", cleanToken);
  }

  static updateUserData(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }
}
