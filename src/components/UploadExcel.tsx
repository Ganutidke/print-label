"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

interface UploadExcelProps {
  userId: string;
}

export default function UploadExcel({ userId }: UploadExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result) return;

      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = parsedData.map((item: any) => ({
        userId,
        brandName: item.CompanyName || "Unknown Brand",
        productName: item.ProductDetail,
        packetSize: item.TotalVolume,
        unit: item.VolumeUnit?.toLowerCase() || "unit",
        packetPrice: item.ProductPrice,
        pricePerUnit: item.PricePerVolumeUnit,
        height: item.Height || 100, // Default height
        width: item.Width || 50, // Default width
      }));

      const response = await fetch("/api/products/bulk-upload", {
        method: "POST",
        body: JSON.stringify({ products: formattedData }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        alert("Products uploaded successfully!");
        setFile(null); // Reset file after successful upload
      } else {
        alert("Error uploading products!");
      }

      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white shadow-lg rounded-lg mt-2">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Excel File</h2>

      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="flex flex-col items-center space-y-2">
          <span className="text-gray-500 text-sm">Click to select a file</span>
          {file && <span className="text-gray-600 text-xs">{file.name}</span>}
        </div>
      </label>

      <button
        onClick={handleFileUpload}
        disabled={uploading || !file}
        className={`mt-2 w-full text-white px-4 py-2 rounded-lg transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
