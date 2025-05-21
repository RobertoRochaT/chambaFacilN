// Refactorización de MemberAdd.jsx con estilo moderno y claro

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { setChatLoading, setLoading } from "../../redux/slices/conditionSlice";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { ChatShimmerSmall } from "../loading/ChatShimmer";
import { IoCheckmarkCircleOutline, IoPersonAddOutline } from "react-icons/io5";
import { VscError } from "react-icons/vsc";

const MemberAdd = ({ setMemberAddBox }) => {
  const dispatch = useDispatch();
  const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [inputUserName, setInputUserName] = useState("");
  const [addUserName, setAddUserName] = useState("");
  const [addUserId, setAddUserId] = useState("");

  useEffect(() => {
    const getAllUsers = () => {
      dispatch(setChatLoading(true));
      const token = localStorage.getItem("token");
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          setUsers(json.data || []);
          setSelectedUsers(json.data || []);
          dispatch(setChatLoading(false));
        })
        .catch((err) => {
          console.log(err);
          dispatch(setChatLoading(false));
        });
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    setSelectedUsers(
      users.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(inputUserName.toLowerCase())
      )
    );
  }, [inputUserName]);

  const handleAddUser = (userId, userName) => {
    if (selectedChat?.users?.find((user) => user?._id === userId)) {
      toast.warn(`${userName} is already added`);
      setAddUserId("");
      setAddUserName("");
      return;
    }
    setAddUserId(userId);
    setAddUserName(userName);
  };

  const handleAddUserCall = () => {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/groupadd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: addUserId, chatId: selectedChat?._id }),
    })
      .then((res) => res.json())
      .then((json) => {
        toast.success(`${addUserName} added successfully`);
        setAddUserId("");
        setAddUserName("");
        dispatch(addSelectedChat(json?.data));
        dispatch(setLoading(false));
        setMemberAddBox(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        dispatch(setLoading(false));
      });
  };

  return (
    <div className="p-4 text-slate-800 relative">
      <div className="text-center text-base font-medium mb-4">
        Total Users ({users.length || 0})
      </div>

      <button
        onClick={() => setMemberAddBox(false)}
        className="absolute top-4 left-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
      >
        <FaArrowLeft size={14} title="Back" />
      </button>

      <div className="flex gap-2 items-center mb-4">
        <input
          id="search"
          type="text"
          placeholder="Search users..."
          value={inputUserName}
          onChange={(e) => setInputUserName(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <label htmlFor="search" className="text-indigo-600 cursor-pointer">
          <FaSearch title="Search" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {selectedUsers.length === 0 && isChatLoading ? (
          <ChatShimmerSmall />
        ) : selectedUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No users found.</div>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user?._id}
              className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user?.profileImage || "https://via.placeholder.com/40?text=User"}
                  alt="User"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40?text=User";
                  }}
                />
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={() => handleAddUser(user?._id, user?.firstName)}
                title="Add User"
                className="p-2 rounded-full border hover:bg-indigo-100 text-indigo-600"
              >
                <IoPersonAddOutline />
              </button>
            </div>
          ))
        )}
      </div>

      {addUserName && (
        <div className="fixed bottom-3 left-0 w-full px-4">
          <div className="max-w-md mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-4 flex justify-between items-center">
            <p className="text-sm font-medium">
              Confirm addition of '{addUserName}'?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAddUserName("");
                  setAddUserId("");
                }}
                className="p-1.5 rounded-full border hover:bg-gray-100"
              >
                <VscError size={18} />
              </button>
              <button
                onClick={handleAddUserCall}
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

export default MemberAdd;