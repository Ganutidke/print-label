import LabelGenerator from "@/components/LabelGenerator";
import Navbar from "@/components/Navbar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LabelGeneratorPage() {
    const session = await getServerSession(authOptions);
    
      if (!session || !session.user) {
        redirect("/login");
      }
    const userId = (session.user as { id: string }).id;
      // const userId = session.user.id as string;
  return (
    <>
      <Navbar/>
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Label Generator</h1>
      <LabelGenerator userId={userId} />
    </div>
    </>
  );
}
