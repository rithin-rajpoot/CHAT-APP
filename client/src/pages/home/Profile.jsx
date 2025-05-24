import { use, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Mail, User, ArrowLeft } from "lucide-react";
import { IoIosSettings } from "react-icons/io";
import {
  deleteUserThunk,
  updateProfileThunk,
} from "../../store/slice/user/userThunk";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const dispatch = useDispatch();
  const { userProfile, screenLoading, isAuthenticated } = useSelector(
    (state) => state.userReducer
  );
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await dispatch(updateProfileThunk({ profilePic: base64Image }));
    };
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated]);

  const handleDelete = async () => {
    await dispatch(deleteUserThunk());
    navigate("/login");
  };

  return (
    <div className="relative h-screen mt-[1rem]">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 relative">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-4 flex items-center gap-2 text-sm font-medium hover:underline cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          {/* Settings Button */}
          <button
            className="absolute top-5 right-3 px-2 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IoIosSettings className="text-xl md:text-2xl lg:text-3xl" />
          </button>
          {menuOpen && (
            <ul
              ref={menuRef}
              className="menu bg-base-200 rounded-box w-56 absolute right-1 top-10 mt-2 shadow-lg z-50"
            >
              <li className="menu-title">Acoount Settings</li>
              <li>
                <a onClick={() => navigate("/settings")}>Themes</a>
              </li>
              <li>
                <a onClick={handleDelete}>Delete Account</a>
              </li>
            </ul>
          )}
          <div className="text-center mt-6">
            <h1 className="text-xl md:text-2xl font-semibold">Profile</h1>
            <p className="mt-2 text-xs md:text-sm">Your profile information</p>
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || userProfile?.avatar || "/avatar.png"}
                alt="Profile"
                className="size-24 md:size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-1 md:p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${screenLoading ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={screenLoading}
                />
              </label>
            </div>
            <p className="text-xs md:text-sm text-zinc-400">
              {screenLoading
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="mx-3 text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                Full Name
              </div>
              <p className="mx-2 px-4 py-2.5 bg-base-200 rounded-lg border text-sm md:text-md">
                {userProfile?.fullName}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-sm md:text-md lg:text-lg font-medium mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="text-xs md:text-sm lg:text-md flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{userProfile?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="text-xs md:text-sm lg:text-md flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
