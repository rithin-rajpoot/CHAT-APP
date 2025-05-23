import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../../store/slice/user/userSlice";
import { useState } from "react";

const User = ({ userDetails }) => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector(state => state.socketReducer);

  let isUserOnline = onlineUsers?.includes(userDetails?._id)

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
  };

 
  return (
    <div
      onClick={handleUserClick}
      className={`flex gap-5 items-center px-3 py-2 my-1 hover:bg-gray-800 cursor-pointer hover:rounded-md ${
        userDetails?._id === selectedUser?._id && "bg-gray-800"
      }`}
    >
      <div className={`avatar ${isUserOnline && 'avatar-online'}`}>
      
       <div className="md:w-10 lg:w-12 rounded-full">
          <img src={userDetails?.avatar || "/avatar.png"} />
        </div>
      </div>
      <div>
        <h2 className="md:text-sm lg:text-lg">{userDetails?.fullName}</h2>
        <p className="text-xs">{isUserOnline? "online" : "offline"}</p>
      </div>
    </div>
  );
};

export default User;
