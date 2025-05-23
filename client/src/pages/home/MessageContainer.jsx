import React, { useEffect } from "react";
import User from "./User.jsx";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../../store/slice/message/messageThunk.js";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";

const MessageContainer = () => {
  const { messages } = useSelector((state) => state.messageReducer);

  const { selectedUser } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessagesThunk({ receiverId: selectedUser?._id }));
    }
  }, [selectedUser?._id]);

  return (
    <>
      {!selectedUser ? (
        <div className="w-full flex items-center justify-center flex-col gap-3 font-semibold">
          <h2>Welcome to Gup Shup</h2>
          <p>Please select a user to chat!!</p>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col">
          <div className="px-2 py-1 border-b border-b-white/10">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div className="h-full overflow-y-auto p-3">
            {messages
              ?.filter(
                (message) =>
                  message.senderId === selectedUser._id ||
                  message.receiverId === selectedUser._id
              )
              .map((message) => (
                <Message key={message._id} messageDetails={message} />
              ))}
          </div>
          <SendMsg />
        </div>
      )}
    </>
  );
};

export default MessageContainer;
