// Refactorización de ChatSetting.jsx con estilo moderno y claro

import React, { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setChatDetailsBox,
  setLoading,
} from "../../redux/slices/conditionSlice";
import { addAllMessages } from "../../redux/slices/messageSlice";
import { deleteSelectedChat } from "../../redux/slices/myChatSlice";
import socket from "../../socket/socket";

const ChatSetting = () => {
  const dispatch = useDispatch();
  const authUserId = useSelector((store) => store?.auth?._id);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [isConfirm, setConfirm] = useState("");

  const isAdmin = authUserId === selectedChat?.groupAdmin?._id;
  const isGroupChat = selectedChat?.isGroupChat;

  const handleClearChat = () => {
    if (isAdmin || !isGroupChat) {
      setConfirm("clear-chat");
    } else {
      toast.warn("You're not admin");
    }
  };

  const handleDeleteGroup = () => {
    if (isAdmin) {
      setConfirm("delete-group");
    } else {
      toast.warn("You're not admin");
    }
  };

  const handleDeleteChat = () => {
    if (!isGroupChat) {
      setConfirm("delete-chat");
    }
  };

  const handleClearChatCall = () => {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/clearChat/${selectedChat?._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setConfirm("");
        dispatch(setLoading(false));
        if (json?.message === "success") {
          dispatch(addAllMessages([]));
          socket.emit("clear chat", selectedChat._id);
          toast.success("Cleared all messages");
        } else {
          toast.error("Failed to clear chat");
        }
      })
      .catch((err) => {
        console.log(err);
        setConfirm("");
        dispatch(setLoading(false));
        toast.error("Failed to clear chat");
      });
  };

  const handleDeleteChatCall = () => {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/deleteGroup/${selectedChat?._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(setLoading(false));
        if (json?.message === "success") {
          dispatch(setChatDetailsBox(false));
          dispatch(addAllMessages([]));
          dispatch(deleteSelectedChat(selectedChat._id));
          socket.emit("delete chat", selectedChat, authUserId);
          toast.success("Chat deleted successfully");
        } else {
          toast.error("Failed to delete chat");
        }
      })
      .catch((err) => {
        console.log(err);
        dispatch(setLoading(false));
        toast.error("Failed to delete chat");
      });
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-slate-800 h-full bg-white overflow-y-auto">
      <h2 className="text-lg font-semibold text-center">Settings</h2>

      <button
        onClick={handleClearChat}
        className="flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
      >
        <span>Clear Chat</span>
        <CiCircleInfo size={16} title="Clear chat" />
      </button>

      {isGroupChat ? (
        <button
          onClick={handleDeleteGroup}
          className="flex justify-between items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
        >
          <span>Delete Group</span>
          <CiCircleInfo size={16} title="Delete group" />
        </button>
      ) : (
        <button
          onClick={handleDeleteChat}
          className="flex justify-between items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
        >
          <span>Delete Chat</span>
          <CiCircleInfo size={16} title="Delete chat" />
        </button>
      )}

      {isConfirm && (
        <div className="fixed bottom-4 left-0 w-full px-4">
          <div
            className={`max-w-md mx-auto border rounded-lg shadow-md px-4 py-3 flex justify-between items-center ${
              isConfirm === "clear-chat" ? "bg-blue-50 border-blue-300" : "bg-red-50 border-red-300"
            }`}
          >
            <p className="text-sm font-medium text-slate-700">
              {isConfirm === "clear-chat"
                ? "Confirm clear chat?"
                : isConfirm === "delete-group"
                ? "Confirm delete group?"
                : "Confirm delete chat?"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm("")}
                className="p-1.5 rounded-full border hover:bg-gray-100"
              >
                <VscError size={18} />
              </button>
              <button
                onClick={
                  isConfirm === "clear-chat"
                    ? handleClearChatCall
                    : handleDeleteChatCall
                }
                className="p-1.5 rounded-full border hover:bg-indigo-100 text-indigo-600"
              >
                <IoCheckmarkCircleOutline size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSetting;
