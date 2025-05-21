// Refactorización de MessageSend.jsx con diseño limpio y funcional

import React, { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaPaperPlane } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
import {
  addNewMessage,
  addNewMessageId,
} from "../../redux/slices/messageSlice";
import { toast } from "react-toastify";
import socket from "../../socket/socket";

let lastTypingTime;

const MessageSend = ({ chatId }) => {
  const mediaFile = useRef();
  const [newMessage, setMessage] = useState("");
  const dispatch = useDispatch();

  const isSendLoading = useSelector((store) => store?.condition?.isSendLoading);
  const isSocketConnected = useSelector((store) => store?.condition?.isSocketConnected);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const isTyping = useSelector((store) => store?.condition?.isTyping);

  useEffect(() => {
    socket.on("typing", () => dispatch(setTyping(true)));
    socket.on("stop typing", () => dispatch(setTyping(false)));
  }, []);

  const handleMediaBox = () => {
    if (mediaFile.current?.files[0]) {
      toast.warn("Coming soon...");
    }
  };

  const handleSendMessage = async () => {
    if (newMessage?.trim()) {
      const message = newMessage.trim();
      setMessage("");
      socket.emit("stop typing", selectedChat._id);
      dispatch(setSendLoading(true));
      const token = localStorage.getItem("token");

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, chatId }),
      })
        .then((res) => res.json())
        .then((json) => {
          dispatch(addNewMessageId(json?.data?._id));
          dispatch(addNewMessage(json?.data));
          socket.emit("new message", json.data);
          dispatch(setSendLoading(false));
        })
        .catch((err) => {
          console.error(err);
          dispatch(setSendLoading(false));
          toast.error("Message Sending Failed");
        });
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isSocketConnected) return;
    if (!isTyping) {
      socket.emit("typing", selectedChat._id);
    }
    lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    const stopTyping = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff > timerLength) {
        socket.emit("stop typing", selectedChat._id);
      }
    }, timerLength);
    return () => clearTimeout(stopTyping);
  };

  return (
    <form
      className="w-full flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="media" className="cursor-pointer text-gray-500 hover:text-indigo-600">
        <FaFolderOpen size={20} title="Open File" />
      </label>
      <input
        ref={mediaFile}
        type="file"
        accept="image/*"
        id="media"
        className="hidden"
        onChange={handleMediaBox}
      />

      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={newMessage}
        onChange={handleTyping}
      />

      <div className="flex items-center justify-center">
        {newMessage.trim() && !isSendLoading && (
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-800 ml-2"
            onClick={handleSendMessage}
          >
            <FaPaperPlane size={18} title="Send" />
          </button>
        )}
        {isSendLoading && (
          <div className="ml-2 animate-spin text-indigo-600">
            <LuLoader size={18} title="Sending..." />
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageSend;