import { NextResponse } from 'next/server'
import { connectToDatabase } from "@/lib/db";
import User from '@/lib/user'


// 1. FETCH ALL PENDING REQUESTS
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    
    // Find users where roleRequestStatus is 'pending'
    const pendingUsers = await User.find({ roleRequestStatus: 'pending' })
      .select('name email organizationName createdAt roleRequestStatus requestedRole')
      .sort({ createdAt: -1 }) // Newest first

    return NextResponse.json({ success: true, requests: pendingUsers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

// 2. APPROVE OR REJECT REQUEST
export async function PUT(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { userId, action, rejectionReason } = body // action: 'approve' | 'reject'

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // LOGIC
    if (action === 'approve') {
      user.role = user.requestedRole || 'organizer' // Upgrade role
      user.roleRequestStatus = 'approved'
      user.isApproved = true // If you use the boolean flag from earlier
      user.roleRejectionReason = undefined // Clear any previous rejection reason
    } else if (action === 'reject') {
      user.roleRequestStatus = 'rejected'
      // Store rejection reason if provided
      if (rejectionReason) {
        user.roleRejectionReason = rejectionReason
      }
      // role remains 'participant' (or whatever it was before)
    } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await user.save()

    return NextResponse.json({ 
      success: true, 
      message: `User request ${action}ed successfully`,
      user 
    })

  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}