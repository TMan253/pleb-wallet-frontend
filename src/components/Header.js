import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import "./Header.css";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const Header = ({ isLoggedIn, user }) => {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [signupModalIsOpen, setSignupModalIsOpen] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = (event) => {
    event.preventDefault();

    axios
      .post(`${backendUrl}/users/login`, formData)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setLoginModalIsOpen(false);
        setUserCreated(false);
        setFormData({
          username: "",
          password: "",
        });

        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSignup = (event) => {
    event.preventDefault();

    axios
      .post(`${backendUrl}/users/register`, formData)
      .then((res) => {
        if (res.status === 201) {
          setUserCreated(true);
          setSignupModalIsOpen(false);
          setLoginModalIsOpen(true);
          setFormData({
            username: "",
            password: "",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.reload();
  };

  return (
    <header className="header-container">
      <div></div> {/* Empty div for flex alignment */}
      <h1>pleb wallet</h1>
      <div className="auth-container">
        {isLoggedIn ? <p className="user">Welcome, {user.username}!</p> : null}

        {isLoggedIn ? (
          <button className="auth-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <button
              className="auth-button"
              onClick={() => setLoginModalIsOpen(true)}
            >
              Login
            </button>
            <button
              className="auth-button"
              onClick={() => setSignupModalIsOpen(true)}
            >
              Signup
            </button>
          </>
        )}
      </div>
      <Modal
        isOpen={loginModalIsOpen}
        onRequestClose={() => setLoginModalIsOpen(false)}
        style={customStyles}
        contentLabel="Login Modal"
      >
        <h2>Login</h2>
        {userCreated && (
          <p>Your user was successfully created. You can now login.</p>
        )}
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </label>
          <button type="submit">Login</button>
        </form>
      </Modal>
      <Modal
        isOpen={signupModalIsOpen}
        onRequestClose={() => setSignupModalIsOpen(false)}
        style={customStyles}
        contentLabel="Signup Modal"
      >
        <h2>Signup</h2>
        <form onSubmit={handleSignup}>
          <label>
            Username:
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </label>
          <button type="submit">Signup</button>
        </form>
      </Modal>
    </header>
  );
};

export default Header;
