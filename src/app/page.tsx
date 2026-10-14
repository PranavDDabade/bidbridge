"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!role) router.replace("/onboarding");
    else router.replace(role === "buyer" ? "/buyer/dashboard" : "/seller/inbox");
  }, [user, role, loading, router]);

  return (
    <div className="p-8">
      <Skeleton className="h-10 w-64" />
    </div>
  );
}