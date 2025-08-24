import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db as prisma } from "@/app/lib/db";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.supplier?.id) {
    // اگر لاگین نکرده باشد
    return <div>لطفا وارد شوید</div>;
  }

  const supplierId = session.supplier.id;

  const products = await prisma.product.findMany({
    where: { supplierId: supplierId },
    select: {
      id: true,
      title: true,
      price: true, // فقط قیمت واقعی تامین‌کننده
      count: true,
      productVariants: {
        include: { product: true, variant: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  // داده‌ها از سرور دریافت شود

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Client component فقط برای UI تعاملی */}
      <DashboardClient products={products} />
    </div>
  );
}
