"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTracking,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentTracking?: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status, tracking_number: tracking }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="block text-xs text-black/55 mb-1">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="px-3 py-2 rounded-lg border border-black/15"
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="text-sm flex-1 min-w-[200px]">
        <span className="block text-xs text-black/55 mb-1">Tracking #</span>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-lg border border-black/15"
        />
      </label>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Update"}
      </button>
    </div>
  );
}
