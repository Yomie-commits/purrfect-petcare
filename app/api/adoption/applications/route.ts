import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listing_id, application_data } = await request.json()

    if (!listing_id || !application_data) {
      return NextResponse.json(
        {
          error: "Listing ID and application data are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // Check if user already applied for this listing
    const { data: existingApplication } = await supabase
      .from("adoption_applications")
      .select("id")
      .eq("listing_id", listing_id)
      .eq("applicant_id", user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this pet" }, { status: 409 })
    }

    const { data: application, error } = await supabase
      .from("adoption_applications")
      .insert({
        listing_id,
        applicant_id: user.id,
        application_data,
      })
      .select(`
        *,
        adoption_listings (pet_name, users (name, email)),
        users (name, email, phone)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    // Create notification for listing owner
    const { data: listing } = await supabase
      .from("adoption_listings")
      .select("user_id, pet_name")
      .eq("id", listing_id)
      .single()

    if (listing) {
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        title: "New Adoption Application",
        message: `${user.name} has applied to adopt ${listing.pet_name}`,
        type: "adoption",
        data: {
          application_id: application.id,
          listing_id,
          applicant_name: user.name,
        },
      })
    }

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'sent' or 'received'

    const supabase = createServerClient()

    let query = supabase
      .from("adoption_applications")
      .select(`
        *,
        adoption_listings (
          pet_name,
          species,
          breed,
          photos,
          users (name, email, phone)
        ),
        users (name, email, phone)
      `)
      .order("created_at", { ascending: false })

    if (type === "sent") {
      query = query.eq("applicant_id", user.id)
    } else if (type === "received") {
      // Get applications for listings owned by the user
      query = query.eq("adoption_listings.user_id", user.id)
    } else {
      // Default: get both sent and received
      query = query.or(`applicant_id.eq.${user.id},adoption_listings.user_id.eq.${user.id}`)
    }

    const { data: applications, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
