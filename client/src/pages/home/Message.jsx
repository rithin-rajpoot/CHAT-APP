import React, { use, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { format } from 'date-fns'

const Message = ({ messageDetails }) => {

  const messageRef = useRef(null);
  const time = format(new Date(messageDetails.createdAt), 'HH:mm');

  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  // console.log(userProfile?._id === messageDetails?.senderId) // sender aur user, me hi hoon

  useEffect(() =>{
    if(messageRef.current){
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  },[messageDetails]);

  return (
    <>
      <div
        ref={messageRef}
        className={`chat ${
          userProfile?._id === messageDetails?.senderId
            ? "chat-end"
            : "chat-start"
        }`}
      >
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              alt="Tailwind CSS chat bubble component"
              src={
                userProfile?._id === messageDetails?.senderId
                  ? userProfile?.avatar || "/avatar.png"
                  : selectedUser.avatar || "/avatar.png"
              }
            />
          </div>
        </div>
        <div className="chat-header">
          <time className="text-xs opacity-50">{time}</time>
        </div>
        <div className={`chat-bubble text-xs md:text-sm lg:text-md ${userProfile?._id === messageDetails?.senderId
            ? "bg-primary/30"
            : "bg-secondary/30"}`}>{messageDetails?.message}</div>
      </div>
    </>
  );
};

export default Message;
