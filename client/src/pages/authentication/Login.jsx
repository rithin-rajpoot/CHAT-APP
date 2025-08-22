import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { googleAuthThunk, loginUserThunk } from "../../store/slice/user/userThunk";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { isAuthenticated, buttonLoading } = useSelector(
    (state) => state.userReducer
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
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
      email: "",
      password: "",
    };

    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email address";
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

        {/* Google Login Button */}
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
        />

        <div className="divider">OR</div>

        <div className="flex flex-col gap-1">
          <label className="input flex items-center gap-2 w-full">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              className={`grow ${errors.email ? "border-error" : ""}`}
              placeholder="Email"
              onChange={handleInputChange}
              value={loginData.email}
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
            disabled={!loginData.email || !loginData.password}
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
