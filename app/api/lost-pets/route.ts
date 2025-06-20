import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: lostPets, error } = await supabase
      .from("lost_pets")
      .select(`
        *,
        users (name, email)
      `)
      .eq("status", "lost")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch lost pets" }, { status: 500 })
    }

    return NextResponse.json({ lostPets })
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

    const { pet_name, pet_description, location, contact_info, photo_url, reward_amount } = await request.json()

    if (!pet_name || !pet_description || !location) {
      return NextResponse.json(
        {
          error: "Pet name, description, and location are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    const { data: lostPet, error } = await supabase
      .from("lost_pets")
      .insert({
        user_id: user.id,
        pet_name,
        pet_description,
        location,
        contact_info,
        photo_url,
        reward_amount,
      })
      .select(`
        *,
        users (name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create lost pet report" }, { status: 500 })
    }

    return NextResponse.json({ lostPet })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
