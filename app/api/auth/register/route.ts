import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "pet_owner", phone, address } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        role,
        phone,
        address,
      })
      .select("id, name, email, role")
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
