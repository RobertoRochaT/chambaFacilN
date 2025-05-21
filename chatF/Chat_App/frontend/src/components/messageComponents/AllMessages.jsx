import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { VscCheckAll } from "react-icons/vsc";
import { CgChevronDoubleDown } from "react-icons/cg";
import {
  SimpleDateAndTime,
  SimpleDateMonthDay,
  SimpleTime,
} from "../../utils/formateDateTime";

const AllMessages = ({ allMessage }) => {
  const chatBox = useRef();
  const adminId = useSelector((store) => store.auth?._id);
  const isTyping = useSelector((store) => store?.condition?.isTyping);
  const [scrollShow, setScrollShow] = useState(true);

  const handleScrollDownChat = () => {
    if (chatBox.current) {
      chatBox.current.scrollTo({ top: chatBox.current.scrollHeight });
    }
  };

  useEffect(() => {
    handleScrollDownChat();
    if (chatBox.current.scrollHeight === chatBox.current.clientHeight) {
      setScrollShow(false);
    }
    const handleScroll = () => {
      const currentScrollPos = chatBox.current.scrollTop;
      if (
        currentScrollPos + chatBox.current.clientHeight <
        chatBox.current.scrollHeight - 30
      ) {
        setScrollShow(true);
      } else {
        setScrollShow(false);
      }
    };
    const chatBoxCurrent = chatBox.current;
    chatBoxCurrent.addEventListener("scroll", handleScroll);
    return () => {
      chatBoxCurrent.removeEventListener("scroll", handleScroll);
    };
  }, [allMessage, isTyping]);

  return (
    <div className="relative h-full">
      {scrollShow && (
        <div
          onClick={handleScrollDownChat}
          className="absolute bottom-20 right-4 z-10 bg-white border shadow-md p-2 rounded-full cursor-pointer hover:bg-indigo-50"
        >
          <CgChevronDoubleDown size={20} className="text-indigo-600" />
        </div>
      )}

      <div
        ref={chatBox}
        className="flex flex-col w-full px-4 gap-3 py-4 overflow-y-auto scroll-style h-[66vh] bg-gray-50"
      >
        {allMessage?.map((message, idx) => (
          <Fragment key={`${message._id}-${idx}`}>
            {/* Fecha del mensaje */}
            <div className="sticky top-0 z-10 text-center">
              {new Date(allMessage[idx - 1]?.updatedAt).toDateString() !==
                new Date(message.updatedAt).toDateString() && (
                <span className="text-xs text-gray-600 bg-gray-200 rounded px-3 py-1 inline-block">
                  {SimpleDateMonthDay(message.updatedAt)}
                </span>
              )}
            </div>

            {/* Mensaje individual */}
            <div
              className={`flex ${
                message.sender._id === adminId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.chat.isGroupChat &&
                message.sender._id !== adminId &&
                (allMessage[idx + 1]?.sender._id !== message.sender._id ? (
                  <img
                    src={message.sender.profileImage || "https://via.placeholder.com/32?text=User"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/32?text=User";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 mr-2"></div>
                ))}

                <div
                  className={`relative max-w-[75%] px-4 py-2 ${
                    message.sender._id === adminId
                      ? "bg-indigo-600 text-white ml-auto rounded-xl rounded-tr-none"
                      : "bg-white text-slate-800 border border-gray-200 mr-auto rounded-xl rounded-tl-none"
                  } shadow-sm`}
                >
                  {message.chat.isGroupChat &&
                    message.sender._id !== adminId && (
                      <span className="block text-xs font-semibold text-indigo-700 mb-1">
                        {message.sender.firstName}
                      </span>
                    )}

                  <p className="text-sm leading-relaxed break-words whitespace-pre-line mb-4">
                    {message.message}
                  </p>

                  <div
                    title={SimpleDateAndTime(message.updatedAt)}
                    className="absolute bottom-1 right-2 text-[10px] text-opacity-75 flex items-center gap-1 mt-2"
                  >
                    <span className={message.sender._id === adminId ? "text-white text-opacity-75" : "text-gray-500"}>
                      {SimpleTime(message.updatedAt)}
                    </span>
                    {message.sender._id === adminId && <VscCheckAll size={14} />}
                  </div>
                </div>
            </div>
          </Fragment>
        ))}

        {isTyping && (
          <div className="ml-4 mt-2 flex gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMessages;
