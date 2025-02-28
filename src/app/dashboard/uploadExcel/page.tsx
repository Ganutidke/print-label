import Navbar from '@/components/Navbar';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import UploadExcel from '@/components/UploadExcel';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async() => {
    const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // const userId = session.user.id as string; // Ensure `id` is correct
const userId = (session.user as { id: string }).id;

  return (
    <div>
        <Navbar/>
        <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
          <UploadExcel userId={userId} />
        </div>
        <div>
            <ProductList userId={userId} selectedTemplate={null} />
        </div>
    </div>
  )
}

export default page