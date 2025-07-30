"use client";

import React, { useState } from "react";
import CustomDateForm from "@/components/CustomDateForm";
import CustomDateDisplay from "@/components/CustomDateDisplay";
import { CustomDateSystem } from "@/lib/dateUtils";

export default function IndexPage() {
  const [system, setSystem] = useState<CustomDateSystem | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-10 space-y-8">
      <h1 className="text-3xl font-bold">🌌 Custom Calendar</h1>

      {/* Show button if no system and form is hidden */}
      {!system && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Create Custom Calendar
        </button>
      )}

      {/* Show the form */}
      {showForm && (
        <CustomDateForm
          onSubmit={(newSystem) => {
            setSystem(newSystem);
            setShowForm(false); // Close form on submit
          }}
        />
      )}

      {/* Show the display once a system exists */}
      {system && <CustomDateDisplay system={system} />}
    </main>
  );
}
