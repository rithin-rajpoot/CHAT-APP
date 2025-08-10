import React, { useEffect } from "react";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSocket,
  setOnlineUsers,
} from "../../store/slice/socket/socketSlice";
import { setMessages, setNewMessage } from "../../store/slice/message/messageSlice";
import { useWindowWidth } from "@react-hook/window-size";
import { updateDeletedUser } from "../../store/slice/user/userSlice";

const Home = () => {

  const onlyWidth = useWindowWidth();
  const { selectedUser } = useSelector((state) => state.userReducer);

  const isMobile = onlyWidth < 768; // Tailwind md breakpoint

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

    socket.on("userDeleted", (userId) => {
      dispatch(updateDeletedUser(userId));
    })

    socket.on('clearedChat', () => {
      dispatch(setMessages());
    })

    return () =>{
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("userDeleted");
      socket.off('clearedChat');
    }

  }, [socket]);

  return (
     <div className="w-full h-[calc(100vh-4rem)] flex">
      {/* Large screen - show both */}
      {!isMobile && (
        <>
          <UserSidebar />
          <MessageContainer />
        </>
      )}

      {/* Small screen - conditional */}
      {isMobile && (
        <>
          {!selectedUser ? <UserSidebar /> : <MessageContainer />}
        </>
      )}
    </div>
  );
};

export default Home;
