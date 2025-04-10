import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import {
  getOtherUsersThunk,
  logoutUserThunk,
} from "../../store/slice/user/userThunk";
const UserSidebar = () => {

  const dispatch = useDispatch();
  const { otherUsers, userProfile } = useSelector((state) => state.userReducer);

  const [searchValue, setSearchValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(otherUsers);

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
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

  return (
    <div className="max-w-[20rem] w-full h-screen flex flex-col border-r border-r-white/10">
      <h1 className="mx-3 mt-3 rounded-lg text-[#605DFF] bg-black text-xl font-bold px-3 py-1 text-center">
        CHAT APP
      </h1>

      <div className="p-3">
        <label className="input input-bordered flex items-center gap-2">
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

      <div className="flex gap-5 justify-between p-3">
        <div className="flex gap-3 items-center">
          <div className="avatar">
            <div className="ring-primary ring-offset-base-100 w-10 rounded-full ring ring-offset-2">
              <img src={userProfile?.avatar} />
            </div>
          </div>
          <div>
            <h2 className="text-white">{userProfile?.fullName}</h2>
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
