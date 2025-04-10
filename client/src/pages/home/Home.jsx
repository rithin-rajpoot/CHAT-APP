import React, { useEffect } from "react";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSocket,
  setOnlineUsers,
} from "../../store/slice/socket/socketSlice";
import { setNewMessage } from "../../store/slice/message/messageSlice";

const Home = () => {

  const dispatch = useDispatch();
  const {isAuthenticated, userProfile} = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);

  // whenever a user logins, the socket is initialized and the userId of logged in user is sent to the server
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(initializeSocket(userProfile?._id));
  }, [isAuthenticated]);

  // simultaneously we recieve all the online users from server
  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (onlineUsers) => { // all connected users are recieved from the server and saved in the state
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (newMessage) => { // all messages are recieved from the server and saved in the state
      dispatch(setNewMessage(newMessage));
    });

    return () =>{
      socket.close();
    }

  }, [socket]);

  return (
    <div className="flex">
      <UserSidebar />
      <MessageContainer />
    </div>
  );
};

export default Home;
