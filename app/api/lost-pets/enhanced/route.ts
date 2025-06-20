import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const species = searchParams.get("species")
    const breed = searchParams.get("breed")
    const color = searchParams.get("color")
    const size = searchParams.get("size")
    const location = searchParams.get("location")
    const dateRange = searchParams.get("dateRange") // 'week', 'month', 'all'
    const status = searchParams.get("status") || "lost"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    const supabase = createServerClient()

    let query = supabase
      .from("lost_pets")
      .select(`
        *,
        users (name, email, phone)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    // Apply filters
    if (species) query = query.eq("species", species)
    if (breed) query = query.ilike("breed", `%${breed}%`)
    if (color) query = query.ilike("color", `%${color}%`)
    if (size) query = query.eq("size", size)
    if (location) query = query.ilike("location", `%${location}%`)

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte("created_at", startDate.toISOString())
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: lostPets, error, count } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch lost pets" }, { status: 500 })
    }

    return NextResponse.json({
      lostPets,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
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

    const lostPetData = await request.json()

    const {
      pet_name,
      species,
      breed,
      color,
      size,
      pet_description,
      distinctive_features,
      location,
      last_seen_date,
      contact_info,
      photos,
      reward_amount,
      microchip_id,
    } = lostPetData

    if (!pet_name || !species || !pet_description || !location) {
      return NextResponse.json(
        {
          error: "Pet name, species, description, and location are required",
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
        species,
        breed,
        color,
        size,
        pet_description,
        distinctive_features,
        location,
        last_seen_date: last_seen_date ? new Date(last_seen_date).toISOString() : null,
        contact_info,
        photos,
        reward_amount,
        microchip_id,
      })
      .select(`
        *,
        users (name, email, phone)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create lost pet report" }, { status: 500 })
    }

    // Create notifications for nearby users (simplified - in production, use geolocation)
    // This would typically involve a background job
    await supabase.from("analytics_events").insert({
      event_type: "lost_pet_reported",
      user_id: user.id,
      data: {
        pet_id: lostPet.id,
        species,
        location,
      },
    })

    return NextResponse.json({ lostPet })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
