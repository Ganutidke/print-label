"use client";

import { useState } from "react";

interface ProductFormProps {
  userId: string;
}

export default function ProductForm({ userId }: ProductFormProps) {
  const [product, setProduct] = useState({
    brandName: "",
    productName: "",
    packetSize: "",
    unit: "gm", // Default unit
    packetPrice: "",
    pricePerUnit: "",
    height: "100", // Default label height
    width: "50",  // Default label width
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ ...product, userId }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to add product.");
      setLoading(false);
      return;
    }

    alert("Product added successfully!");
    setProduct({
      brandName: "",
      productName: "",
      packetSize: "",
      unit: "gm",
      packetPrice: "",
      pricePerUnit: "",
      height: "100",
      width: "50",
    });

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Product</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="brandName"
          placeholder="Brand Name"
          value={product.brandName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={product.productName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="packetSize"
          placeholder="Packet Size"
          value={product.packetSize}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        {/* Dropdown for Unit Selection */}
        <select
          name="unit"
          value={product.unit}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded bg-white"
        >
          <option value="gm">gm</option>
          <option value="kg">kg</option>
          <option value="ltr">ltr</option>
          <option value="ml">ml</option>
          <option value="tk">tk</option>
        </select>

        <input
          type="number"
          name="packetPrice"
          placeholder="Packet Price"
          value={product.packetPrice}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="pricePerUnit"
          placeholder="Price Per Unit"
          value={product.pricePerUnit}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        {/* New Fields for Label Dimensions */}
        <input
          type="number"
          name="height"
          placeholder="Label Height (mm)"
          value={product.height}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="width"
          placeholder="Label Width (mm)"
          value={product.width}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
