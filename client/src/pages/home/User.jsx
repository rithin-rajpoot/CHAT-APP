import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../../store/slice/user/userSlice";
import { useState } from "react";

const User = ({ userDetails }) => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector(state => state.socketReducer);

  let isUserOnline = onlineUsers?.includes(userDetails?._id)
  // console.log(isUserOnline)

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
  };

 
  return (
    <div
      onClick={handleUserClick}
      className={`flex gap-5 items-center px-3 py-2 my-1 hover:bg-gray-700 cursor-pointer hover:rounded-md ${
        userDetails?._id === selectedUser?._id && "bg-gray-700"
      }`}
    >
      <div className={`avatar ${isUserOnline && 'avatar-online'}`}>
      
        <div className="w-12 rounded-full">
          <img src={userDetails?.avatar} />
        </div>
      </div>
      <div>
        <h2 className="line-clamp-1">{userDetails?.fullName}</h2>
        <p className="text-xs ">{userDetails?.username}</p>
      </div>
    </div>
  );
};

export default User;
