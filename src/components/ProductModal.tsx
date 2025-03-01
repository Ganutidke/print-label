"use client";
import ProductForm from "./ProductForm";

interface ProductModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ userId, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      {/* Modal Content */}
      <div className="bg-white w-1/3 p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-lg"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Product</h2>
        <ProductForm userId={userId} />
      </div>
    </div>
  );
}
