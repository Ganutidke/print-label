import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import UploadExcel from "@/components/UploadExcel";
import LabelSettings from "@/components/LabelSettings";
import Navbar from "@/components/Navbar";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id as string; // Ensure `id` is correct


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Container */}
      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-gray-600">Manage your products efficiently.</p>
        </div>

        {/* Grid Layout for Forms & Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Excel */}
          <div className="bg-gray-100 px-6 py-3 flex flex-col gap-4 rounded-lg shadow-md">
            <UploadExcel userId={userId} />
            <LabelSettings userId={userId} />
          </div>

          {/* Product Form */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <ProductForm userId={userId} />
          </div>
        </div>

        

      
      </div>
    </div>
  );
}
