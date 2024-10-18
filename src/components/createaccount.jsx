import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirection
import Navbar from './navbar';  // Import Navbar component
import Font from 'react-font';

const Register = () => {
  const [form, setForm] = useState({ fullname: '', email: '', password: '', birthdate: '', level: '' });
  const [message, setMessage] = useState('');  // State for success or error message
  const navigate = useNavigate();  // Initialize useNavigate for redirection

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const isOldEnough = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;  // Adjust age if the birthdate hasn't passed this year
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user is at least 16 years old
    if (isOldEnough(form.birthdate) < 16) {
      setMessage('You must be at least 16 years old to create an account.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Account created successfully:', data);

        // Set success message
        setMessage('Account created successfully! Redirecting to sign-in...');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/');  // Redirect to login page ("/")
        }, 1000);
      } else {
        const errorData = await response.json();  // Parse the error message
        setMessage(errorData.error);  // Display the error message from the backend
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <Font family='Poppins'>
      <div>
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center bg-gray-300">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

            {/* Display success or error message */}
            {message && (
              <p className={`text-center mb-4 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="fullname"
                type="text"
                placeholder="Full Name"
                onChange={handleChange}
                value={form.fullname}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={form.email}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                value={form.password}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              
              <label className="block text-gray-700">Date of Birth</label>
              <input
                name="birthdate"
                type="date"
                onChange={handleChange}
                value={form.birthdate}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />

              {/* New dropdown for skill level */}
              <label className="block text-gray-700">Football Skill Level</label>
              <select
                name="level"
                onChange={handleChange}
                value={form.level}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select your level</option>
                <option value="Good">Good</option>
                <option value="Medium">Medium</option>
                <option value="Mediocre">Mediocre</option>
              </select>

              <button
                type="submit"
                className="w-full bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </Font>
  );
};

export default Register;
