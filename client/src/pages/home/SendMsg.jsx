import React, { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../../store/slice/message/messageThunk";
import { setNewMessage } from "../../store/slice/message/messageSlice";
const SendMsg = ({ onTyping, onStopTyping }) => {
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { buttonLoading } = useSelector((state) => state.messageReducer);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Stop typing when sending message
    if (onStopTyping) {
      onStopTyping();
    }
    
    dispatch(sendMessageThunk({ receiverId: selectedUser?._id, message }));
    setMessage("");
  };

  const handleInputChange = (e) => {
    // console.log('handleInputChange called');
    const value = e.target.value;
    setMessage(value);

    if (onTyping && selectedUser && userProfile) {
      // console.log('Calling onTyping function');
      onTyping();

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        // console.log('Calling onStopTyping function after timeout');
        if (onStopTyping) {
          onStopTyping();
        }
      }, 3000);
    } else {
      console.log('Missing data for typing:', { onTyping: !!onTyping, selectedUser: !!selectedUser, user: !!userProfile });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="w-full p-3 flex gap-2 fixed bottom-0">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-primary w-full"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {buttonLoading ? (
          <button className="btn btn-square loading loading-spinner loading-xs md:loading-sm"></button>
        ) : (
          <button
            onClick={handleSendMessage}
            className="btn btn-square btn-outline btn-primary"
          >
            <IoSend />
          </button>
        )}
      </div>
    </>
  );
};

export default SendMsg;
