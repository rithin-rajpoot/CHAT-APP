import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../../store/slice/message/messageThunk.js";
import { setMessages } from "../../store/slice/message/messageSlice.js";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import ClearingChatSkeleton from "../skeletons/ClearingChatSkeleton.jsx";
import NoMessages from "../skeletons/NoMessages.jsx";
import { format } from "date-fns";
import toast from "react-hot-toast";

const MessageContainer = () => {
  const { messages, screenLoading, clearChatLoading } = useSelector(
    (state) => state.messageReducer
  );
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUser?._id) {
      // Clear previous messages when switching to a different user
      dispatch(setMessages());
      
      dispatch(getMessagesThunk({ receiverId: selectedUser?._id })).catch(
        (error) => {
          toast.error("Failed to load messages");
          console.error("Error loading messages:", error);
        }
      );
    } else {
      // Clear messages when no user is selected
      dispatch(setMessages());
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (socket) {
      socket.on("typing", ({ senderId }) => {
        // console.log('Received typing event from:', senderId, 'selectedUser:', selectedUser?._id);
        if (senderId === selectedUser?._id) {
          // console.log('Setting isTyping to true');
          setIsTyping(true);
        }
      });

      socket.on("stopTyping", ({ senderId }) => {
        // console.log('Received stopTyping event from:', senderId, 'selectedUser:', selectedUser?._id);
        if (senderId === selectedUser?._id) {
          // console.log('Setting isTyping to false');
          setIsTyping(false);
        }
      });

      return () => {
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [socket, selectedUser]);

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Centralized typing functions to pass down to SendMsg
  const handleTyping = () => {
    if (socket && selectedUser && userProfile) {
      // console.log('Emitting typing event:', { senderId: userProfile._id, receiverId: selectedUser._id });
      socket.emit("typing", {
        senderId: userProfile._id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedUser && userProfile) {
      // console.log('Emitting stopTyping event:', { senderId: userProfile._id, receiverId: selectedUser._id });
      socket.emit("stopTyping", {
        senderId: userProfile._id,
        receiverId: selectedUser._id,
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    if (!Array.isArray(messages)) return {};

    const groups = {};
    messages.forEach((message) => {
      const date = format(new Date(message.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (screenLoading) return <MessageSkeleton />;
  if (clearChatLoading) return <ClearingChatSkeleton />;

  const groupedMessages = groupMessagesByDate(messages || []);

  return (
    <>
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-full flex flex-col pb-10">
          <div className="px-2 py-2 border-b border-b-primary/30 sticky top-0 bg-base-100 z-10">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div
            ref={messagesContainerRef}
            className={`overflow-y-auto p-3 transition-all duration-300 ease-in-out ${
              isTyping ? "h-[calc(100%-2rem)] pb-6" : "h-full pb-3"
            }`}
          >
            {!messages || messages.length === 0 ? (
              <NoMessages />
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="mb-4">
                  <div className="text-center text-xs text-gray-500 mb-2">
                    {format(new Date(date), "MMMM d, yyyy")}
                  </div>
                  {dateMessages.map((message) => (
                      <Message key={message?._id} messageDetails={message} />
                    ))}
                </div>
              ))
            )}
            {/* {console.log('isTyping state:', isTyping)} */}
            {isTyping && (
              <div className="text-xs text-gray-500 italic animate-pulse flex gap-2 mb-2 items-center">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      alt="Tailwind CSS chat bubble component"
                      src={selectedUser.avatar || "/avatar.png"}
                    />
                  </div>
                </div>
                {selectedUser?.fullName} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <SendMsg onTyping={handleTyping} onStopTyping={handleStopTyping} />
        </div>
      )}
    </>
  );
};

export default MessageContainer;
