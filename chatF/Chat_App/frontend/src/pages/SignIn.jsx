import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import { checkValidSignInFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";

const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [load, setLoad] = useState("");
	const [isShow, setIsShow] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const logInUser = (e) => {
		// SignIn ---
		toast.loading("Wait until you SignIn");
		e.target.disabled = true;
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
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
					localStorage.setItem("token", json.token);
					dispatch(addAuth(json.data));
					navigate("/");
					toast.success(json?.message);
				} else {
					toast.error(json?.message);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				setLoad("");
				toast.dismiss();
				toast.error("Error : " + error.code);
				e.target.disabled = false;
			});
	};
	const handleLogin = (e) => {
		if (email && password) {
			const validError = checkValidSignInFrom(email, password);
			if (validError) {
				toast.error(validError);
				return;
			}
			setLoad("Loading...");
			logInUser(e);
		} else {
			toast.error("Required: All Fields");
		}
	};
	return (
		<div className="flex items-center justify-center min-h-[80vh] bg-gray-100 px-4 py-12">
			<div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8 border border-gray-200">
				<h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Welcome Back</h2>

				<form className="space-y-4" onSubmit={(e) => { handleLogin(e); e.preventDefault(); }}>
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
					<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
					className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

				<div className="flex justify-end text-sm">
					<Link to="#" className="text-indigo-600 hover:underline font-medium">Forgot password?</Link>
				</div>

				<button
					type="submit"
					disabled={load !== ""}
					className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{load === "" ? "Sign In" : load}
				</button>

				<div className="text-center mt-4">
					<span className="text-sm text-slate-600">Don't have an account? </span>
					<Link to="/signup" className="text-indigo-600 font-medium hover:underline">Sign Up</Link>
				</div>
				</form>
			</div>
			</div>

	);
};

export default SignIn;
