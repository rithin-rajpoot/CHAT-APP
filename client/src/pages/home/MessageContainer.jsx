import React, { useEffect } from "react";
import User from "./User.jsx";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../../store/slice/message/messageThunk.js";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import NoChatSelected from "./NoChatSelected.jsx";

const MessageContainer = () => {
  const { messages, screenLoading } = useSelector((state) => state.messageReducer);

  const { selectedUser } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessagesThunk({ receiverId: selectedUser?._id }));
    }
  }, [selectedUser?._id]);

  if(screenLoading) return <MessageSkeleton />

  return (
    <>
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-screen flex flex-col">
          <div className="px-2 py-2 border-b border-b-primary/30">
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
