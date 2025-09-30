"use client";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-slate-50 text-slate-800 p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto w-28 h-28 rounded-full bg-white shadow flex items-center justify-center mb-6">
          <Wrench
            size={44}
            className="animate-[pulse_2s_infinite]"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-3xl font-semibold mb-2">
          🚧 Site Under Maintenance
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          We’re doing some work behind the scenes. Please check back in a bit.
        </p>
      </div>
    </main>
  );
}
