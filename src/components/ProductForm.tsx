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
    productNameEst: "",
    unit: "gm", // Default unit
    packetPrice: "",
    pricePerUnit: "", // Automatically computed
    height: "100", // Default label height
    width: "50",  // Default label width
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to calculate price per unit and update state
  // Function to calculate price per unit and update state
const calculatePricePerUnit = (packetSize: string, unit: string, packetPrice: string) => {
  let pricePerUnit;
  let compareUnit = unit; // Default compare unit is the selected unit

  const size = parseFloat(packetSize);
  const price = parseFloat(packetPrice);

  if (isNaN(size) || isNaN(price) || size <= 0 || price <= 0) {
    return { pricePerUnit: "", compareUnit: "" };
  }

  // Convert to standard unit and calculate price per standard unit
  switch (unit) {
    case "gm":
      pricePerUnit = (price / size) * 1000; // Convert gm to kg
      compareUnit = "kg";
      break;
    case "ml":
      pricePerUnit = (price / size) * 1000; // Convert ml to ltr
      compareUnit = "ltr";
      break;
    case "kg":
    case "ltr":
      pricePerUnit = price / size; // Direct calculation
      compareUnit = unit;
      break;
    case "tk":
      pricePerUnit = price / size;
      compareUnit = "tk";
      break;
    default:
      pricePerUnit = "";
      compareUnit = "";
  }

  // return { pricePerUnit: pricePerUnit.toFixed(2), compareUnit };
  return {
    pricePerUnit: typeof pricePerUnit === 'number' ? pricePerUnit.toFixed(2) : pricePerUnit,
    compareUnit
  };
};


  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedProduct = { ...product, [name]: value };

    if (name === "packetSize" || name === "unit" || name === "packetPrice") {
      const { pricePerUnit } = calculatePricePerUnit(
        updatedProduct.packetSize,
        updatedProduct.unit,
        updatedProduct.packetPrice
      );
      updatedProduct.pricePerUnit = pricePerUnit;
    }

    setProduct(updatedProduct);
  };

  // Handle form submission
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
      productNameEst: "",
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
          type="text"
          name="productNameEst"
          placeholder="Product Name Est"
          value={product.productNameEst}
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

        {/* Automatically calculated field for price per unit */}
        <div className="w-full p-2 border rounded bg-gray-100 text-gray-600">
  Price Per Unit: {product.pricePerUnit ? `${product.pricePerUnit} / ${product.unit === "gm" ? "kg" : product.unit === "ml" ? "ltr" : product.unit}` : "N/A"}
</div>


        

        

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
