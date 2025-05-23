import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosSettings } from "react-icons/io";

const TopContainer = ({ userDetails }) => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  let isUserOnline = onlineUsers?.includes(userDetails?._id);

  // Optional: Close the menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearChat = () => {
    
    setMenuOpen(false); // Optionally close menu after action
  };

  return (
    <div
      className="relative flex gap-5 items-center px-3 py-4 my-1 bg-slate-800 rounded-md cursor-pointer"
    >
      <div className={`avatar ${isUserOnline && "avatar-online"}`}>
        <div className="md:w-10 lg:w-12 rounded-full">
          <img src={userDetails?.avatar || "/avatar.png"} />
        </div>
      </div>
      <div>
        <h2 className="md:text-sm lg:text-lg">{userDetails?.fullName}</h2>
        <p className="text-xs">{isUserOnline ? "online" : "offline"}</p>
      </div>
      <button
        className="ml-auto px-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <IoIosSettings className="md:text-3xl lg:text-4xl text-slate-400" />
      </button>

      {menuOpen && (
        <ul
          ref={menuRef}
          className="menu bg-base-200 rounded-box w-56 absolute right-2 top-full mt-2 shadow-lg z-50"
        >
          <li className="menu-title">Chat Settings</li>
          <li><a>Mute Chat</a></li>
          <li><a>Block User</a></li>
          <li><a onClick={clearChat}>Clear Chat</a></li>
        </ul>
      )}
    </div>
  );
};

export default TopContainer;
