import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png"; // Ruta correcta para la importación del logo
import { useDispatch, useSelector } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import handleScrollTop from "../utils/handleScrollTop";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNotificationsActive,
} from "react-icons/md";
import { toast } from "react-toastify";
import {
  setHeaderMenu,
  setLoading,
  setNotificationBox,
  setProfileDetail,
} from "../redux/slices/conditionSlice";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUserCircleLight } from "react-icons/pi";
import { assets } from '../assets/assets'
const Header = () => {
  const user = useSelector((store) => store.auth);
  const isHeaderMenu = useSelector((store) => store?.condition?.isHeaderMenu);
  const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");
  
    // Inicializar userInfo como un objeto vacío
    const [userInfo, setUserInfo] = useState({});
    console.log('User ', user)
    useEffect(() => {
        if (userId) {
          // If userId exists in the URL, fetch user data
          fetch(`${import.meta.env.VITE_BACKEND_URL_USRS}/api/users/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("User not found");
              }
              return res.json();
            })
            .then((json) => {
              setUserInfo(json.data); // Save the user data
            })
            .catch((err) => {
              console.error("Error fetching user data:", err);
              toast.error("Error fetching user data");
            });
        }
      }, [userId]);
    console.log(userInfo);
  const getAuthUser = (token) => {
    dispatch(setLoading(true));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(addAuth(json.data));
        dispatch(setLoading(false));
      })
      .catch((err) => {
        console.log(err);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    if (token) {
      getAuthUser(token);
      navigate("/");
    } else {
      navigate("/signin");
    }
    dispatch(setHeaderMenu(false));
  }, [token]);

  const { pathname } = useLocation();
  useEffect(() => {
    if (user) {
      navigate("/");
    } else if (pathname !== "/signin" && pathname !== "/signup") {
      navigate("/signin");
    }
    handleScrollTop();
  }, [pathname, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
    navigate("/signin");
  };

  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    const handleScroll = () => {
      let currentScrollPos = window.pageYOffset;
      const header = document.getElementById("header");
      if (header) {
        if (prevScrollPos < currentScrollPos && currentScrollPos > 80) {
          header.classList.add("hiddenbox");
        } else {
          header.classList.remove("hiddenbox");
        }
      }
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerMenuBox = useRef(null);
  const headerUserBox = useRef(null);

  const handleClickOutside = (event) => {
    if (
      headerMenuBox.current &&
      !headerUserBox?.current?.contains(event.target) &&
      !headerMenuBox.current.contains(event.target)
    ) {
      dispatch(setHeaderMenu(false));
    }
  };

  useEffect(() => {
    if (isHeaderMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHeaderMenu]);

  return (
    <header
      id="header"
      className="w-full fixed top-0 z-50 bg-white shadow-md px-6 py-3 flex justify-between items-center text-slate-800"
    >
      <div className="flex items-center gap-3">
        <Link to="/">
          <img
          onClick={() => navigate('/')}
          className='cursor-pointer'
          src={assets.logo}
          alt='logo'
        />
        </Link>
        <Link to="/" className="text-lg font-bold text-indigo-600">
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4 relative">
          <div
            className="relative cursor-pointer"
            title={`You have ${newMessageRecieved.length} new notification(s)`}
            onClick={() => dispatch(setNotificationBox(true))}
          >
            <MdNotificationsActive 
              size={24} 
              className={`${newMessageRecieved.length > 0 ? "text-indigo-600" : "text-gray-500"}`} 
            />
            {newMessageRecieved.length > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 animate-pulse">
                {newMessageRecieved.length}
              </span>
            )}
          </div>

          <div className="text-sm">Hi, {user.firstName}</div>

          <div
            ref={headerUserBox}
            onClick={() => dispatch(setHeaderMenu(!isHeaderMenu))}
            className="flex items-center gap-2 border rounded-full p-1 cursor-pointer hover:shadow-md"
          >
            <img
              src={user?.profileImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='16' r='8' fill='%23ccc'/%3E%3Ccircle cx='20' cy='48' r='20' fill='%23ccc'/%3E%3C/svg%3E"}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='16' r='8' fill='%23ccc'/%3E%3Ccircle cx='20' cy='48' r='20' fill='%23ccc'/%3E%3C/svg%3E";
              }}
            />
            {isHeaderMenu ? (
              <MdKeyboardArrowDown size={20} />
            ) : (
              <MdKeyboardArrowUp size={20} />
            )}
          </div>

          {isHeaderMenu && (
            <div
              ref={headerMenuBox}
              className="absolute top-14 right-0 w-40 bg-white shadow-lg rounded-lg text-sm text-slate-800 border"
            >
              <button
                onClick={() => {
                  dispatch(setHeaderMenu(false));
                  dispatch(setProfileDetail());
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <PiUserCircleLight size={20} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <IoLogOutOutline size={20} /> Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/signin">
          <button className="py-2 px-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all">
            Sign In
          </button>
        </Link>
      )}
    </header>
  );
};

export default Header;
