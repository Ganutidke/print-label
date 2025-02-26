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
  height: string;
  width: string;
}

interface ProductListProps {
  userId: string;
}

export default function ProductList({ userId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

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

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    }
  };

  const saveProductChanges = async () => {
    if (!editingProduct) return;

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        body: JSON.stringify({
          productId: editingProduct._id, // Ensure _id is passed as productId
          brandName: editingProduct.brandName,
          productName: editingProduct.productName,
          packetSize: editingProduct.packetSize,
          unit: editingProduct.unit,
          packetPrice: editingProduct.packetPrice,
          pricePerUnit: editingProduct.pricePerUnit,
          height: editingProduct.height,
          width: editingProduct.width,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to update product:", errorData);
        return;
      }

      setEditingProduct(null);
      fetchProducts(); // Refresh list after update
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Product List</h2>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Brand Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Product Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Packet Size
                </th>
                <th className="border border-gray-300 px-4 py-2">Unit</th>
                <th className="border border-gray-300 px-4 py-2">
                  Packet Price
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Price per Unit
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Height (mm)
                </th>
                <th className="border border-gray-300 px-4 py-2">Width (mm)</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-100">
                  {editingProduct && editingProduct._id === product._id ? (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="brandName"
                          value={editingProduct.brandName}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="productName"
                          value={editingProduct.productName}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="packetSize"
                          value={editingProduct.packetSize}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                          name="unit"
                          value={editingProduct.unit}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        >
                          <option value="gm">gm</option>
                          <option value="kg">kg</option>
                          <option value="ltr">ltr</option>
                          <option value="ml">ml</option>
                          <option value="tk">tk</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          name="packetPrice"
                          value={editingProduct.packetPrice}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="pricePerUnit"
                          value={editingProduct.pricePerUnit}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          name="height"
                          value={editingProduct.height}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          name="width"
                          value={editingProduct.width}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={saveProductChanges}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="ml-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.brandName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.productName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.packetSize}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.unit}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.packetPrice}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.pricePerUnit}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.height}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {product.width}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
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
}
