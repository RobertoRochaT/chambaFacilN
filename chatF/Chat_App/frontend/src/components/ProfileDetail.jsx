// Refactorización de ProfileDetail.jsx con UI coherente y moderna

import React from "react";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setProfileDetail } from "../redux/slices/conditionSlice";
import { toast } from "react-toastify";

const ProfileDetail = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth);

  const handleUpdate = () => {
    toast.warn("Coming soon");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-slate-800">
        <h2 className="text-xl font-semibold text-center mb-4">Your Profile</h2>

        <div className="flex flex-col items-center">
          <img
            src={user.profileImage || "https://via.placeholder.com/80?text=User"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-indigo-500 mb-4 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/80?text=User";
            }}
          />

          <div className="space-y-2 text-center">
            <p className="text-sm">
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Update
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <button
          onClick={() => dispatch(setProfileDetail())}
          title="Close"
          className="absolute top-3 right-3 text-slate-500 hover:text-red-500"
        >
          <MdOutlineClose size={22} />
        </button>
      </div>
    </div>
  );
};

export default ProfileDetail;