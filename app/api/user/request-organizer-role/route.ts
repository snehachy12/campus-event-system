import { NextResponse } from 'next/server'
import { connectToDatabase } from "@/lib/db";
import User from '@/lib/user'

export async function POST(req: Request) {
    try {
        await connectToDatabase()
        const body = await req.json()
        const { userId, organizationName } = body

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 })
        }

        // Update the user's status
        // Note: Ensure your User schema has 'roleRequestStatus' or similar field
        // If not, you might need to add it to lib/models/User.ts
        const updateData: any = {
            $set: {
                roleRequestStatus: 'pending', // pending | approved | rejected
                requestedRole: 'organizer'
            }
        }
        
        // Add organization name if provided
        if (organizationName) {
            updateData.$set.organizationName = organizationName
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        )

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Request submitted to Admin",
            user: {
                id: user._id,
                roleRequestStatus: user.roleRequestStatus
            }
        })

    } catch (error) {
        console.error("Role request error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}