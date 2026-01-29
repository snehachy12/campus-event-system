import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import User from '@/lib/manage';

// 1. GET ALL USERS (With Filters)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: any = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.accountStatus = status;

    // Exclude admins from the list so you don't block yourself
    query.role = { $ne: 'admin' };

    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. PERFORM ACTIONS (Approve, Block, Delete)
export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, action } = body; 
    // action: 'approve' | 'block' | 'unblock' | 'delete'

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (action === 'delete') {
      await User.findByIdAndDelete(userId);
      return NextResponse.json({ success: true, message: "User deleted permanently" });
    }

    let update = {};
    if (action === 'approve') update = { accountStatus: 'active' };
    if (action === 'block') update = { accountStatus: 'blocked' };
    if (action === 'unblock') update = { accountStatus: 'active' };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}