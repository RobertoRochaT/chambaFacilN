import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { checkValidSignUpFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { addAuth } from "../redux/authSlice"; // Adjust the path if your slice is in a different location
const SignUp = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [load, setLoad] = useState("");
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");

    // Initialize userInfo as an empty object
    const [userInfo, setUserInfo] = useState({});

    // Add this to the existing useEffect in SignUp.jsx:

    useEffect(() => {
        // Get both potential IDs from URL
        const queryParams = new URLSearchParams(location.search);
        const userIdFromUrl = queryParams.get("userId");
        const freelancerIdFromUrl = queryParams.get("freelancerId");
        const externalId = userIdFromUrl || freelancerIdFromUrl;
        
        if (!externalId) return;
        
        // First check if this user already exists in our system
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ externalId })
        })
        .then(res => res.json())
        .then(data => {
            // If user exists, store token and redirect to chat
            if (data.exists) {
                localStorage.setItem("token", data.token);
                dispatch(addAuth(data.user));
                navigate("/");
                toast.success("Logged in successfully");
            } else {
                // Try to fetch user data from appropriate endpoint
                const endpoint = freelancerIdFromUrl 
                    ? `${import.meta.env.VITE_BACKEND_URL_USRS}/api/freelancers/chat/${freelancerIdFromUrl}`
                    : `${import.meta.env.VITE_BACKEND_URL_USRS}/api/users/user/${userIdFromUrl}`;
                
                console.log("Fetching user data from:", endpoint);
                
                fetch(endpoint)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('User data not found');
                    }
                    return res.json();
                })
                .then(userData => {
                    if (userData.success && userData.data) {
                        // We have user data, pre-fill the form
                        const user = userData.data;
                        setUserInfo(user);
                        setFirstName(user.firstName || '');
                        setLastName(user.lastName || '');
                        setEmail(user.email || '');
                    }
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                    toast.error(err.message);
                });
            }
        })
        .catch(err => {
            console.error("Error checking user:", err);
            toast.error("Error checking user");
        });
    }, [location.search, navigate, dispatch]);

    const autoRegisterExternalUser = async (e) => {
        if (!userInfo || !userInfo._id) return false;

        toast.loading("Creating your account...");
        e.target.disabled = true;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/external-signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    externalId: userInfo._id,
                    firstName,
                    lastName,
                    email,
                    password,
                    profileImage: userInfo.image || "",
                }),
            });
            
            const json = await response.json();
            toast.dismiss();
            
            if (json.token) {
                localStorage.setItem("token", json.token);
                toast.success("Account created successfully!");
                navigate("/");
                return true;
            } else {
                toast.error(json?.message || "Registration failed");
                e.target.disabled = false;
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            toast.dismiss();
            toast.error("Error: " + (error.message || "Registration failed"));
            e.target.disabled = false;
            return false;
        }
    };

    const signUpUser = async (e) => {
        // If we have a userId from URL, try to auto-register first
        if (userId) {
            const registered = await autoRegisterExternalUser(e);
            if (registered) return;
        }

        toast.loading("Wait until you SignUp");
        e.target.disabled = true;

        // Regular signup process
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                setLoad("");
                e.target.disabled = false;
                toast.dismiss();
                if (json.token) {
                    navigate("/signin");
                    toast.success(json?.message);
                } else {
                    toast.error(json?.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                setLoad("");
                toast.dismiss();
                toast.error("Error: " + (error.code || error.message));
                e.target.disabled = false;
            });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        if (firstName && lastName && email && password) {
            const validError = checkValidSignUpFrom(
                firstName,
                lastName,
                email,
                password
            );
            if (validError) {
                toast.error(validError);
                return;
            }
            setLoad("Loading...");
            signUpUser(e);
        } else {
            toast.error("Required: All Fields");
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-gray-100 px-4 py-12">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8 border border-gray-200">
                {userId ? (
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Complete your registration</h2>
                ) : (
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create your account</h2>
                )}

                <form className="space-y-4" onSubmit={handleSignup}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            readOnly={!!userId && !!email}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type={isShow ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <span
                            onClick={() => setIsShow(!isShow)}
                            className="absolute top-[40px] right-4 text-gray-500 cursor-pointer"
                        >
                            {isShow ? <PiEyeClosedLight size={20} /> : <PiEye size={20} />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={load !== ""}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {load === "" ? (userId ? "Complete Registration" : "Sign Up") : load}
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-sm text-slate-600">Already have an account? </span>
                        <Link to="/signin" className="text-indigo-600 font-medium hover:underline">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
