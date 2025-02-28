"use client";
import { useState, useEffect } from "react";

interface Product {
  _id: string;
  brandName: string;
  productName: string;
  packetSize: string;
  unit: string;
  packetPrice: number;
  pricePerUnit: string;
}

interface ProductListProps {
  userId: string;
  selectedTemplate: string | null;
}

export default function ProductList({ userId, selectedTemplate }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [printLoading, setPrintLoading] = useState(false);

  console.log(selectedTemplate)
  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?userId=${userId}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch("/api/products", {
        method: "DELETE",
        body: JSON.stringify({ productId: id }),
        headers: { "Content-Type": "application/json" },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product._id);
    setEditValues(product); // Initialize edit fields with product data
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const saveProductChanges = async () => {
    if (!editingProductId) return;

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        body: JSON.stringify({ productId: editingProductId, ...editValues }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to update product:", await res.json());
        return;
      }

      setEditingProductId(null);
      fetchProducts(); // Refresh list after update
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts(selectedProducts.length === products.length ? [] : products.map((p) => p._id));
  };

  // Update the handlePrintLabels function in your ProductList component:

const handlePrintLabels = async () => {
  if (!selectedTemplate) {
    alert("Please select a template first");
    return;
  }

  if (selectedProducts.length === 0) {
    alert("Please select at least one product to print labels");
    return;
  }

  try {
    setPrintLoading(true);
    
    // Get the selected products data
    const productsToPrint = products.filter(product => 
      selectedProducts.includes(product._id)
    );
    
    console.log("Sending print request with:", {
      templateId: selectedTemplate,
      productsCount: productsToPrint.length,
      userId
    });
    
    // Make API call to print labels
    const response = await fetch("/api/print-labels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId: selectedTemplate,
        products: productsToPrint,
        userId: userId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Print API error response:", errorData);
      throw new Error(errorData.error || "Failed to print labels");
    }
    
    // If your API returns HTML data directly
    const content = await response.text();
    
    // Create a new window with the content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert("Please allow pop-ups to print labels");
    }

  } catch (error : any) {
    console.error("Error printing labels:", error);
    alert(`Failed to print labels: ${error.message}`);
  } finally {
    setPrintLoading(false);
  }
};

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Product List</h2>
        
        <button 
          onClick={handlePrintLabels}
          disabled={!selectedTemplate || selectedProducts.length === 0 || printLoading}
          className={`flex items-center px-4 py-2 rounded ${
            !selectedTemplate || selectedProducts.length === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {printLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Labels ({selectedProducts.length})
            </>
          )}
        </button>
      </div>

      {!selectedTemplate && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          Please select a template from the dropdown above to print labels.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.length === products.length} 
                    onChange={toggleSelectAll}
                    disabled={!selectedTemplate} 
                  />
                </th>
                <th className="border border-gray-300 px-4 py-2">Brand Name</th>
                <th className="border border-gray-300 px-4 py-2">Product Name</th>
                <th className="border border-gray-300 px-4 py-2">Packet Size</th>
                <th className="border border-gray-300 px-4 py-2">Unit</th>
                <th className="border border-gray-300 px-4 py-2">Packet Price</th>
                <th className="border border-gray-300 px-4 py-2">Price per Unit</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product._id)} 
                      onChange={() => toggleSelectProduct(product._id)} 
                      disabled={!selectedTemplate}
                    />
                  </td>

                  {editingProductId === product._id ? (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        <input type="text" name="brandName" value={editValues.brandName || ""} onChange={handleEditChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input type="text" name="productName" value={editValues.productName || ""} onChange={handleEditChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input type="text" name="packetSize" value={editValues.packetSize || ""} onChange={handleEditChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select name="unit" value={editValues.unit || ""} onChange={handleEditChange} className="w-full p-1 border rounded">
                          <option value="gm">gm</option>
                          <option value="kg">kg</option>
                          <option value="ltr">ltr</option>
                          <option value="ml">ml</option>
                          <option value="tk">tk</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input type="number" name="packetPrice" value={editValues.packetPrice || ""} onChange={handleEditChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input type="text" name="pricePerUnit" value={editValues.pricePerUnit || ""} onChange={handleEditChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button onClick={saveProductChanges} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Save</button>
                        <button onClick={() => setEditingProductId(null)} className="ml-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 px-4 py-2">{product.brandName}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.productName}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.packetSize}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.unit}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.packetPrice}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.pricePerUnit}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button onClick={() => handleEditClick(product)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Edit</button>
                        <button onClick={() => deleteProduct(product._id)} className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProducts.length > 0 && selectedTemplate && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          {selectedProducts.length} product(s) selected for printing
        </div>
      )}
    </div>
  );
}