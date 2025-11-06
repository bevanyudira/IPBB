"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useToast } from "@/hooks/use-toast";

export default function ToggleAdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const toggleAdmin = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast({
            title: "Error",
            description: "No authentication token found",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        // ✅ Gunakan URL yang benar dengan http://
        const response = await fetch("/api/profile/toggle-admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
          }),
        });

        console.log("Response status:", response.status); // ✅ Debug status
        console.log("Response headers:", response.headers); // ✅ Debug headers

        if (!response.ok) {
          // ✅ Handle case dimana response tidak punya JSON body
          let errorData;
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            // Jika bukan JSON, baca sebagai text
            const errorText = await response.text();
            errorData = {
              detail: errorText || `HTTP error! status: ${response.status}`,
            };
          }

          console.error("Toggle admin failed:", {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData,
          });

          toast({
            title: "Error",
            description:
              errorData.detail ||
              `Failed to toggle admin status (${response.status})`,
            variant: "destructive",
          });
        } else {
          const data = await response.json();

          // Invalidate and refetch all user-related data
          await mutate("/auth/me");
          await mutate("/profile/me");

          toast({
            title: "Success",
            description: data.message,
          });
        }
      } catch (error) {
        console.error("Network error:", error);

        // ✅ FIX: Handle unknown error type properly
        let errorMessage = "Network error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        router.push("/profile");
      }
    };

    toggleAdmin();
  }, [router, toast]);

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Toggling admin status...</p>
        <p className="text-sm text-gray-500">Please wait</p>
      </div>
    </div>
  );
}
