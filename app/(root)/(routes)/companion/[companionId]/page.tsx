import CompanionForm from "@/components/CompanionForm";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    },
  });
  const categories = await prismadb.category.findMany();
  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
