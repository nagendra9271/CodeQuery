import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAsyncFn } from "../hooks/useAsync";
import { postLoginCrendatials } from "../services/login";
import { useUserContext } from "../contexts/userContext";
import { Eye, EyeOff } from "lucide-react";

function Login(props) {
  const navigate = useNavigate();
  const { setUserDetails } = useUserContext();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    loading,
    error,
    execute: handleLogin,
  } = useAsyncFn(postLoginCrendatials);

  function handleChange(event) {
    setData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await handleLogin({
      email: data.email,
      password: data.password,
    });

    console.log(response);
    const d1 = response?.data;
    if (response) {
      // use context to save data + sessionStorage
      setUserDetails({
        name: d1.name,
        email: data.email,
        id: d1.userId,
        accessToken: d1.accessToken,
      });

      setData({});
      navigate("/");
    }
  };

  return (
    <div className="container-lg d-flex flex-column justify-content-center align-items-center vh-100">
      <form
        className="border p-5 rounded shadow-lg bg-light"
        style={{ width: "400px" }}
        onSubmit={handleSubmit}
      >
        <h2 className="text-center mb-4">Login</h2>

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            name="email"
            value={data.email || ""}
            onChange={handleChange}
            placeholder="name@example.com"
            disabled={loading}
            required
          />
          <label>Email address</label>
        </div>

        <div className="form-floating mb-4 position-relative">
          <input
            type={passwordVisible ? "text" : "password"}
            className="form-control"
            name="password"
            onChange={handleChange}
            value={data.password || ""}
            placeholder="Password"
            disabled={loading}
            required
          />
          <label>Password</label>
          <span
            className="position-absolute top-50 end-0 translate-middle-y me-3"
            onClick={togglePasswordVisibility}
            style={{ cursor: "pointer" }}
          >
            {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div className="alert alert-danger mt-3">{error.message}</div>
        )}
      </form>

      <div className="d-flex justify-content-center align-items-center mt-3">
        <span className="me-2">Don&apos;t have an account?</span>
        <Link className="text-decoration-none" to="/signup">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default Login;
