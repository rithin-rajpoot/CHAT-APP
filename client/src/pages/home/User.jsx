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
      className={`flex gap-5 items-center px-3 py-2 my-1 hover:bg-primary/30 cursor-pointer hover:rounded-md ${
        userDetails?._id === selectedUser?._id && "bg-primary/30"
      }`}
    >
      <div className={`avatar ${isUserOnline && 'avatar-online'}`}>
      
       <div className="w-8 md:w-10 lg:w-10 rounded-full">
          <img src={userDetails?.avatar || "/avatar.png"} />
        </div>
      </div>
      <div>
        <h2 className="text-sm md:text-sm lg:text-md">{userDetails?.fullName}</h2>
        <p className="text-xs">{isUserOnline? "online" : "offline"}</p>
      </div>
    </div>
  );
};

export default User;
