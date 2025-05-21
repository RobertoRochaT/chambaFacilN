// Refactorización de MyChat.jsx con diseño moderno y limpio

import React, { useEffect } from "react";
import { FaPenAlt } from "react-icons/fa";
import { VscCheckAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { addMyChat, addSelectedChat } from "../../redux/slices/myChatSlice";
import {
  setChatLoading,
  setGroupChatBox,
} from "../../redux/slices/conditionSlice";
import ChatShimmer from "../loading/ChatShimmer";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { SimpleDateAndTime, SimpleTime } from "../../utils/formateDateTime";
import { toast } from "react-toastify";

const MyChat = () => {
  const dispatch = useDispatch();
  const myChat = useSelector((store) => store.myChat.chat);
  const authUserId = useSelector((store) => store?.auth?._id);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
  const newMessageId = useSelector((store) => store?.message?.newMessageId);
  const isGroupChatId = useSelector((store) => store.condition.isGroupChatId);
  const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved);

  // Update the useEffect that fetches chats

  useEffect(() => {
    dispatch(setChatLoading(true));
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No token found");
      dispatch(setChatLoading(false));
      return;
    }
    
    console.log("Fetching chats with token:", token.substring(0, 10) + "...");
    
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Chat fetch failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        console.log("Chats loaded:", json.data?.length || 0);
        if (json.data) {
          dispatch(addMyChat(json.data));
        } else {
          console.warn("No chat data received:", json);
        }
        dispatch(setChatLoading(false));
      })
      .catch(err => {
        console.error("Error fetching chats:", err);
        dispatch(setChatLoading(false));
        toast.error("Failed to load chats");
      });
  }, [newMessageId, isGroupChatId, dispatch]);

  // Helper function to count unread messages for a chat
  const getUnreadCount = (chatId) => {
    return newMessageRecieved.filter(msg => msg.chat._id === chatId).length;
  };

  // Helper function to determine read status for outgoing messages
  const getMessageStatus = (chat) => {
    if (!chat) return "";
    
    const message = chat.latestMessage;
    if (!message || !message.sender) return "";
    
    if (message.sender._id !== authUserId) return "";
    
    // Different status codes - can be enhanced with actual backend data later
    return message.read ? "read" : "delivered";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
        <h2 className="text-base font-semibold text-slate-800">My Chats</h2>
        <button
          onClick={() => dispatch(setGroupChatBox())}
          className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 text-slate-700"
        >
          <span>New Group</span>
          <FaPenAlt size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {myChat.length === 0 && isChatLoading ? (
          <ChatShimmer />
        ) : myChat.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Start a new conversation.</div>
        ) : (
          myChat.map((chat) => {
          const unreadCount = getUnreadCount(chat._id);
          const messageStatus = getMessageStatus(chat); // Pass the whole chat object
                      
            return (
              <div
                key={chat?._id}
                onClick={() => dispatch(addSelectedChat(chat))}
                className={`flex items-center gap-3 p-3 mb-2 rounded-lg border cursor-pointer transition ${
                  selectedChat?._id === chat?._id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : unreadCount > 0
                    ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-slate-800 font-medium"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-slate-800"
                }`}
              >
                <div className="relative">
                  <img
                    src={getChatImage(chat, authUserId) || "https://via.placeholder.com/48?text=Chat"}
                    alt="avatar"
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/48?text=Chat";
                    }}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`truncate ${unreadCount > 0 ? "font-semibold" : "font-medium"}`}>
                      {getChatName(chat, authUserId)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {chat?.latestMessage && SimpleTime(chat?.latestMessage?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs truncate">
                    {chat?.latestMessage?.sender?._id === authUserId && (
                      <span className="flex items-center">
                        {messageStatus === "read" ? (
                          <VscCheckAll size={14} className="text-blue-500" />
                        ) : messageStatus === "delivered" ? (
                          <VscCheckAll size={14} className="text-gray-500" />
                        ) : (
                          <VscCheckAll size={14} className="text-gray-400" /> 
                        )}
                      </span>
                    )}
                    <span className={`text-gray-500 truncate ${unreadCount > 0 ? "font-medium text-slate-700" : ""}`}>
                      {chat?.latestMessage?.message || SimpleDateAndTime(chat?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyChat;