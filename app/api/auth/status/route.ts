import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userCookie = cookieStore.get("user")?.value;

    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        return NextResponse.json({
          authenticated: true,
          token,
          user,
        });
      } catch (parseError) {
        console.error("Failed to parse user cookie:", parseError);
        return NextResponse.json({ authenticated: false });
      }
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
