import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoFootballOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("fullname", data.user.fullname);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("birthdate", data.user.birthdate);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("token", data.token);
        console.log("Logged in successfully");
        navigate("/available-matches");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section with solid background */}
      <div className="w-full lg:w-1/3 bg-blue-900 flex flex-col items-center justify-center space-y-4 p-8">
        <IoFootballOutline className="text-9xl text-white" />
        <h3 className="text-4xl font-bold text-center text-white tracking-wider">FOOT5FR</h3>
      </div>

      {/* Right Section with form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
            Sign In
          </h2>

          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input with Enhanced Floating Label */}
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder=" "
                onChange={handleChange}
                value={form.email}
                className="peer w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <label className="absolute left-3 top-1 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:scale-90 peer-focus:text-blue-500">
                E-mail
              </label>
            </div>

            {/* Password Input with Enhanced Floating Label and Eye Icon */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                onChange={handleChange}
                value={form.password}
                className="peer w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <label className="absolute left-3 top-1 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:scale-90 peer-focus:text-blue-500">
                Password
              </label>
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-800"
            >
              Sign in
            </button>
          </form>

          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <Link to="/create-account" className="text-blue-500 hover:underline">
                Create now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
