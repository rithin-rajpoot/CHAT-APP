import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../../store/slice/message/messageThunk";
const SendMsg = () => {
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const { selectedUser } = useSelector((state) => state.userReducer);

  const handleSendMessage = () => {
    dispatch(sendMessageThunk({ receiverId: selectedUser?._id, message }));
    setMessage("");
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
        />
        <button
          onClick={handleSendMessage}
          className="btn btn-square btn-outline btn-primary"
        >
          <IoSend />
        </button>
      </div>
    </>
  );
};

export default SendMsg;
