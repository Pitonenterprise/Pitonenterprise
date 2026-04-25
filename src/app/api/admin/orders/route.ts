import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/store";
import type { OrderStatus } from "@/types";

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status, tracking_number } = (await req.json()) as {
    id: string;
    status: OrderStatus;
    tracking_number?: string;
  };
  const order = updateOrderStatus(id, status, tracking_number);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}
