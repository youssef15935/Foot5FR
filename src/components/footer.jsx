import React from "react";
import {
  AiFillFacebook,
  AiFillTwitterCircle,
  AiFillInstagram,
} from "react-icons/ai"; // Social media icons

const Footer = () => {
  return (
    <footer className="bg-blue-900 p-1">
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center text-white space-y-4 lg:space-y-0 ">
        {/* Social Media Icons */}
        <div className="flex items-center space-x-5 ">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <AiFillFacebook className="text-3xl" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <AiFillTwitterCircle className="text-3xl" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <AiFillInstagram className="text-3xl" />
          </a>
          <div className="  text-gray-300 text-sm">
            © {new Date().getFullYear()} FOOT5FR. All rights reserved.
          </div>
        </div>
      </div>

      {/* Copyright Section */}
    </footer>
  );
};

export default Footer;
