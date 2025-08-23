import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  googleAuthThunk,
  registerUserThunk,
} from "../../store/slice/user/userThunk";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, buttonLoading } = useSelector(
    (state) => state.userReducer
  );

  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
    };

    // Full Name validation
    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (signupData.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
      isValid = false;
    }

    // Username validation
    if (!signupData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (signupData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(signupData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
      isValid = false;
    }

    // Email validation
    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!signupData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (signupData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    // Confirm Password validation
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignup = async () => {
    if (validateForm()) {
      const response = await dispatch(registerUserThunk(signupData));
      if (response?.payload.success) {
        navigate("/");
      }
    }
  };

  return (
    <div className="flex justify-center items-center p-10 min-h-[calc(100vh-4rem)]">
      <div className="h-full flex max-w-[40rem] w-full flex-col gap-6 bg-base-300 rounded-lg p-6">
        <h2 className="text-2xl text-center font-semibold">Sign Up</h2>

        {/* Google Signup Button */}
       <div className="w-full flex justify-center">
          <div className="w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const credential = credentialResponse?.credential;
                if (credential) {
                  const response = await dispatch(googleAuthThunk({ credential }));
                  if (response?.payload?.success) {
                    navigate("/");
                  }
                }
              }}
              onError={() => {
                console.log("Google login failed");
              }}
              width="100%"
              size="large"
              theme="outline"
              shape="rectangular"
              logo_alignment="left"
              text="signin_with"
            />
          </div>
        </div>

        <div className="divider">OR</div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaUser />
            <input
              type="text"
              name="fullName"
              className={`grow ${errors.fullName ? "border-error" : ""}`}
              placeholder="Full Name"
              onChange={handleInputChange}
              value={signupData.fullName}
            />
          </label>
          {errors.fullName && (
            <span className="text-error text-sm">{errors.fullName}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaUser />
            <input
              type="text"
              name="username"
              className={`grow ${errors.username ? "border-error" : ""}`}
              placeholder="Username"
              onChange={handleInputChange}
              value={signupData.username}
            />
          </label>
          {errors.username && (
            <span className="text-error text-sm">{errors.username}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              className={`grow ${errors.email ? "border-error" : ""}`}
              placeholder="Email"
              onChange={handleInputChange}
              value={signupData.email}
            />
          </label>
          {errors.email && (
            <span className="text-error text-sm">{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaKey />
            <input
              type="password"
              name="password"
              className={`grow ${errors.password ? "border-error" : ""}`}
              placeholder="Password"
              onChange={handleInputChange}
              value={signupData.password}
            />
          </label>
          {errors.password && (
            <span className="text-error text-sm">{errors.password}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaKey />
            <input
              type="password"
              name="confirmPassword"
              className={`grow ${errors.confirmPassword ? "border-error" : ""}`}
              placeholder="Confirm Password"
              onChange={handleInputChange}
              value={signupData.confirmPassword}
            />
          </label>
          {errors.confirmPassword && (
            <span className="text-error text-sm">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="flex items-center gap-5 w-full">
          <label htmlFor="male">
            <input
              id="male"
              type="radio"
              name="gender"
              value="male"
              className="radio radio-primary mr-2"
              defaultChecked
              onChange={handleInputChange}
            />
            Male
          </label>
          <label htmlFor="female">
            <input
              id="female"
              type="radio"
              name="gender"
              value="female"
              className="radio radio-primary mr-2"
              onChange={handleInputChange}
            />
            Female
          </label>
        </div>

        {buttonLoading ? (
          <button className="btn btn-primary">
            <span className="loading loading-spinner loading-xs md:loading-sm lg:loading-md"></span>
          </button>
        ) : (
          <button
            onClick={handleSignup}
            className="btn btn-primary"
            disabled={
              !signupData.fullName ||
              !signupData.username ||
              !signupData.email ||
              !signupData.password ||
              !signupData.confirmPassword
            }
          >
            Sign Up
          </button>
        )}

        <p>
          Already have an account?&nbsp;{" "}
          <Link className="text-blue-500 underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
