import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { loginUserThunk } from "../../store/slice/user/userThunk";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const { isAuthenticated, buttonLoading } = useSelector(
    (state) => state.userReducer
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  // to redirect the user to the home page when the user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
    };

    // Username validation
    if (!loginData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (loginData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    // Password validation
    if (!loginData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (loginData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const response = await dispatch(loginUserThunk(loginData));
      if (response?.payload?.success) {
        navigate("/");
      }
    }
  };

  return (
    <div className="flex justify-center items-center p-10 min-h-[calc(100vh-4rem)]">
      <div className="h-full flex max-w-[40rem] w-full flex-col gap-6 bg-base-300 rounded-lg p-6">
        <h2 className="text-2xl text-center font-semibold">Login</h2>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaUser />
            <input
              type="text"
              name="username"
              className={`grow ${errors.username ? "border-error" : ""}`}
              placeholder="Username"
              onChange={handleInputChange}
              value={loginData.username}
            />
          </label>
          {errors.username && (
            <span className="text-error text-sm">{errors.username}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaKey />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`grow ${errors.password ? "border-error" : ""}`}
              onChange={handleInputChange}
              value={loginData.password}
            />
          </label>
          {errors.password && (
            <span className="text-error text-sm">{errors.password}</span>
          )}
        </div>

        {buttonLoading ? (
          <button className="btn btn-primary">
            <span className="loading loading-spinner loading-xs md:loading-sm lg:loading-md"></span>
          </button>
        ) : (
          <button 
            onClick={handleLogin} 
            className="btn btn-primary"
            disabled={!loginData.username || !loginData.password}
          >
            Login
          </button>
        )}

        <p>
          Don't have an account?&nbsp;{" "}
          <Link className="text-blue-500 underline" to="/signup">
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
