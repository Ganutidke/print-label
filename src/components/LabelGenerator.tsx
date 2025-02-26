"use client";

import { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Product {
  id: string;
  brandName: string;
  productName: string;
  packetSize: string;
  unit: string;
  packetPrice: number;
  pricePerUnit: number;
}

interface LabelTemplate {
  _id: string;
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: Date;
}

interface ProductLabel {
  product: Product;
  width: number;
  height: number;
  x: number;
  y: number;
  templateId: string;
}

export default function LabelGenerator({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductLabel[]>([]);
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  
  // References for preview elements
  const preview1Ref = useRef<HTMLDivElement>(null);
  const preview2Ref = useRef<HTMLDivElement>(null);

  // A4 dimensions in mm
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297 ;

  useEffect(() => {
    if (!userId) return;
    
    async function fetchData() {
      try {
        // Fetch products
        const productRes = await fetch(`/api/products?userId=${userId}`);
        const productData = await productRes.json();
        
        // Make sure products have all required fields
        if (Array.isArray(productData)) {
          setProducts(productData.map(product => ({
            id: product.id || product._id || `temp-${Math.random().toString(36).substring(2, 11)}`,
            brandName: product.brandName || "Brand",
            productName: product.productName || "Product",
            packetSize: product.packetSize || "",
            unit: product.unit || "",
            packetPrice: product.packetPrice || 0,
            pricePerUnit: product.pricePerUnit || 0
          })));
        }
        
        // Fetch label templates
        const labelRes = await fetch(`/api/label-template?userId=${userId}`);
        const labelData = await labelRes.json();
        console.log(labelData);
        
        // Check if templates are in the expected format
        let templatesArray: LabelTemplate[] = [];
        
        if (Array.isArray(labelData)) {
          // Direct array response
          templatesArray = labelData;
        } else if (labelData.templates && Array.isArray(labelData.templates)) {
          // Response with templates property
          templatesArray = labelData.templates;
        }
        
        if (templatesArray.length > 0) {
          // Fix any missing _id fields (use id if available)
          templatesArray = templatesArray.map(template => ({
            ...template,
            _id: template._id || template.id || `temp-${Math.random().toString(36).substring(2, 11)}`
          }));
          
          setLabelTemplates(templatesArray);
          setSelectedTemplate(templatesArray[0]._id);
        } else {
          // Default templates in case none are found in the database
          const defaultTemplates = [
            { _id: "default-1", id: "default-1", name: "Basic", width: 100, height: 50, createdAt: new Date() },
            { _id: "default-2", id: "default-2", name: "With Details", width: 100, height: 70, createdAt: new Date() }
          ];
          setLabelTemplates(defaultTemplates);
          setSelectedTemplate(defaultTemplates[0]._id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default templates if fetch fails
        const defaultTemplates = [
          { _id: "default-1", id: "default-1", name: "Basic", width: 100, height: 50, createdAt: new Date() },
          { _id: "default-2", id: "default-2", name: "With Details", width: 100, height: 70, createdAt: new Date() }
        ];
        setLabelTemplates(defaultTemplates);
        setSelectedTemplate(defaultTemplates[0]._id);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Calculate scale factor when component mounts and whenever window resizes
  useEffect(() => {
    function updateScale() {
      if (preview1Ref.current) {
        // Use a larger portion of the available width
        const containerWidth = preview1Ref.current.clientWidth * 0.9;
        const newScale = containerWidth / A4_WIDTH_MM;
        setScale(newScale);
      }
    }
    
    updateScale();
    
    // Update scale on window resize
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Get current template dimensions
  const getCurrentTemplate = () => {
    return labelTemplates.find(t => t._id === selectedTemplate) || 
      (labelTemplates.length > 0 ? labelTemplates[0] : { _id: "", name: "Default", width: 100, height: 50, createdAt: new Date() });
  };

  // Add product to Preview 1 (multiple allowed)
  const addProductToPreview = (product: Product) => {
    const template = getCurrentTemplate();
    
    // Default position is centered on the A4 page with some randomization
    const newX = (A4_WIDTH_MM / 2) - (template.width / 2) + (Math.random() * 20) - 10;
    const newY = (A4_HEIGHT_MM / 4) + (Math.random() * 40) - 20;
    
    setSelectedProducts((prev) => [
      ...prev,
      {
        product,
        width: template.width,
        height: template.height,
        x: newX,
        y: newY,
        templateId: template._id
      },
    ]);
  };

  // Remove product from Preview 1
  const removeProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Download Live Preview 2 as PDF (A4 Size)
  const downloadPDF = async () => {
    if (!preview2Ref.current) return;

    // Hide remove buttons before capturing the snapshot
    const buttons = preview2Ref.current.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.display = "none"));

    try {
      const canvas = await html2canvas(preview2Ref.current, { 
        scale: 3, // Higher scale for better quality
        backgroundColor: "#ffffff",
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Add image to cover entire A4 page
      pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      pdf.save("labels.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Restore button visibility after download
      buttons.forEach((btn) => (btn.style.display = "block"));
    }
  };

  // Update position and size for a specific product label
  const updateProductLabel = (index: number, updates: Partial<ProductLabel>) => {
    setSelectedProducts((prev) => 
      prev.map((item, idx) => idx === index ? { ...item, ...updates } : item)
    );
  };

  // Render label content based on template type and dimensions
  const renderLabelContent = (product: Product, templateId: string, isPreview: boolean) => {
    if (!product || !product.id) {
      console.error("Invalid product data:", product);
      // Create a default product with required fields to prevent errors
      product = {
        id: `default-${Date.now()}`,
        brandName: "Brand",
        productName: "Product",
        packetSize: "",
        unit: "",
        packetPrice: 0,
        pricePerUnit: 0
      };
    }
    
    // Get template dimensions to help with styling
    const template = labelTemplates.find(t => t._id === templateId) || getCurrentTemplate();
    
    // Check if it's a narrow label (likely a price tag)
    const isNarrow = template.width < template.height;
    
    // Check if it's a small label (compact layout)
    const isSmall = template.width < 90 || template.height < 50;
    
    // Determine if the template is large enough for detailed information
    const isDetailed = template.width >= 110 && template.height >= 70;
    
    // Scale factor for text size based on template dimensions
    const textScale = Math.min(template.width / 100, template.height / 50);
    const fontSize = Math.max(0.8, textScale);
    
    if (isNarrow) {
      // Price tag style
      return (
        <div className="h-full flex flex-col justify-between border-2 border-gray-800 p-1">
          <div className="text-center border-b border-gray-800 pb-1">
            <p className="font-bold uppercase" style={{fontSize: `${fontSize * 1.2}rem`}}>{product.brandName}</p>
          </div>
          <div className="text-center py-1">
            <p style={{fontSize: `${fontSize}rem`}}>{product.productName}</p>
            {product.packetSize && (
              <p style={{fontSize: `${fontSize * 0.9}rem`}}>{product.packetSize} {product.unit}</p>
            )}
          </div>
          <div className="text-center border-t border-gray-800 pt-1 pb-11">
            <p className="font-bold mt-2" style={{fontSize: `${fontSize * 1.4}rem`}}>₹{product.packetPrice.toFixed(2)}</p>
          </div>
        </div>
      );
    } else if (isDetailed) {
      // Detailed label with more information
      return (
        <div className="h-full flex flex-col justify-between border border-gray-800 rounded p-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold" style={{fontSize: `${fontSize}rem`}}>{product.brandName}</p>
              <p className="truncate max-w-full" style={{fontSize: `${fontSize}rem`}}>{product.productName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold" style={{fontSize: `${fontSize * 1.4}rem`}}>₹{product.packetPrice.toFixed(2)}</p>
              {product.pricePerUnit > 0 && (
                <p style={{fontSize: `${fontSize * 0.8}rem`}}>₹{Number(product.pricePerUnit).toFixed(2)}/{product.unit}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center mt-2">
            <p className="text-center" style={{fontSize: `${fontSize * 0.8}rem`}}>Item #: {product.id.substring(0, 8)}</p>
            {product.packetSize && (
              <p style={{fontSize: `${fontSize * 0.9}rem`}}>{product.packetSize} {product.unit}</p>
            )}
          </div>
        </div>
      );
    } else if (!isSmall) {
      // Standard label
      return (
        <div className="h-full flex flex-col border border-gray-800 justify-between p-1">
          <div className="text-center">
            <p className="font-semibold" style={{fontSize: `${fontSize}rem`}}>{product.brandName}</p>
            <p className="truncate max-w-full" style={{fontSize: `${fontSize}rem`}}>{product.productName}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold mt-1" style={{fontSize: `${fontSize * 1.2}rem`}}>₹{product.packetPrice.toFixed(2)}</p>
          </div>
        </div>
      );
    } else {
      // Basic small label
      return (
        <div className="h-full flex flex-col justify-center items-center">
          <p className="font-semibold" style={{fontSize: `${fontSize}rem`}}>{product.brandName}</p>
          <p className="truncate max-w-full" style={{fontSize: `${fontSize}rem`}}>{product.productName}</p>
          <p className="mt-1" style={{fontSize: `${fontSize}rem`}}>₹{product.packetPrice.toFixed(2)}</p>
        </div>
      );
    }
  };

  // Function to duplicate selected products in a grid layout
  const arrangeLabelsInGrid = () => {
    if (selectedProducts.length === 0) return;
    
    const template = getCurrentTemplate();
    const productToDuplicate = selectedProducts[0]; // Use the first product as template
    
    // Calculate how many can fit on a page with margins
    const pageMargin = 10; // 10mm margin
    const labelMargin = 5; // 5mm between labels
    
    const availableWidth = A4_WIDTH_MM - (2 * pageMargin);
    const availableHeight = A4_HEIGHT_MM - (2 * pageMargin);
    
    const labelsPerRow = Math.floor(availableWidth / (template.width + labelMargin));
    const labelsPerColumn = Math.floor(availableHeight / (template.height + labelMargin));
    
    const newLabels: ProductLabel[] = [];
    
    for (let row = 0; row < labelsPerColumn; row++) {
      for (let col = 0; col < labelsPerRow; col++) {
        const x = pageMargin + col * (template.width + labelMargin);
        const y = pageMargin + row * (template.height + labelMargin);
        
        newLabels.push({
          ...productToDuplicate,
          x,
          y,
          width: template.width,
          height: template.height
        });
      }
    }
    
    setSelectedProducts(newLabels);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Generate Labels</h2>

      {loading ? (
        <p>Loading products and templates...</p>
      ) : (
        <>
          {/* Template Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Select Label Template:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {labelTemplates.map((template) => (
                <div
                  key={template._id}
                  onClick={() => setSelectedTemplate(template._id)}
                  className={`border p-3 cursor-pointer rounded-md text-center transition-colors duration-200 ${
                    selectedTemplate === template._id
                      ? "bg-blue-100 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-gray-600">{template.width} x {template.height} mm</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Live Preview 1 (Editable) - Fixed height */}
            <div className="w-full md:w-1/2 border p-4">
              <h3 className="text-lg font-semibold">Design View (Editable)</h3>
              <div 
                ref={preview1Ref}
                className="relative border bg-gray-500 overflow-hidden"
                style={{
                  width: "100%", 
                  height: "600px", // Fixed height for both previews
                  position: "relative",
                  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                  overflowY: "auto" // Add scrolling for overflow
                }}
              >
                <div 
                  className="absolute bg-white" 
                  style={{
                    width: `${A4_WIDTH_MM * scale*2}px`,
                    height: `${A4_HEIGHT_MM * scale*2}px`,
                    transform: "scale(1)",
                    transformOrigin: "top left"
                  }}
                >
                  {selectedProducts.map(({ product, width, height, x, y, templateId }, index) => (
                    <Rnd
                      key={`edit-${product?.id || index}-${index}`}
                      size={{ 
                        width: width * scale, 
                        height: height * scale 
                      }}
                      position={{ 
                        x: x * scale, 
                        y: y * scale 
                      }}
                      onDragStop={(e, d) => {
                        updateProductLabel(index, {
                          x: d.x / scale,
                          y: d.y / scale
                        });
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        updateProductLabel(index, {
                          width: ref.offsetWidth / scale,
                          height: ref.offsetHeight / scale,
                          x: position.x / scale,
                          y: position.y / scale
                        });
                      }}
                      bounds="parent"
                      className="bg-white shadow-md cursor-move overflow-hidden"
                    >
                      <div className="h-full">
                        {renderLabelContent(product, templateId, true)}
                        <button
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 hover:bg-red-700 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(index);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </Rnd>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={arrangeLabelsInGrid}
                  disabled={selectedProducts.length === 0}
                  className={`px-4 py-2 rounded-md text-sm ${
                    selectedProducts.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Arrange in Grid
                </button>
                
                <button
                  onClick={() => setSelectedProducts([])}
                  disabled={selectedProducts.length === 0}
                  className={`px-4 py-2 rounded-md text-sm ${
                    selectedProducts.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Live Preview 2 (Read-Only & Downloadable) - Fixed height */}
            <div className="w-full md:w-1/2 border p-4 mt-6 md:mt-0">
              <h3 className="text-lg font-semibold">Print Preview (A4)</h3>
              <div 
                className="relative overflow-hidden bg-gray-600"
                style={{
                  width: "100%",
                  height: "600px", // Fixed height to match Design View
                  overflowY: "auto" // Add scrolling for overflow
                }}
              >
                <div 
                  ref={preview2Ref}
                  className="relative bg-white"
                  style={{
                    width: `${A4_WIDTH_MM * scale*2}px`,
                    height: `${A4_HEIGHT_MM * scale*2}px`,
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  {selectedProducts.map(({ product, width, height, x, y, templateId }, index) => (
                    <div
                      key={`preview-${product?.id || index}-${index}`}
                      style={{
                        width: width * scale,
                        height: height * scale,
                        left: x * scale,
                        top: y * scale,
                        position: "absolute",
                      }}
                      className="bg-white shadow-sm overflow-hidden"
                    >
                      {renderLabelContent(product, templateId, false)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Product Selection */}
      <h3 className="text-lg font-semibold mt-8">Select Products:</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {products.map((product, index) => (
          <div
            key={index}
            onClick={() => addProductToPreview(product)}
            className={`border p-3 cursor-pointer rounded-md text-center transition-colors duration-200 ${
              selectedProducts.some((p) => p.product.id === product.id)
                ? "bg-blue-100 border-blue-300"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <p className="font-medium">{product.productName}</p>
            <p className="text-sm text-gray-600">{product.brandName}</p>
            <p className="text-sm mt-1 font-semibold">₹{product.packetPrice}</p>
          </div>
        ))}
      </div>

      {/* Show debug info if no products or templates found */}
      {products.length === 0 && !loading && (
        <div className="p-3 mt-4 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-yellow-800">No products found. Please add products first or check your API endpoint.</p>
        </div>
      )}

      {labelTemplates.length === 0 && !loading && (
        <div className="p-3 mt-4 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-yellow-800">No label templates found. Using default templates instead.</p>
        </div>
      )}

      {/* Download Button */}
      {selectedProducts.length > 0 && (
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 mt-4 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download A4 PDF
        </button>
      )}
    </div>
  );
}