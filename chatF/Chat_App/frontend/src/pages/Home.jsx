import React, { useEffect, useState } from "react";
import { MdChat } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import UserSearch from "../components/chatComponents/UserSearch";
import MyChat from "../components/chatComponents/MyChat";
import MessageBox from "../components/messageComponents/MessageBox";
import ChatNotSelected from "../components/chatComponents/ChatNotSelected";
import {
  setChatDetailsBox,
  setSocketConnected,
  setUserSearchBox,
  setLoading,
} from "../redux/slices/conditionSlice";
import socket from "../socket/socket";
import { addAllMessages, addNewMessage } from "../redux/slices/messageSlice";
import { addAuth } from "../redux/slices/authSlice";
import {
  addNewChat,
  addNewMessageRecieved,
  deleteSelectedChat,
} from "../redux/slices/myChatSlice";
import { toast } from "react-toastify";
import { receivedSound } from "../utils/notificationSound";
import { useLocation, useNavigate } from "react-router-dom";
let selectedChatCompare;

const Home = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isUserSearchBox = useSelector(
    (store) => store?.condition?.isUserSearchBox
  );
  const authUserId = useSelector((store) => store?.auth?._id);
  const isAuthenticated = !!authUserId;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const externalUserId = queryParams.get("userId");
  const freelancerId = queryParams.get("freelancerId"); // Add this line

  // Initialize userInfo as an empty object
  const [userInfo, setUserInfo] = useState({});
  const [authProcessed, setAuthProcessed] = useState(false);

  // Handle authentication for external users
  useEffect(() => {
    if (!authUserId) return; // Add this check to ensure we have a user ID
    
    // Store the comparison outside the handler for reference
    selectedChatCompare = selectedChat;
    
    const messageHandler = (newMessageReceived) => {
      console.log("New message received:", newMessageReceived);
      
      // Check if the message is from the current chat
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        // Add to current messages
        dispatch(addNewMessage(newMessageReceived));
      } else {
        // Play sound and add to notifications
        receivedSound();
        dispatch(addNewMessageRecieved(newMessageReceived));
        
        // Show toast notification
        toast.info(`New message from ${newMessageReceived.sender.firstName}`);
      }
    };
    
    // Listen for new messages
    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
    };
  }, [selectedChat, authUserId, dispatch]);
  
  // Then update the handleExternalAuth function in useEffect
  useEffect(() => {
    // Update the handleExternalAuth function
  const handleExternalAuth = async () => {
    if ((!externalUserId && !freelancerId) || authProcessed || isAuthenticated) return;
    
    try {
      console.log("Starting external authentication process");
      let entityData = {};
      const id = externalUserId || freelancerId;
      const isFreelancer = !!freelancerId;
      
      try {
        // Fix: Add /api/ prefix to the URL path
        const apiUrl = isFreelancer 
          ? `${import.meta.env.VITE_BACKEND_URL_USRS}/api/freelancers/${id}/chat` 
          : `${import.meta.env.VITE_BACKEND_URL_USRS}/api/users/${id}/chat`;
        
        console.log(`Fetching entity data from: ${apiUrl}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Entity data response:", result);
        
        if (!result.success) {
          throw new Error(result.message || "Failed to get entity data");
        }
        
        // Extract data from the response (handle both structures)
        entityData = result.data || result.user || {};
        console.log("Extracted entity data:", entityData);
        
        if (!entityData._id) {
          throw new Error("Invalid entity data: missing ID");
        }
      } catch (apiError) {
        console.error("Error fetching entity data:", apiError);
        toast.error(`Failed to fetch user data: ${apiError.message}`);
        setAuthProcessed(true);
        return;
      }
      
      // Rest of the function remains unchanged
      setUserInfo(entityData);
      
      // Now proceed with chat registration using available data
      const registrationData = {
        externalId: entityData._id,
        firstName: entityData.firstName || entityData.name?.split(' ')[0] || "User",
        lastName: entityData.lastName || entityData.name?.split(' ').slice(1).join(' ') || '',
        // Use the original email instead of generating one
        email: entityData.email,
        password: `ext_${entityData._id}`,
        // Make sure to check all possible image field names
        profileImage: entityData.profileImage || entityData.image || ''
      };
      
      console.log("Registering with data:", registrationData);
      
      const regResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/external-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      
      const regData = await regResponse.json();
      
      if (!regResponse.ok) {
        throw new Error(regData.message || "Registration failed");
      }
      
      // Store token and update Redux state
      if (regData.token) {
        localStorage.setItem('token', regData.token);
        
        // Ensure we have the correct data with proper fallbacks
        const userData = {
          _id: regData._id || entityData._id,
          firstName: regData.firstName || entityData.firstName || entityData.name?.split(' ')[0] || "User",
          lastName: regData.lastName || entityData.lastName || entityData.name?.split(' ').slice(1).join(' ') || '',
          // Preserve original email
          email: regData.email || entityData.email,
          // Check all possible image field names with better priority
          profileImage: regData.profileImage || entityData.profileImage || entityData.image || ''
        };
        
        console.log("Setting user data in Redux:", userData);
        dispatch(addAuth(userData));
      }
      
      setAuthProcessed(true);
    } catch (error) {
      console.error("Authentication error details:", error);
      toast.error("Authentication failed: " + error.message);
      setAuthProcessed(true);
    }
  };
    handleExternalAuth();
  }, [externalUserId, freelancerId, authProcessed, isAuthenticated, dispatch, navigate]);

  // Check if user has a valid token
// Update the checkAuth useEffect to handle freelancerId
useEffect(() => {
  const checkAuth = async () => {
    if (authProcessed || isAuthenticated || !localStorage.getItem("token")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(addAuth(data.user));
      } else {
        // If external entity, try to authenticate them
        if (externalUserId || freelancerId) {
          // The handleExternalAuth function will handle this
        } else {
          localStorage.removeItem("token");
          navigate("/signin");
        }
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("token");
      if (!externalUserId && !freelancerId) {
        navigate("/signin");
      }
    } finally {
      setAuthProcessed(true);
    }
  };
  
  checkAuth();
}, [authProcessed, isAuthenticated, dispatch, navigate, externalUserId, freelancerId]);
  
// socket connection
  useEffect(() => {
    if (!authUserId) return;
    socket.emit("setup", authUserId);
    socket.on("connected", () => dispatch(setSocketConnected(true)));
  }, [authUserId, dispatch]);

  // socket message received
  useEffect(() => {
    selectedChatCompare = selectedChat;
    const messageHandler = (newMessageReceived) => {
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        dispatch(addNewMessage(newMessageReceived));
      } else {
        receivedSound();
        dispatch(addNewMessageRecieved(newMessageReceived));
      }
    };
    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
    };
  }, [selectedChat, dispatch]);

  // socket clear chat messages
  useEffect(() => {
    const clearChatHandler = (chatId) => {
      if (chatId === selectedChat?._id) {
        dispatch(addAllMessages([]));
        toast.success("Cleared all messages");
      }
    };
    socket.on("clear chat", clearChatHandler);
    return () => {
      socket.off("clear chat", clearChatHandler);
    };
  }, [selectedChat, dispatch]);

  // socket delete chat messages
  useEffect(() => {
    const deleteChatHandler = (chatId) => {
      dispatch(setChatDetailsBox(false));
      if (selectedChat && chatId === selectedChat._id) {
        dispatch(addAllMessages([]));
      }
      dispatch(deleteSelectedChat(chatId));
      toast.success("Chat deleted successfully");
    };
    socket.on("delete chat", deleteChatHandler);
    return () => {
      socket.off("delete chat", deleteChatHandler);
    };
  }, [selectedChat, dispatch]);

  // socket chat created
  useEffect(() => {
    const chatCreatedHandler = (chat) => {
      dispatch(addNewChat(chat));
      toast.success("Created & Selected chat");
    };
    socket.on("chat created", chatCreatedHandler);
    return () => {
      socket.off("chat created", chatCreatedHandler);
    };
  }, [dispatch]);

  // If not authenticated and not processing auth, redirect to signin
  if (!isAuthenticated && authProcessed && !externalUserId) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="flex w-full h-[80vh] rounded-xl overflow-hidden shadow-lg bg-white">
      {/* Sidebar izquierdo */}
      <div
        className={`flex flex-col w-full sm:w-[35%] bg-gray-50 border-r border-gray-200 relative ${
          selectedChat && "hidden sm:flex"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Mis chats</h2>
          <button
            onClick={() => dispatch(setUserSearchBox())}
            className="p-2 text-indigo-600 hover:text-indigo-800 transition"
            title="Nuevo Chat"
          >
            <MdChat size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isUserSearchBox ? <UserSearch /> : <MyChat />}
        </div>
      </div>

      {/* Panel derecho - mensajes */}
      <div
        className={`flex flex-col w-full sm:w-[65%] bg-white ${
          !selectedChat && "hidden sm:flex"
        }`}
      >
        {selectedChat ? (
          <MessageBox chatId={selectedChat?._id} />
        ) : (
          <ChatNotSelected />
        )}
      </div>
    </div>
  );
};

export default Home;