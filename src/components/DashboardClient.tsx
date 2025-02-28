"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductModal from "@/components/ProductModal";
import ProductList from "@/components/ProductList";

interface DashboardClientProps {
  userId: string;
  userName: string;
}

export default function DashboardClient({ userId, userName }: DashboardClientProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {

    async function fetchTemplates() {
      try {
        const res = await fetch(`/api/label-template?userId=${userId}`);
        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    }
    fetchTemplates();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName}!</h1>
          <p className="text-gray-600">Manage your products efficiently.</p>
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-md shadow-md mb-6">
          <select
            className="p-2 border rounded-md"
            value={selectedTemplate || ""}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Select Template</option>
            {templates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        <ProductList userId={userId} selectedTemplate={selectedTemplate} />
        <ProductModal userId={userId} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
