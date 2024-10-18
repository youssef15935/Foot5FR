import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import the useNavigate and Link
import { IoFootballOutline } from "react-icons/io5";  // Football icon
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for show/hide password

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const navigate = useNavigate(); // Initialize useNavigate hook for redirection

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear error message when submitting the form

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        // Store userId and token in localStorage
        localStorage.setItem("fullname", data.user.fullname);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("birthdate", data.user.birthdate);
        localStorage.setItem("userId", data.user._id); // Store user ID
        localStorage.setItem("token", data.token); // Store the auth token
        console.log("Logged in successfully");

        // Redirect to available matches after login is successful
        navigate("/available-matches");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error); // Display the error message from the backend
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later."); // General error handling
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section with solid background */}
      <div className="w-1/3 bg-blue-900 flex flex-col items-center justify-center space-y-4 p-8">
        <IoFootballOutline className="text-9xl text-white" />
        <h3 className="text-4xl font-bold text-center text-white tracking-wider">FOOT5FR</h3>
      </div>

      {/* Right Section with form */}
      <div className="w-2/3 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
            Sign In
          </h2>

          {/* Display error message if exists */}
          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              onChange={handleChange}
              value={form.email}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />

            {/* Password Input with Eye Icon */}
            <div className="relative w-full rm">
              <input
                name="password"
                type={showPassword ? "text" : "password"}  // Toggle between text and password
                placeholder="Password"
                onChange={handleChange}
                value={form.password}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              {/* Show/Hide Password Icon */}
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
              <a href="/forgot-password" className="text-blue-500">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-800"
            >
              Sign in
            </button>
          </form>

          {/* Link to Create Account */}
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
