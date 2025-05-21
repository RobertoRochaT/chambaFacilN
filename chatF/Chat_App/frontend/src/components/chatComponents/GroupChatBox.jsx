// Refactorización de GroupChatBox.jsx con diseño moderno y limpio

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setChatLoading,
  setGroupChatBox,
  setGroupChatId,
  setLoading,
} from "../../redux/slices/conditionSlice";
import { MdOutlineClose } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import ChatShimmer from "../loading/ChatShimmer";
import { handleScrollEnd } from "../../utils/handleScrollTop";
import { toast } from "react-toastify";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import socket from "../../socket/socket";

const GroupChatBox = () => {
  const groupUser = useRef(null);
  const dispatch = useDispatch();
  const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
  const authUserId = useSelector((store) => store?.auth?._id);
  const [isGroupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [inputUserName, setInputUserName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupUsers, setGroupUsers] = useState([]);

// Update this function in GroupChatBox.jsx
useEffect(() => {
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    console.log("Fetching users with token:", token.substring(0, 10) + "...");
    
    try {
      // Fix the endpoint URL to match your actual backend route
      // Send the user and the email in the request body
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const json = await response.json();
      console.log("Users API response:", json);
      
      if (json.success && json.data) {
        setUsers(json.data);
      } else {
        console.error("No users found in response:", json);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  fetchUsers();
}, []);
// Modify the user filtering in the existing useEffect
useEffect(() => {
  setSelectedUsers(
    users.filter((user) => {
      // Handle different user data formats
      const firstName = user.firstName || user.name?.split(' ')[0] || '';
      const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
      const email = user.email || '';
      
      return `${firstName} ${lastName} ${email}`
        .toLowerCase()
        .includes(inputUserName.toLowerCase());
    })
  );
}, [inputUserName, users]);

// Also update the user display in the render method
{selectedUsers.map((user) => (
  <div
    key={user?._id}
    onClick={() => {
      addGroupUser(user);
      setInputUserName("");
    }}
    className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
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
      <p className="text-sm font-medium text-slate-800">
        {user?.firstName || user?.name?.split(' ')[0] || ''} {user?.lastName || user?.name?.split(' ').slice(1).join(' ') || ''}
      </p>
      <p className="text-xs text-gray-500">
        {user?.email || 'No email available'}
      </p>
    </div>
  </div>
))}

  useEffect(() => {
    setSelectedUsers(
      users.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(inputUserName.toLowerCase())
      )
    );
  }, [inputUserName]);

  useEffect(() => {
    handleScrollEnd(groupUser.current);
  }, [isGroupUsers]);

  const addGroupUser = (user) => {
    if (!isGroupUsers.find((curr) => curr._id === user._id)) {
      setGroupUsers([...isGroupUsers, user]);
    } else {
      toast.warn(`"${user?.firstName}" already added`);
    }
  };

  const handleRemoveGroupUser = (removeUserId) => {
    setGroupUsers(isGroupUsers.filter((user) => user._id !== removeUserId));
  };

  const handleCreateGroupChat = () => {
    if (isGroupUsers.length < 2) {
      toast.warn("Please select at least 2 users");
      return;
    } else if (!isGroupName.trim()) {
      toast.warn("Please enter group name");
      return;
    }

    dispatch(setGroupChatBox());
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: isGroupName.trim(),
        users: isGroupUsers,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(addSelectedChat(json?.data));
        dispatch(setGroupChatId(json?.data?._id));
        dispatch(setLoading(false));
        socket.emit("chat created", json?.data, authUserId);
        toast.success("Created & Selected chat");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        dispatch(setLoading(false));
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">
        <h2 className="text-xl font-semibold text-center mb-4 text-slate-800">Create a Group</h2>

        <div className="flex items-center gap-2 mb-4">
          <input
            value={inputUserName}
            onChange={(e) => setInputUserName(e.target.value)}
            placeholder="Search users..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="text-indigo-600" />
        </div>

        <div
          ref={groupUser}
          className="flex gap-2 overflow-x-auto mb-4 pb-2 border-b border-gray-200"
        >
          {isGroupUsers.map((user) => (
            <div
              key={user?._id}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border"
            >
              <span>{user?.firstName}</span>
              <button
                onClick={() => handleRemoveGroupUser(user?._id)}
                className="hover:text-red-500"
                title={`Remove ${user?.firstName}`}
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="h-64 overflow-y-auto mb-4">
          {selectedUsers.length === 0 && isChatLoading ? (
            <ChatShimmer />
          ) : selectedUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No users found.</p>
          ) : (
            selectedUsers.map((user) => (
              <div
                key={user?._id}
                onClick={() => {
                  addGroupUser(user);
                  setInputUserName("");
                }}
                className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
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
                  <p className="text-sm font-medium text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {SimpleDateAndTime(user?.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Group name"
            onChange={(e) => setGroupName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateGroupChat}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
          >
            Create
          </button>
        </div>

        <button
          onClick={() => dispatch(setGroupChatBox())}
          title="Close"
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
        >
          <MdOutlineClose size={22} />
        </button>
      </div>
    </div>
  );
};

export default GroupChatBox;
