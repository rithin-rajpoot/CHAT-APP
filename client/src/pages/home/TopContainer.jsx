import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosSettings } from "react-icons/io";
import { useWindowWidth } from "@react-hook/window-size";
import { setSelectedUser } from "../../store/slice/user/userSlice";
import { clearChatThunk } from "../../store/slice/message/messageThunk";

const TopContainer = ({ userDetails }) => {
  const dispatch = useDispatch();
  const { onlineUsers } = useSelector((state) => state.socketReducer);
  const { selectedUser } = useSelector((state) => state.userReducer);
  const onlyWidth = useWindowWidth();
  
  const isMobile = onlyWidth < 768; // Tailwind md breakpoint

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

  const clearChat = async () => {
    setMenuOpen(false); 
    await dispatch(clearChatThunk({ receiverId: selectedUser?._id }));
  };

  const handleBack = () => {
    dispatch(setSelectedUser(null));
  }

  return (
    <div className="relative flex gap-5 items-center px-3 py-2 my-1 rounded-md bg-primary/30">
      <div className={`avatar ${isUserOnline && "avatar-online"}`}>
        <div className="w-8 md:w-10 lg:w-10 rounded-full">
          <img src={userDetails?.avatar || "/avatar.png"} />
        </div>
      </div>
      <div>
        <h2 className="text-xs md:text-sm lg:text-md">
          {userDetails?.fullName}
        </h2>
        <p className="text-xs">{isUserOnline ? "online" : "offline"}</p>
      </div>
      <button
        className="ml-auto px-2 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <IoIosSettings className="xl md:text-2xl lg:text-3xl" />
      </button>

      {isMobile && (
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleBack}
        >
          ← Back
        </button>
      )}

      {menuOpen && (
        <ul
          ref={menuRef}
          className="menu bg-base-200 rounded-box w-56 absolute right-2 top-full mt-2 shadow-lg z-50"
        >
          <li className="menu-title">Chat Settings</li>
          {/* <li>
            <a>Mute Chat</a>
          </li>
          <li>
            <a>Block User</a>
          </li> */}
          <li>
            <a onClick={clearChat}>Clear Chat</a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default TopContainer;
