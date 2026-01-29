import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check hardcoded admin credentials
    if (username === "ADMIN1" && password === "ADMIN1") {
      // Generate JWT token
      const token = jwt.sign(
        {
          id: "admin1",
          username: "ADMIN1",
          role: "admin"
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return NextResponse.json({
        message: "Login successful",
        token,
        admin: {
          id: "admin1",
          username: "ADMIN1",
          role: "admin"
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
