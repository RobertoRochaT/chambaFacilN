// Refactorización de Loading.jsx con diseño moderno y clara visualización

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/conditionSlice";

const Loading = () => {
  const dispatch = useDispatch();
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowCancel(true), 10000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center text-slate-300">
      <div id="loader" className="mb-6"></div>
      {showCancel && (
        <button
          onClick={() => dispatch(setLoading(false))}
          className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md border border-slate-700 hover:bg-black/80 transition"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default Loading;