import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
    }

    return NextResponse.json({ pets })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, breed, age, weight, health_status, medical_history, photo_url } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Pet name is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: pet, error } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name,
        breed,
        age,
        weight,
        health_status,
        medical_history,
        photo_url,
      })
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
    }

    return NextResponse.json({ pet })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
