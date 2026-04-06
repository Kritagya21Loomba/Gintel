import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.accessToken) {
      return NextResponse.json({ hasStarred: false, error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch("https://api.github.com/user/starred/Kritagya21Loomba/Gintel", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (res.status === 204) {
      return NextResponse.json({ hasStarred: true });
    } else if (res.status === 404) {
      return NextResponse.json({ hasStarred: false });
    } else {
      return NextResponse.json({ hasStarred: false, status: res.status });
    }
  } catch (e: any) {
    return NextResponse.json({ hasStarred: false, error: e.message }, { status: 500 });
  }
}
