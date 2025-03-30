import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUserThunk } from "../../store/slice/user/userThunk";
import toast from "react-hot-toast";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.userReducer);

  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });

  useEffect(() => {
      if (isAuthenticated) {
        navigate("/");
      }
    }, [isAuthenticated]);

  const handleInputChange = (e) => {
    // console.log(e.target.value)
    setSignupData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async () => {
    if(signupData.password !== signupData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    const response = await dispatch(registerUserThunk(signupData));
    if(response?.payload.success){
      navigate('/');
    }
  };

  return (
    <div className="flex justify-center items-center p-10 min-h-screen">
      <div className="h-full flex max-w-[40rem] w-full flex-col gap-6 bg-base-300 rounded-lg  p-6">
        <h2 className="text-2xl text-center font-semibold">Signup</h2>

        <label className="input flex items-center gap-2 w-full">
          <FaUser />
          <input
            type="text"
            name="fullName"
            className="grow"
            placeholder="Full Name"
            onChange={handleInputChange}
          />
        </label>
        <label className="input flex items-center gap-2 w-full">
          <FaUser />
          <input
            type="text"
            name="username"
            className="grow"
            placeholder="Username"
            onChange={handleInputChange}
          />
        </label>
        <label className="input flex items-center gap-2 w-full">
          <FaKey />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="grow"
            onChange={handleInputChange}
          />
        </label>
        <label className="input flex items-center gap-2 w-full">
          <FaKey />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="grow"
            onChange={handleInputChange}
          />
        </label>
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
            male
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
            female
          </label>
        </div>
        <button onClick={handleSignup} className="btn btn-primary">
          Signup
        </button>

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
