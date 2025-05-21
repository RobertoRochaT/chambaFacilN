// Refactorización de MemberRemove.jsx con estilo moderno y claro

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoCheckmarkCircleOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
} from "react-icons/io5";
import { VscError } from "react-icons/vsc";
import { CiCircleInfo } from "react-icons/ci";
import { toast } from "react-toastify";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { setLoading } from "../../redux/slices/conditionSlice";

const MemberRemove = ({ setMemberAddBox }) => {
  const dispatch = useDispatch();
  const authUserId = useSelector((store) => store?.auth?._id);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [removeUserName, setRemoveUserName] = useState("");
  const [removeUserId, setRemoveUserId] = useState("");

  const handleRemoveUser = (userId, userName) => {
    setRemoveUserId(userId);
    setRemoveUserName(userName);
  };

  const handleRemoveUserCall = () => {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/groupremove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: removeUserId,
        chatId: selectedChat?._id,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        toast.success(`${removeUserName} removed successfully`);
        setRemoveUserId("");
        setRemoveUserName("");
        dispatch(addSelectedChat(json?.data));
        dispatch(setLoading(false));
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        dispatch(setLoading(false));
      });
  };

  return (
    <div className="p-4 text-slate-800">
      {selectedChat?.groupAdmin?._id === authUserId && (
        <button
          onClick={() => setMemberAddBox(true)}
          className="w-full flex items-center gap-3 border border-indigo-500 text-indigo-600 rounded-lg px-4 py-2 mb-4 hover:bg-indigo-50"
        >
          <IoPersonAddOutline size={18} />
          <span className="font-medium">Add members</span>
        </button>
      )}

      <div className="divide-y divide-gray-200">
        {selectedChat?.users?.map((user) => (
          <div
            key={user?._id}
            className="flex items-center gap-4 py-3"
          >
            <img
              src={user?.profileImage || "https://via.placeholder.com/40?text=User"}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40?text=User";
              }}
            />
            <div className="flex-1">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              {user?._id === selectedChat?.groupAdmin?._id && (
                <p className="text-xs text-indigo-500">Admin</p>
              )}
            </div>
            {user?._id !== selectedChat?.groupAdmin?._id && (
              <>
                {selectedChat?.groupAdmin?._id === authUserId ? (
                  <button
                    onClick={() => handleRemoveUser(user?._id, user?.firstName)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 border border-red-300"
                    title="Remove user"
                  >
                    <IoPersonRemoveOutline size={18} />
                  </button>
                ) : (
                  <CiCircleInfo
                    size={20}
                    className="text-gray-400 cursor-not-allowed"
                    title="Not allowed"
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {removeUserName && (
        <div className="fixed bottom-3 left-0 w-full px-4">
          <div className="max-w-md mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-4 flex justify-between items-center">
            <p className="text-sm font-medium">
              Confirm removal of '{removeUserName}'?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRemoveUserName("");
                  setRemoveUserId("");
                }}
                className="p-1.5 rounded-full border hover:bg-gray-100"
              >
                <VscError size={18} />
              </button>
              <button
                onClick={handleRemoveUserCall}
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

export default MemberRemove;