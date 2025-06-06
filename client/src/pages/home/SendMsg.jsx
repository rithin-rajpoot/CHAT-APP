import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../../store/slice/message/messageThunk";
import { setNewMessage } from "../../store/slice/message/messageSlice";
const SendMsg = () => {
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { buttonLoading } = useSelector((state) => state.messageReducer);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    dispatch(sendMessageThunk({ receiverId: selectedUser?._id, message }));
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent newline if it's a textarea
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="w-full p-3 flex gap-2">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered input-primary w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
