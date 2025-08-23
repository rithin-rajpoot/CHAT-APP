import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { googleAuthThunk, loginUserThunk } from "../../store/slice/user/userThunk";
import { useDispatch, useSelector } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc"; // Google icon

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

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  // Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const credential = tokenResponse?.credential || tokenResponse?.access_token;
      if (credential) {
        const response = await dispatch(googleAuthThunk({ credential }));
        if (response?.payload?.success) {
          navigate("/");
        }
      }
    },
    onError: () => {
      console.log("Google login failed");
    },
  });
  //  Validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

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

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Login with email/password
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

        {/* Custom Google Login Button */}
        <div className="w-full flex justify-center">
          <button
            onClick={() => googleLogin()}
            className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 rounded-lg shadow-md py-2 px-4 hover:bg-gray-100 transition duration-200"
          >
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">Sign in with Google</span>
          </button>
        </div>

        <div className="divider">OR</div>

        {/* Email Input */}
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

        {/* Password Input */}
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

        {/* Login Button */}
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
