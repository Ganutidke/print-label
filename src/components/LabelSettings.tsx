"use client";
import { useState, useEffect } from "react";

interface LabelSettingsProps {
  userId: string;
}

export default function LabelSettings({ userId }: LabelSettingsProps) {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(40);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Array<{name: string, width: number, height: number}>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    // Fetch all templates for the user
    fetch(`/api/label-template?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.templates) {
          setTemplates(data.templates);
        }
        setLoading(false);
      });
  }, [userId]);

  // Load selected template data when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.name === selectedTemplate);
      if (template) {
        setName(template.name);
        setWidth(template.width);
        setHeight(template.height);
      }
    }
  }, [selectedTemplate, templates]);

  const saveTemplate = async () => {
    if (!name.trim()) {
      alert("Please enter a template name");
      return;
    }

    await fetch("/api/label-template", {
      method: "POST",
      body: JSON.stringify({ userId, name, width, height }),
      headers: { "Content-Type": "application/json" },
    });
    
    // Refresh templates after saving
    const res = await fetch(`/api/label-template?userId=${userId}`);
    const data = await res.json();
    if (data && data.templates) {
      setTemplates(data.templates);
    }
    
    alert("Label template saved!");
  };

  const createNewTemplate = () => {
    setName("");
    setWidth(100);
    setHeight(50);
    setSelectedTemplate("");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Label Settings</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {templates.length > 0 && (
            <div className="mb-4">
              <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Template
              </label>
              <div className="flex gap-2">
                <select
                  id="templateSelect"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Select a template --</option>
                  {templates.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={createNewTemplate}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  New
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-1">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              id="templateName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter template name"
            />
          </div>
          
          <div className="mb-2">
            <label htmlFor="templateWidth" className="block text-sm font-medium text-gray-700 mb-1">
              Width (mm)
            </label>
            <input
              id="templateWidth"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="mb-2">
            <label htmlFor="templateHeight" className="block text-sm font-medium text-gray-700 mb-1">
              Height (mm)
            </label>
            <input
              id="templateHeight"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={saveTemplate}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}