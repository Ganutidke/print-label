"use client"
import React, { useEffect, useState } from 'react'
import ProductList from './ProductList';


interface ProductListPageProps {
  userId : string;
}
const ProductListPage = ( {userId} : ProductListPageProps) => {
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
    <>
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

        </div>
          <ProductList userId={userId} selectedTemplate={selectedTemplate} />
    </>
  )
}

export default ProductListPage