import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Font from 'react-font';

const Register = () => {
  const [form, setForm] = useState({ fullname: '', email: '', password: '', birthdate: '', level: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        setMessage('Account created successfully! Redirecting to sign-in...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Font family="Poppins">
      <div>
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center bg-gray-300">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

            {message && (
              <p className={`text-center mb-4 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name Field with Floating Label */}
              <div className="relative">
                <input
                  name="fullname"
                  type="text"
                  placeholder=" "
                  onChange={handleChange}
                  value={form.fullname}
                  className="peer w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <label className="absolute left-3 -top-2.5 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:scale-90 peer-focus:text-blue-500">
                  Full Name
                </label>
              </div>

              {/* Email Field with Floating Label */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder=" "
                  onChange={handleChange}
                  value={form.email}
                  className="peer w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <label className="absolute left-3 -top-2.5 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:scale-90 peer-focus:text-blue-500">
                  Email
                </label>
              </div>

              {/* Password Field with Floating Label */}
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  placeholder=" "
                  onChange={handleChange}
                  value={form.password}
                  className="peer w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <label className="absolute left-3 -top-2.5 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:scale-90 peer-focus:text-blue-500">
                  Password
                </label>
              </div>

              {/* Date of Birth Field with Floating Label */}
              <div className="relative">
                <input
                  name="birthdate"
                  type="date"
                  placeholder=" "
                  onChange={handleChange}
                  value={form.birthdate}
                  className="peer w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <label className="absolute left-3 -top-2.5 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:scale-90 peer-focus:text-blue-500">
                  Date of Birth
                </label>
              </div>

              {/* Football Skill Level Field with Floating Label */}
              <div className="relative">
                <select
                  name="level"
                  onChange={handleChange}
                  value={form.level}
                  className="peer w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  required
                >
                  <option value="" disabled></option>
                  <option value="Good">Good</option>
                  <option value="Medium">Medium</option>
                  <option value="Mediocre">Mediocre</option>
                </select>
                <label className="absolute left-3 -top-2.5 text-gray-500 text-sm transition-all bg-white px-1 -translate-y-1/2 transform scale-100 origin-left pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:scale-90 peer-focus:text-blue-500">
                  Football Skill Level
                </label>
              </div>

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
