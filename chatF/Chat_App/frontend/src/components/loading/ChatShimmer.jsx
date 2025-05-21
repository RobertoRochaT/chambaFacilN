// Refactorización de ChatShimmer y ChatShimmerSmall para estilo moderno

import React from "react";

const ChatShimmer = () => {
  return (
    <div className="space-y-3 w-full">
      {Array(10)
        .fill("")
        .map((_, idx) => (
          <div
            key={idx}
            className="w-full h-16 flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-gray-200 animate-pulse"
          >
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export const ChatShimmerSmall = () => {
  return (
    <div className="space-y-3 w-full">
      {Array(10)
        .fill("")
        .map((_, idx) => (
          <div
            key={idx}
            className="w-full h-12 flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-gray-200 animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 h-3 rounded bg-gray-200"></div>
            <div className="h-8 w-8 rounded bg-gray-200"></div>
          </div>
        ))}
    </div>
  );
};

export default ChatShimmer;