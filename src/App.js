import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { Chat } from "./components/Chat";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuthContext } from "./context/AuthContext";
import LoadingSpinner from "./spinner/LoadingSpinner";
const App = () => {
  //const [user, setUser] = useState(null);
  const { user: LoggedInUser, loading } = useAuthContext();
  if (loading) {
    <LoadingSpinner text="Loading session...." />;
  }
  return (
    <div className="app">
      <h1>Chat App</h1>
      {!LoggedInUser ? (
        <div className="container mt-5 text-center">
          <div className="row">
            <div className="col-md-6">
              <Register />
            </div>
            <div className="col-md-6">
              <Login />
            </div>
          </div>
        </div>
      ) : (
        <Chat user={LoggedInUser} />
      )}
    </div>
  );
};

export default App;
