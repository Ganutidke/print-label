"use client";

import {  useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default  function Navbar() {
  const router = useRouter();


    

  const handleLogout = async () => {
    await signOut();
    router.push("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold cursor-pointer" onClick={() => router.push("/dashboard")}>
          Product Manager
        </h1>

        <ul className="flex space-x-6">
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
              Upload excel
            </button>
          </li>
          <li>
            <button onClick={() => router.push("/dashboard/product-list")} className="hover:text-gray-300">
              Product List
            </button>
          </li>
          <li>
            <button onClick={() => router.push("/dashboard/label-generator")} className="hover:text-gray-300">
              Label Generator
            </button>
          </li>
          <li>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">
              Logout
              {/* {session && <span> ({session.user?.name})</span>} */}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
