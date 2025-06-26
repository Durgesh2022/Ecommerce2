"use client";

import { useEffect, useState } from "react";
import { getAllAdminProducts } from "@/services/product";
import CommonListing from "@/components/CommonListing";

export default function AdminAllProducts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAllAdminProducts().then((res) => {
      if (res?.data) setData(res.data);
    });
  }, []);

  return <CommonListing data={data} />;
}
