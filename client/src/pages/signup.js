import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserContext } from "../contexts/userContext";
import { Eye, EyeOff } from "lucide-react";
import { convertToLinkOrValidate } from "./convertToLink";
import { useAsyncFn } from "../hooks/useAsync";
import { postUserDetails } from "../services/login";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    github: "",
    leetcode: "",
    location: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [iscorrect, setIscorrect] = useState(true);
  const { setIsLoggedIn, setAccessToken, setUserInfo } = useUserContext();
  const { loading, error, response, execute } = useAsyncFn(postUserDetails);
  const navigate = useNavigate();
  useEffect(() => {
    if (response?.data) {
      const data = response.data;
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("userName", data.name);
      setUserInfo({
        name: data.name,
        email: data.email,
        id: data.userId,
      });
      setAccessToken(data.accessToken);
      setIsLoggedIn(true);
      setFormData({});
      navigate("/");
    }
  }, [response?.data, setAccessToken, setIsLoggedIn, navigate, setUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setPasswordVisible((prev) => !prev);
  };

  const checkPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/;
    return regex.test(password);
  };

  const validateForm = () => {
    if (!checkPassword(formData.password))
      return "Password must be 8-20 characters and include uppercase, lowercase, number, and special character.";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match.";
    if (formData.dob && new Date(formData.dob) > new Date())
      return "Date of Birth cannot be in the future.";
    return null;
  };

  const handleSignUp = async () => {
    execute(formData);
  };

  const emailExistsAlready = async (email) => {
    try {
      const response = await fetch("/checkemail", {
        method: "POST",
        body: JSON.stringify({ email: email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error occurred:", error);
      alert("Unable to connect to the server. Please try again later.");
      return true;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setIscorrect(false);
      alert(validationError);
      return;
    }
    if (FormData.github && FormData.github.trim() !== "") {
      const response = convertToLinkOrValidate(FormData.github, "github");
      if (response.isCorrect) {
        formData((prev) => {
          return {
            ...prev,
            github: response.link,
          };
        });
      } else {
        alert(
          "The GitHub link or username entered does not appear to be a valid GitHub link or username"
        );
        return; // stop submission if invalid
      }
    }
    // Validate Leetcode link or username using convertToLinkOrValidate
    if (formData.leetcode && formData.leetcode.trim() !== "") {
      const response = convertToLinkOrValidate(formData.leetcode, "leetcode");
      if (response.isCorrect) {
        setFormData((prev) => {
          return {
            ...prev,
            leetcode: response.link,
          };
        });
      } else {
        alert(
          "The Leetcode link or username entered does not appear to be a valid Leetcode link or username"
        );
        return; // stop submission if invalid
      }
    }
    setIscorrect(true);
    const isEmailExists = await emailExistsAlready(formData.email);
    if (!isEmailExists) {
      handleSignUp();
    }
  };

  return (
    <div className="container-lg d-flex flex-column justify-content-center align-items-center w-100">
      <form
        onSubmit={handleSubmit}
        className="border p-5 rounded shadow-lg bg-light w-75"
        style={{ width: "400px" }}
      >
        <h2 className="text-center mb-4">Sign Up</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {/* User Name */}
        <div className="form-floating mb-3">
          <input
            className="form-control"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
          <label htmlFor="name">
            User Name <span className="text-danger">*</span>
          </label>
        </div>

        {/* Email */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            onBlur={(e) => emailExistsAlready(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <label htmlFor="email">
            Email Address <span className="text-danger">*</span>
          </label>
        </div>

        {/* Password */}
        <div className="form-floating mb-3">
          <div className="form-floating position-relative">
            <input
              type={passwordVisible ? "text" : "password"}
              className="form-control"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <label htmlFor="password">
              Password<span className="text-danger">*</span>
            </label>
            <button
              className="position-absolute top-50 end-0 translate-middle-y me-3"
              onClick={togglePasswordVisibility}
              style={{ border: "none", background: "none" }}
            >
              {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div
            className="form-text"
            style={{ color: iscorrect ? "black" : "red" }}
          >
            Your password must be 8-20 characters long, must contain at least
            one special character, one capital letter, and numbers.
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-floating mb-3">
          <input
            type={passwordVisible ? "text" : "password"}
            className="form-control"
            name="confirmPassword"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
          <label htmlFor="confirmPassword">
            Confirm Password<span className="text-danger">*</span>
          </label>
        </div>

        {/* Date of Birth */}
        <div className="form-floating mb-3">
          <input
            type="date"
            className="form-control"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            placeholder="Date of Birth"
            required
          />
          <label htmlFor="dob">
            Date of Birth<span className="text-danger">*</span>
          </label>
        </div>

        {/* Location */}
        <div className="form-floating mb-3">
          <input
            className="form-control"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="Location"
          />
          <label htmlFor="location">Location</label>
        </div>

        {/* Links */}
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold m-1 form-label">Links or Usernames</label>
          <div className="d-flex flex-row w-100">
            <div className="form-floating me-2 w-50">
              <input
                className="form-control"
                name="github"
                value={formData.github || ""}
                onChange={handleChange}
                placeholder="GitHub Link"
              />
              <label htmlFor="github">Github</label>
            </div>
            <div className="form-floating w-50">
              <input
                className="form-control"
                name="leetcode"
                value={formData.leetcode || ""}
                onChange={handleChange}
                placeholder="Leetcode Link"
              />
              <label htmlFor="leetcode">Leetcode</label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="d-flex justify-content-center align-items-center">
          <button
            type="submit"
            className="btn btn-primary w-30"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </form>

      <div className="d-flex justify-content-center align-items-center mt-3 fs-4">
        <span className="me-2">Already have an account?</span>
        <Link className="text-decoration-none" to="/login">
          Login
        </Link>
      </div>
    </div>
  );
}
