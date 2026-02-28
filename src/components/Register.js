import React, { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerationSuccess, setRegistrationSuccess] = useState(null);
  const { updateUser } = useAuthContext();

  const handleRegister = async () => {
    try {
      const { data } = await axios.post(
        "https://wechat-middlewire.vercel.app/api/auth/register",
        {
          username,
          password,
        },
        {
          withCredentials: true, // This tells the browser to adopt the cookie
        },
      );

      setRegistrationSuccess(
        "You are registered successfully. Proceed to login.",
      );
      updateUser(data?.username, data?.accessToken);
    } catch (error) {
      console.error(error.response?.data?.message || "Error registering user");
      setRegistrationSuccess(
        error.response?.data?.message || "Error registering user",
      );
    } finally {
      setTimeout(() => setRegistrationSuccess(null), 2000);
    }
  };

  return (
    <div className="card py-5 text-center">
      <div className="card-body px-5">
        <h2>Register</h2>
        <p>Not a user yet? Register here</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className="form-control form-control-lg mt-3"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="form-control form-control-lg mt-3"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-success btn-lg mt-3"
          onClick={handleRegister}
        >
          Register
        </button>
        {registerationSuccess && <p>{registerationSuccess}</p>}
      </div>
    </div>
  );
};

export default Register;
