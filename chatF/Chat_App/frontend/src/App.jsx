import React, { useEffect, useState, useLocation } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import store from "./redux/store";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Error from "./pages/Error";
import ProfileDetail from "./components/ProfileDetail";
import Loading from "./components/loading/Loading";
import GroupChatBox from "./components/chatComponents/GroupChatBox";
import NotificationBox from "./components/NotificationBox";

const AppLayout = () => {
  const [toastPosition, setToastPosition] = useState("bottom-left");
  const { isProfileDetail, isGroupChatBox, isNotificationBox, isLoading } = useSelector(
    (state) => state.condition
  );

  useEffect(() => {
    const updatePosition = () => {
      setToastPosition(window.innerWidth >= 600 ? "bottom-left" : "top-left");
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <ToastContainer
        position={toastPosition}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        stacked
        limit={3}
        toastStyle={{
          border: "1px solid #e2e8f0",
          textTransform: "capitalize",
        }}
      />

      <Header />
      <div className="h-16 md:h-20" />

      <main className="flex-1 p-4 bg-gray-50">
        <Outlet />
        {isProfileDetail && <ProfileDetail />}
        {isGroupChatBox && <GroupChatBox />}
        {isNotificationBox && <NotificationBox />}
        {isLoading && <Loading />}
      </main>

      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/chat", element: <Home /> }, // This will handle query params
      { path: "/signup", element: <SignUp /> },
      { path: "/signin", element: <SignIn /> },
      { path: "*", element: <Error /> },
    ],
    errorElement: <Error />,
  },
]);

const App = () => (
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

export default App;
