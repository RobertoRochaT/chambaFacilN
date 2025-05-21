// Refactorización de MessageLoading.jsx con estilo moderno y centrado

import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const MessageLoading = () => {
  return (
    <div className="flex justify-center items-center w-full h-[66vh] bg-white">
      <AiOutlineLoading3Quarters
        size={24}
        className="animate-spin text-indigo-600"
      />
    </div>
  );
};

export default MessageLoading;