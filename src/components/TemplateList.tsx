"use client";

import { useEffect, useState } from "react";

interface LabelTemplate {
  _id: string;
  name: string;
  width: number;
  height: number;
  createdAt: string;
}

interface TemplateListProps {
  userId: string;
}

const TemplateList = ({ userId }: TemplateListProps) => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTemplates();
    }
  }, [userId]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/label-template?userId=${userId}`);
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Label Templates</h2>

      {loading ? (
        <p className="text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-gray-500">No templates found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Width (mm)</th>
                <th className="border border-gray-300 px-4 py-2">Height (mm)</th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{template.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{template.width}</td>
                  <td className="border border-gray-300 px-4 py-2">{template.height}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplateList;
