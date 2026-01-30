import { NextResponse } from 'next/server'
import { connectToDatabase } from "@/lib/db";
import User from '@/lib/user'


// Send notification to user about role request decision
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { userId, action, rejectionReason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Store rejection reason in user document for display in UI
    if (action === 'reject' && rejectionReason) {
      user.roleRejectionReason = rejectionReason
      await user.save()
    }

    // You can add email notification here in future
    // For now, we store the rejection reason in the user document
    // and the frontend can query it

    return NextResponse.json({ 
      success: true, 
      message: `Notification sent for ${action}`,
    })

  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
