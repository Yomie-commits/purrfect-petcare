import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const species = searchParams.get("species")
    const breed = searchParams.get("breed")
    const size = searchParams.get("size")
    const location = searchParams.get("location")
    const minAge = searchParams.get("minAge")
    const maxAge = searchParams.get("maxAge")
    const goodWithKids = searchParams.get("goodWithKids")
    const goodWithPets = searchParams.get("goodWithPets")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    const supabase = createServerClient()

    let query = supabase
      .from("adoption_listings")
      .select(`
        *,
        users (name, email, phone)
      `)
      .eq("status", "available")
      .order("created_at", { ascending: false })

    // Apply filters
    if (species) query = query.eq("species", species)
    if (breed) query = query.ilike("breed", `%${breed}%`)
    if (size) query = query.eq("size", size)
    if (location) query = query.ilike("location", `%${location}%`)
    if (minAge) query = query.gte("age", Number.parseInt(minAge))
    if (maxAge) query = query.lte("age", Number.parseInt(maxAge))
    if (goodWithKids === "true") query = query.eq("good_with_kids", true)
    if (goodWithPets === "true") query = query.eq("good_with_pets", true)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: listings, error, count } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch adoption listings" }, { status: 500 })
    }

    return NextResponse.json({
      listings,
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

    const listingData = await request.json()

    const {
      pet_name,
      species,
      breed,
      age,
      gender,
      size,
      temperament,
      description,
      medical_history,
      vaccination_status,
      spayed_neutered,
      good_with_kids,
      good_with_pets,
      energy_level,
      photos,
      adoption_fee,
      location,
      contact_phone,
      contact_email,
    } = listingData

    if (!pet_name || !species || !description || !location) {
      return NextResponse.json(
        {
          error: "Pet name, species, description, and location are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    const { data: listing, error } = await supabase
      .from("adoption_listings")
      .insert({
        user_id: user.id,
        pet_name,
        species,
        breed,
        age,
        gender,
        size,
        temperament,
        description,
        medical_history,
        vaccination_status,
        spayed_neutered,
        good_with_kids,
        good_with_pets,
        energy_level,
        photos,
        adoption_fee,
        location,
        contact_phone,
        contact_email,
      })
      .select(`
        *,
        users (name, email, phone)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create adoption listing" }, { status: 500 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
