import { NextResponse } from "next/server";
import { listOrdersForCustomer } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  return NextResponse.json({ orders: listOrdersForCustomer(email) });
}
