// Refactorización de NotificationBox.jsx para UI moderna

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSelectedChat,
  removeNewMessageRecieved,
} from "../redux/slices/myChatSlice";
import { setNotificationBox } from "../redux/slices/conditionSlice";
import { MdOutlineClose } from "react-icons/md";
import { SimpleDateAndTime } from "../utils/formateDateTime";
import getChatName from "../utils/getChatName";

const NotificationBox = () => {
  const authUserId = useSelector((store) => store?.auth?._id);
  const dispatch = useDispatch();
  const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved);
  
  console.log("Notification box rendering with messages:", newMessageRecieved);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 text-center mb-4">
          Notifications
        </h2>

        {newMessageRecieved.length > 0 && (
          <p className="text-sm text-slate-600 text-center mb-3">
            You have {newMessageRecieved.length} new notification{newMessageRecieved.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {newMessageRecieved.length === 0 ? (
            <div className="text-center text-slate-500 p-4 border border-dashed border-gray-200 rounded-lg">
              No new notifications
            </div>
          ) : (
            newMessageRecieved.map((message) => (
              <div
                key={message?._id}
                className="border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  dispatch(removeNewMessageRecieved(message));
                  dispatch(addSelectedChat(message?.chat));
                  dispatch(setNotificationBox(false));
                }}
              >
                <p className="text-sm text-slate-700">
                  <strong>New message</strong>
                  {message?.chat?.isGroupChat && (
                    <span> in <strong>{getChatName(message?.chat, authUserId)}</strong></span>
                  )}
                  {" from "}
                  <strong>{message?.sender?.firstName}</strong>
                  {": "}
                  <span className="text-indigo-600 font-medium">
                    {message?.message}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {SimpleDateAndTime(message?.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          title="Close"
          onClick={() => dispatch(setNotificationBox(false))}
          className="absolute top-3 right-3 text-slate-500 hover:text-red-500"
        >
          <MdOutlineClose size={22} />
        </button>
      </div>
    </div>
  );
};

export default NotificationBox;