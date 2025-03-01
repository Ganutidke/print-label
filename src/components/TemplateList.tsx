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
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LabelTemplate>>({});

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

  const handleEditClick = (template: LabelTemplate) => {
    setEditingTemplateId(template._id);
    setEditValues(template);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const saveTemplateChanges = async () => {
    if (!editingTemplateId) return;

    try {
      const res = await fetch(`/api/label-template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });

      if (!res.ok) throw new Error("Failed to update template");

      fetchTemplates();
      setEditingTemplateId(null);
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/label-template`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete template");

      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
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
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-100">
                  {editingTemplateId === template._id ? (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="name"
                          value={editValues.name || ""}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          name="width"
                          value={editValues.width || ""}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          name="height"
                          value={editValues.height || ""}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={saveTemplateChanges}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTemplateId(null)}
                          className="ml-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 px-4 py-2">{template.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{template.width}</td>
                      <td className="border border-gray-300 px-4 py-2">{template.height}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => handleEditClick(template)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id)}
                          className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
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
