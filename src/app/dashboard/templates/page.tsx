import LabelSettings from '@/components/LabelSettings'
import Navbar from '@/components/Navbar'
import TemplateList from '@/components/TemplateList';
import UploadExcel from '@/components/UploadExcel';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'

const page =async () => {
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
        <div className="bg-gray-100 px-6 py-3 flex flex-col gap-4 rounded-lg shadow-md">
            <LabelSettings userId={userId} />
          </div>
          <TemplateList userId={userId} />
        </div>
    </div>
  )
}

export default page