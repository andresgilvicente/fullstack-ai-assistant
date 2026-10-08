"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The root route renders nothing of its own: it only redirects the visitor
// to the dashboard or to the login page depending on the stored session.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    router.push(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}
