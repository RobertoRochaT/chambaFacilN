// Refactorización de Member.jsx con estilo limpio y responsivo

import React, { useState } from "react";
import MemberAdd from "./MemberAdd";
import MemberRemove from "./MemberRemove";
import { useSelector } from "react-redux";

const Member = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const [memberAddBox, setMemberAddBox] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3 text-slate-800 bg-white">
      <h2 className="text-lg font-semibold text-center mb-4">
        Members ({selectedChat?.users?.length || 0})
      </h2>

      {memberAddBox ? (
        <MemberAdd setMemberAddBox={setMemberAddBox} />
      ) : (
        <MemberRemove setMemberAddBox={setMemberAddBox} />
      )}
    </div>
  );
};

export default Member;
