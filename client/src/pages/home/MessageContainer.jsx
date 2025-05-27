import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../../store/slice/message/messageThunk.js";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import ClearingChatSkeleton from "../skeletons/ClearingChatSkeleton.jsx";
import NoMessages from "../skeletons/NoMessages.jsx";

const MessageContainer = () => {
  const { messages, screenLoading, clearChatLoading } = useSelector(
    (state) => state.messageReducer
  );

  const { selectedUser } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessagesThunk({ receiverId: selectedUser?._id }));
    }
  }, [selectedUser?._id]);

  if (screenLoading) return <MessageSkeleton />;
  if (clearChatLoading) return <ClearingChatSkeleton />;

  return (
    <>
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-[100dvh] flex flex-col">
          <div className="px-2 py-2 border-b border-b-primary/30">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div
            className="flex-1 overflow-y-auto p-3"
          >
            {messages?.length === 0 ? (
              <NoMessages />
            ) : (
              messages
                ?.filter(
                  (message) =>
                    message.senderId === selectedUser._id ||
                    message.receiverId === selectedUser._id
                )
                .map((message) => (
                  <Message key={message._id} messageDetails={message} />
                ))
            )}
          </div>
          <SendMsg />
        </div>
      )}
    </>
  );
};

export default MessageContainer;
