"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomDateForm from "@/components/CustomDateForm";

export default function PostCustomPage() {
  const router = useRouter();

  const handleSubmit = () => {
    // Set a flag in localStorage to trigger toast on index
    localStorage.setItem("calendarCreated", "1");

    // Smooth client-side redirect
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-center">
          Create Custom Calendar
        </h1>

        <CustomDateForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
