import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import socket from "../../socket/socket";

import {
  setChatDetailsBox,
  setMessageLoading,
} from "../../redux/slices/conditionSlice";
import { addAllMessages } from "../../redux/slices/messageSlice";
import { addSelectedChat, removeNewMessageRecieved } from "../../redux/slices/myChatSlice";
import getChatName, { getChatImage } from "../../utils/getChatName";

import AllMessages from "./AllMessages";
import MessageSend from "./MessageSend";
import MessageLoading from "../loading/MessageLoading";
import ChatDetailsBox from "../chatDetails/ChatDetailsBox";

const MessageBox = ({ chatId }) => {
  const dispatch = useDispatch();
  const chatDetailsBox = useRef(null);
  const [isExiting, setIsExiting] = useState(false);

  // Fix selectors to use correct paths
  const isChatDetailsBox = useSelector((store) => store?.condition?.isChatDetailsBox);
  const isMessageLoading = useSelector((store) => store?.condition?.isMessageLoading);
  const allMessage = useSelector((store) => store?.message?.message);
  const authUserId = useSelector((store) => store?.auth?._id);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  // Fix the path to newMessageRecieved based on your actual Redux store structure
  const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved || []);

  useEffect(() => {
    const getMessage = (chatId) => {
      dispatch(setMessageLoading(true));
      const token = localStorage.getItem("token");

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          dispatch(addAllMessages(json?.data || []));
          dispatch(setMessageLoading(false));
          socket.emit("join chat", selectedChat._id);
        })
        .catch((err) => {
          console.error(err);
          dispatch(setMessageLoading(false));
          toast.error("Message Loading Failed");
        });
    };

    getMessage(chatId);
  }, [chatId, dispatch, selectedChat]);

  const handleClickOutside = (event) => {
    if (
      chatDetailsBox.current &&
      !chatDetailsBox.current.contains(event.target)
    ) {
      setIsExiting(true);
      setTimeout(() => {
        dispatch(setChatDetailsBox(false));
        setIsExiting(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (isChatDetailsBox) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatDetailsBox, dispatch]);

  // Fix the useEffect for marking messages as read
  useEffect(() => {
    if (!chatId) return;
    
    const markMessagesAsRead = async () => {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/read/${chatId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Clear notifications for this chat
        const notificationsForChat = newMessageRecieved.filter(
          msg => msg.chat._id === chatId
        );
        
        notificationsForChat.forEach(message => {
          dispatch(removeNewMessageRecieved(message));
        });
        
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };
    
    markMessagesAsRead();
    
    // Set up interval to periodically mark messages as read while chat is open
    const readInterval = setInterval(markMessagesAsRead, 5000);
    
    return () => clearInterval(readInterval);
  }, [chatId, dispatch]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div
        className="px-4 py-3 border-b bg-white flex items-center justify-between text-slate-800 shadow-sm"
        onClick={() => dispatch(setChatDetailsBox(true))}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(addSelectedChat(null));
            }}
            className="sm:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <FaArrowLeft size={16} />
          </button>

          <img
            src={getChatImage(selectedChat, authUserId) || "https://via.placeholder.com/48?text=Chat"}
            alt="Chat Avatar"
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/48?text=Chat";
            }}
          />

          <h1 className="text-lg font-semibold truncate">
            {getChatName(selectedChat, authUserId)}
          </h1>
        </div>
        <CiMenuKebab size={18} className="text-gray-500" />
      </div>

      {isChatDetailsBox && (
        <div
          className={`absolute top-0 left-0 z-30 w-full max-w-[50vw] transition-all duration-500 ${
            isExiting ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0"
          }`}
        >
          <div
            ref={chatDetailsBox}
            className="h-[70vh] max-h-[calc(100vh-150px)] border rounded-lg bg-white shadow-md overflow-y-auto"
          >
            <ChatDetailsBox />
          </div>
        </div>
      )}

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isMessageLoading ? <MessageLoading /> : <AllMessages allMessage={allMessage} />}
      </div>

      <MessageSend chatId={chatId} />
    </div>
  );
};

export default MessageBox;