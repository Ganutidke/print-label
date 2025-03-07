import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import ProductListPage from "@/components/ProductListPage";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }
const userId = (session.user as { id: string }).id;
  // const userId = session.user.id as string;
  return (
    <>
    <Navbar/>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        {/* <ProductList selectedTemplate={null} userId={userId} /> */}
        <ProductListPage userId={userId}/>
      </div>
    </>
  );
};

export default page;
