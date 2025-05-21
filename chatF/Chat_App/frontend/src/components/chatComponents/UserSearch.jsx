// Refactorización de UserSearch.jsx con diseño moderno y limpio

import React, { useEffect, useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  setChatLoading,
  setLoading,
  setUserSearchBox,
} from "../../redux/slices/conditionSlice";
import { toast } from "react-toastify";
import ChatShimmer from "../loading/ChatShimmer";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import socket from "../../socket/socket";

const UserSearch = () => {
  const dispatch = useDispatch();
  const isChatLoading = useSelector((store) => store?.condition?.isChatLoading);
  const authUserId = useSelector((store) => store?.auth?._id);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [inputUserName, setInputUserName] = useState("");
  const [searchError, setSearchError] = useState(false);

 // Update this function in UserSearch.jsx

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("UserSearch: Fetching users");
        dispatch(setChatLoading(true));
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token available");
          setSearchError(true);
          dispatch(setChatLoading(false));
          return;
        }
        
        // Try the standard endpoint first
        let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        // If that fails, try the debug endpoint
        if (!response.ok) {
          console.log("Standard endpoint failed, trying debug endpoint");
          response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/debug/users`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const json = await response.json();
        console.log("UserSearch: Users result", json);
        
        if (json.data && Array.isArray(json.data)) {
          setUsers(json.data);
        } else if (json.success && Array.isArray(json.data)) {
          setUsers(json.data);
        } else {
          console.log("No users found or invalid format");
          setSearchError(true);
        }
      } catch (error) {
        console.error("UserSearch: Error fetching users:", error);
        setSearchError(true);
      } finally {
        dispatch(setChatLoading(false));
      }
    };

    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    setSelectedUsers(
      users.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(inputUserName.toLowerCase())
      )
    );
  }, [inputUserName, users]);

  const handleCreateChat = async (userId) => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create chat");
      }
      
      const json = await response.json();
      
      if (!json?.data) {
        throw new Error("Invalid response from server");
      }
      
      dispatch(addSelectedChat(json.data));
      socket.emit("chat created", json.data, authUserId);
      toast.success("Chat created successfully");
      dispatch(setUserSearchBox());
    } catch (err) {
      console.error("Error creating chat:", err);
      toast.error(err.message || "Failed to create chat");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRetry = () => {
    setSearchError(false);
    dispatch(setChatLoading(true));
    // Re-fetch users
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
        console.error(err);
        setSearchError(true);
        dispatch(setChatLoading(false));
      });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
        <h2 className="text-base font-semibold">Start New Chat</h2>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search users..."
            value={inputUserName}
            onChange={(e) => setInputUserName(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {selectedUsers.length === 0 && isChatLoading ? (
          <ChatShimmer />
        ) : searchError ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load users</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : selectedUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No users found</div>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user?._id}
              onClick={() => handleCreateChat(user._id)}
              className="flex items-center gap-3 p-3 mb-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.firstName}'s avatar`}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
              ) : (
                <FaUserCircle className="h-12 w-12 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400">
                  {SimpleDateAndTime(user?.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearch;