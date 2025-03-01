"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // State to toggle mobile menu

  const handleLogout = async () => {
    await signOut();
    router.push("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo or Title */}
        <h1
          className="text-xl font-semibold cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Product Manager
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden block text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <button onClick={() => router.push("/dashboard")} className="hover:text-gray-300">
              Home
            </button>
          </li>
          <li>
            <button onClick={() => router.push("/dashboard/templates")} className="hover:text-gray-300">
              Create Template
            </button>
          </li>
          <li>
            <button onClick={() => router.push("/dashboard/uploadExcel")} className="hover:text-gray-300">
              Upload Excel
            </button>
          </li>
          <li>
            <button onClick={() => router.push("/dashboard/product-list")} className="hover:text-gray-300">
              Product List
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden flex flex-col   mt-2 space-y-2 bg-gray-900 p-4 rounded-md">
          <button onClick={() => router.push("/dashboard")} className="block text-white hover:text-gray-300">
            Home
          </button>
          <button onClick={() => router.push("/dashboard/templates")} className="block text-white hover:text-gray-300">
            Create Template
          </button>
          <button onClick={() => router.push("/dashboard/uploadExcel")} className="block text-white hover:text-gray-300">
            Upload Excel
          </button>
          <button onClick={() => router.push("/dashboard/product-list")} className="block text-white hover:text-gray-300">
            Product List
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition w-full text-center"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
