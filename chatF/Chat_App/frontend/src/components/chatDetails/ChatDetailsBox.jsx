import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CiCircleInfo } from "react-icons/ci";
import { HiOutlineUsers } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import Overview from "./Overview";
import Member from "./Member";
import ChatSetting from "./ChatSetting";

const ChatDetailsBox = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [detailView, setDetailView] = useState("overview");

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      icon: <CiCircleInfo size={20} />,
    },
    ...(selectedChat?.isGroupChat
      ? [
          {
            key: "members",
            label: "Members",
            icon: <HiOutlineUsers size={20} />,
          },
        ]
      : []),
    {
      key: "setting",
      label: "Settings",
      icon: <IoSettingsOutline size={20} />,
    },
  ];

  return (
    <div className="flex w-full h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-3">
        <div className="px-2 pb-2 mb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Chat Details</h3>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setDetailView(tab.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              detailView === tab.key
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 bg-white overflow-y-auto p-6">
        {detailView === "overview" && <Overview />}
        {detailView === "members" && <Member />}
        {detailView === "setting" && <ChatSetting />}
      </div>
    </div>
  );
};

export default ChatDetailsBox;