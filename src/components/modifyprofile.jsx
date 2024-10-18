import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';  // Import the Navbar component

const ModifyProfile = () => {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    birthdate: '',
    password: ''
  });
  const [photoFile, setPhotoFile] = useState(null);  // State to store uploaded photo
  const [message, setMessage] = useState('');  // State to store message
  const [messageType, setMessageType] = useState('');  // State to store message type (success or error)
  const navigate = useNavigate();  // Initialize the useNavigate hook

  useEffect(() => {
    const currentUser = {
      fullname: localStorage.getItem('fullname'),
      email: localStorage.getItem('email'),
      birthdate: localStorage.getItem('birthdate'),
    };

    setForm((prevState) => ({
      ...prevState,
      fullname: currentUser.fullname || '',
      email: currentUser.email || '',
      birthdate: currentUser.birthdate || '',
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePhotoUpload = async () => {
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/upload-photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage('Profile photo uploaded successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 2000);
      } else {
        throw new Error("Failed to upload photo");
      }
    } catch (error) {
      setMessage('Error uploading photo');
      setMessageType('error');
    }
  };

  const handleDeletePhoto = async () => {
    const userId = localStorage.getItem("userId");

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/delete-photo`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); // Set success message
        setMessageType('success');
      } else {
        throw new Error("Failed to delete photo");
      }
    } catch (error) {
      setMessage('Error deleting photo');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');  // Get token from localStorage
  
    try {
      const response = await fetch(`http://localhost:5000/api/users/update/${localStorage.getItem('userId')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Send token for authorization
        },
        body: JSON.stringify(form),  // Send the updated form data
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Update localStorage with new profile data
        localStorage.setItem('fullname', data.fullname);
        localStorage.setItem('email', data.email);
        localStorage.setItem('birthdate', data.birthdate);
  
        // Set success message and handle redirection
        setMessage('Profile updated successfully!');
        setMessageType('success');
        
        // Upload photo if selected
        if (photoFile) {
          handlePhotoUpload();
        }
        
        setTimeout(() => {
          navigate('/profile');  // Redirect to profile page after 2 seconds
        }, 2000);
  
      } else {
        setMessage('Error updating profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleChooseImage = () => {
    // If no file is selected, display an error message
    if (!photoFile) {
      setMessage('Please choose a photo');
      setMessageType('error');
      return;
    }

    handlePhotoUpload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />  {/* Add the Navbar component */}
      <div className="relative w-full h-full bg-cover bg-center" 
           style={{
              backgroundImage: "url('https://lestadium-multisports.fr/files/resize/outside/500-500-five-foot_33fd78a7c38c2e27d1c4c001e6c81221.jpeg')", 
              filter: 'blur(15px)', 
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -1,
            }}>
      </div>
      <div className="flex justify-center py-12 px-8">
        <div className="relative w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Modify Profile</h2>
          
          {/* Display message (success or error) */}
          {message && (
            <p
              className={`text-center mb-4 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="fullname"
              type="text"
              value={form.fullname}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              name="birthdate"
              type="date"
              value={form.birthdate}
              disabled   // Birthdate is pre-filled but disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="New Password (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />

            {/* File Input for Photo */}
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-2">Profile Photo</label>
              <input
                type="file"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <div className="flex space-x-3 mt-4">
                
                
                {/* Delete Profile Image Button */}
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 p-3 rounded-lg hover:bg-red-500 focus:outline-none transition duration-300 w-full"
                  onClick={handleDeletePhoto}
                >
                  Delete Profile Image
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-800"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModifyProfile;
