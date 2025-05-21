import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import { CiCircleInfo } from "react-icons/ci";
import { RxUpdate } from "react-icons/rx";
import { toast } from "react-toastify";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { setLoading } from "../../redux/slices/conditionSlice";

const Overview = () => {
  const dispatch = useDispatch();
  const authUserId = useSelector((store) => store?.auth?._id);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [changeNameBox, setChangeNameBox] = useState(false);
  const [changeName, setChangeName] = useState(selectedChat?.chatName || "");

  const handleShowNameChange = () => {
    if (authUserId === selectedChat?.groupAdmin?._id) {
      setChangeNameBox(!changeNameBox);
      setChangeName(selectedChat?.chatName);
    } else {
      toast.warn("You're not admin");
    }
  };

  const handleChangeName = () => {
    setChangeNameBox(false);
    if (selectedChat?.chatName === changeName.trim()) {
      toast.warn("Name already taken");
      return;
    } else if (!changeName.trim()) {
      toast.warn("Please enter group name");
      return;
    }
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/rename`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: changeName.trim(), chatId: selectedChat?._id }),
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(addSelectedChat(json?.data));
        dispatch(setLoading(false));
        toast.success("Group name changed");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        dispatch(setLoading(false));
      });
  };

  const displayName = selectedChat?.isGroupChat
    ? selectedChat?.chatName || "Unnamed Group"
    : getChatName(selectedChat, authUserId) || "Unnamed User";

  return (
    <div className="flex flex-col gap-8 text-gray-800">
      <div className="flex flex-col items-center text-center gap-5">
        <div className="relative">
          <img
            src={getChatImage(selectedChat, authUserId) || "https://via.placeholder.com/128?text=Chat"}
            alt="Chat"
            className="h-32 w-32 rounded-full border-4 border-indigo-100 shadow-md object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/128?text=Chat";
            }}
          />
          {selectedChat?.isGroupChat && (
            <button
              aria-label="Edit group name"
              onClick={handleShowNameChange}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <CiCircleInfo size={20} className="text-indigo-600" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">
            {selectedChat?.isGroupChat ? "Group Chat" : "Private Chat"}
          </p>
        </div>
      </div>

      {changeNameBox && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rename Group Chat</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={changeName}
              onChange={(e) => setChangeName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter new group name"
              autoFocus
            />
            <button
              onClick={handleChangeName}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RxUpdate size={16} />
              Update
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 mt-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Chat Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Created</p>
              <p className="text-sm text-gray-800 mt-1">{SimpleDateAndTime(selectedChat?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-800 mt-1">{SimpleDateAndTime(selectedChat?.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Last Message</p>
              <p className="text-sm text-gray-800 mt-1">
                {selectedChat?.latestMessage 
                  ? SimpleDateAndTime(selectedChat?.latestMessage?.updatedAt)
                  : "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;