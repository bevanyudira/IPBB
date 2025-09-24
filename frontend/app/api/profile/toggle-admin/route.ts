import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

    // Get authorization header from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/profile/toggle-admin`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: errorData || "Failed to toggle admin status" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Toggle admin error:", error)
    return NextResponse.json(
      { error: "Failed to toggle admin status" },
      { status: 500 }
    )
  }
}