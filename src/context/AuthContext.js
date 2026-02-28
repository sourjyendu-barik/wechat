import React, { createContext, useContext, useEffect, useState } from "react";
import { setApiToken } from "../api/api.axiosInstance";
import axios from "axios";
const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);
const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //handle login and refrsh
  const updateUser = (userdata, token) => {
    setUser(userdata);
    setApiToken(token);
    setLoading(false);
  };
  //handle logout
  const logout = async () => {
    try {
      await axios.post(
        "https://wechat-middlewire.vercel.app/api/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setApiToken(null);
      setLoading(false);
      window.location.href = "/login";
    }
  };
  //silemnt login when refresh
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.post(
          "https://wechat-middlewire.vercel.app/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newToken = res?.data?.accessToken;

        if (newToken) {
          let username = null;
          try {
            const payload = JSON.parse(atob(newToken.split(".")[1]));
            username = payload?.username;
          } catch (error) {
            console.error("JWT decode failed:", error.message);
          }
          if (username) {
            updateUser(username, newToken);
            return;
          }
        }
      } catch (error) {
        setUser(null);
        setApiToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const value = { updateUser, logout, user, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
