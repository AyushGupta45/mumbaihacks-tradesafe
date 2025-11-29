"use client";

import React from "react";
import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings & Configuration</h1>
          <p className="text-zinc-400">Manage your account, API keys, and trading parameters</p>
        </div>
      </div>

      <SettingsForm />
    </div>
  );
}
