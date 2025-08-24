import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, LogOut, Menu, X, Trash2, Home } from "lucide-react";
import { logoutUserThunk, deleteUserThunk } from "../store/slice/user/userThunk";
import { disconnectSocket } from "../store/slice/socket/socketSlice";
import { setMessages } from "../store/slice/message/messageSlice";
import DeleteAccountConfirmation from "./DeleteAccountConfirmation";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, userProfile } = useSelector((state) => state.userReducer);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    dispatch(disconnectSocket());
    dispatch(setMessages()); // Clear messages state
    navigate("/login");
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingAccount(true);
      await dispatch(deleteUserThunk());
      dispatch(disconnectSocket());
      setShowDeleteConfirmation(false);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setIsDeletingAccount(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
    setIsMobileMenuOpen(false);
  };

  // Don't show navbar on certain pages if needed
  const hideNavbarRoutes = [];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-base-100 border-b border-base-300 sticky top-0 z-50 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="text-xl md:text-2xl font-bold text-primary hover:text-primary-focus transition-colors cursor-pointer"
            >
              GUP SHUP
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Profile Button */}
                <button
                  onClick={handleHomeClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                >
                  <Home size={18} />
                  Home
                </button>

                {/* Settings Button */}
                {/* <button
                  onClick={handleSettingsClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-base-content hover:bg-base-200 transition-colors"
                >
                  <Settings size={18} />
                  Settings
                </button> */}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                  >
                    <span className="hidden lg:block">{userProfile?.fullName}</span>
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                        <img
                          src={userProfile?.avatar || "/avatar.png"}
                          alt="Profile"
                          className="rounded-full"
                        />
                      </div>
                    </div>

                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg border border-base-300 py-1 z-50">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center gap-2"
                      >
                        <User size={16} />
                        View Profile
                      </button>
                      <button
                        onClick={handleSettingsClick}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <hr className="my-1 border-base-300" />
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-base-200 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-base-200 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged out state - only settings */
              <button
                onClick={handleSettingsClick}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-base-content hover:bg-base-200 transition-colors"
              >
                <Settings size={18} />
                Settings
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-base-content hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-base-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-base-300 mb-2">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                        <img
                          src={userProfile?.avatar || "/avatar.png"}
                          alt="Profile"
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content">{userProfile?.fullName}</p>
                      <p className="text-xs text-base-content/70">@{userProfile?.username}</p>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base text-base-content hover:bg-base-200"
                  >
                    <User size={20} />
                    Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base text-base-content hover:bg-base-200"
                  >
                    <Settings size={20} />
                    Settings
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base text-error hover:bg-base-200"
                  >
                    <Trash2 size={20} />
                    Delete Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base text-error hover:bg-base-200"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                /* Mobile logged out state */
                <button
                  onClick={handleSettingsClick}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base text-base-content hover:bg-base-200"
                >
                  <Settings size={20} />
                  Settings
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <DeleteAccountConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingAccount}
        userName={userProfile?.fullName || "your account"}
      />
    </nav>
  );
};

export default Navbar;
