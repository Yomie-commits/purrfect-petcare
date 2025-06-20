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

    // Get veterinarians with their profiles
    const { data: veterinarians, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        phone,
        created_at
      `)
      .eq("role", "vet")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch veterinarians" }, { status: 500 })
    }

    // Mock additional data (in production, this would come from a vet_profiles table)
    const enrichedVets = veterinarians?.map((vet) => ({
      ...vet,
      specialization: "General Practice", // Would come from database
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      experience_years: 5 + Math.floor(Math.random() * 15), // Mock experience
      clinic_name: "Purrfect Pet Clinic", // Would come from database
      location: "Nairobi, Kenya", // Would come from database
      video_consultation_available: true, // Would come from database
    }))

    return NextResponse.json({ veterinarians: enrichedVets })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
