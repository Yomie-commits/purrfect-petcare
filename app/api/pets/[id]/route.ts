import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, breed, age, weight, health_status, medical_history, photo_url } = await request.json()
    const supabase = createServerClient()

    const { data: pet, error } = await supabase
      .from("pets")
      .update({
        name,
        breed,
        age,
        weight,
        health_status,
        medical_history,
        photo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
    }

    return NextResponse.json({ pet })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { error } = await supabase.from("pets").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
    }

    return NextResponse.json({ message: "Pet deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
