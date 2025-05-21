import { createSlice } from "@reduxjs/toolkit";

const myChatSlice = createSlice({
  name: "myChat",
  initialState: {
    chat: [],
    selectedChat: null,
    newMessageRecieved: [], // Make sure this is initialized as an empty array
  },
  reducers: {
    addMyChat: (state, action) => {
      state.chat = action.payload;
    },
    addSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    deleteSelectedChat: (state, action) => {
      state.chat = state.chat.filter((c) => c._id !== action.payload);
      if (state.selectedChat && state.selectedChat._id === action.payload) {
        state.selectedChat = null;
      }
    },
    addNewChat: (state, action) => {
      // Check if chat already exists
      const chatExists = state.chat.some(c => c._id === action.payload._id);
      if (!chatExists) {
        state.chat = [action.payload, ...state.chat];
      }
    },
    // Fix the newMessageRecieved reducer
    addNewMessageRecieved: (state, action) => {
      // Only add if it's not a duplicate
      const messageExists = state.newMessageRecieved.some(m => m._id === action.payload._id);
      if (!messageExists) {
        console.log("Adding notification for message:", action.payload);
        state.newMessageRecieved = [action.payload, ...state.newMessageRecieved];
      }
    },
    removeNewMessageRecieved: (state, action) => {
      state.newMessageRecieved = state.newMessageRecieved.filter(
        (message) => message._id !== action.payload._id
      );
    },
  },
});

export const {
  addMyChat,
  addSelectedChat,
  deleteSelectedChat,
  addNewChat,
  addNewMessageRecieved,
  removeNewMessageRecieved,
} = myChatSlice.actions;
export default myChatSlice.reducer;