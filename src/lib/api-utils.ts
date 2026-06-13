import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "请先登录" }, { status: 401 });
}

export function handleApiError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return unauthorized();
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
