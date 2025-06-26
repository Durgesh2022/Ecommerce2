export const dynamic = "force-dynamic";
import CommonListing from "@/components/CommonListing";
import { productByCategory } from "@/services/product";

export default async function KidsAllProducts() {
  const getAllProducts = await productByCategory("Shoes");

  return <CommonListing data={getAllProducts && getAllProducts.data} />;
}
