import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import {
  getOtherUsersThunk,
  logoutUserThunk,
} from "../../store/slice/user/userThunk";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../../store/slice/socket/socketSlice";
import UserSideBarSkeleton from "../skeletons/UserSideBarSkeleton";


const UserSidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { otherUsers, userProfile, screenLoading } = useSelector((state) => state.userReducer);


  const [searchValue, setSearchValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(otherUsers);

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    dispatch(disconnectSocket());
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      await dispatch(getOtherUsersThunk());
    })();
  }, []);

  useEffect(() => {
    if (!searchValue) {
      setFilteredUsers(otherUsers);
    } else {
      setFilteredUsers(
        otherUsers.filter((user) =>{
          return (
            user?.fullName?.toLowerCase().includes(searchValue.toLowerCase()) || user?.username?.toLowerCase().includes(searchValue.toLowerCase()) 
          );
        })
      )
    } 
  },[searchValue, otherUsers]);

  const handleClick = () => {
    navigate('/profile')
  }

  if (screenLoading) return <UserSideBarSkeleton />

  return (
    <div className="w-full md:max-w-[20rem] h-screen flex flex-col border-r border-r-primary/30">
      <h1 className="mx-3 mt-3 rounded-lg bg-primary/30 text-xl font-bold px-3 py-1 text-center">
        GUP SHUP
      </h1>

      <div className="py-2 px-2 w-full ">
        <label className="input input-bordered flex items-center gap-2 w-full">
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            className="grow"
            placeholder="Search"
          />
          <IoSearch />
        </label>
      </div>
      <div className="h-full overflow-y-auto">
        {filteredUsers?.map((user) => {
          return <User key={user?._id} userDetails={user} />;
        })}
      </div>

      <div className="flex gap-5 justify-between p-3 bg-primary/5">
        <div className="flex gap-3 items-center">
          <div className="avatar">
            <div className="ring-primary ring-offset-base-100 w-10 rounded-full ring ring-offset-2">
              <img src={userProfile?.avatar || "/avatar.png"} />
            </div>
          </div>
          <div className="tooltip" data-tip="click to view profile">
            <button onClick={handleClick} className="rounded-md px-2 py-1 cursor-pointer">{userProfile?.fullName}</button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-primary btn-sm px-4 mt-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
