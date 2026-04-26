"use client";

import { useEffect } from "react";
import { api } from "/Users/a/Documents/New project/SpendWise/frontend/lib/api";

export default function Home() {
  useEffect(() => {
    api.get("/").then(res => console.log(res.data));
  }, []);

  return <div>Check console</div>;
}