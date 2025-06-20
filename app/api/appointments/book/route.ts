import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pet_id, vet_id, slot_id, appointment_type, service_type, notes, date } = await request.json()

    if (!pet_id || !vet_id || !slot_id || !service_type || !date) {
      return NextResponse.json(
        {
          error: "Pet ID, vet ID, slot ID, service type, and date are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // Verify pet ownership
    const { data: pet } = await supabase.from("pets").select("id").eq("id", pet_id).eq("user_id", user.id).single()

    if (!pet) {
      return NextResponse.json({ error: "Pet not found or access denied" }, { status: 404 })
    }

    // Get slot details and verify availability
    const { data: slot } = await supabase
      .from("appointment_slots")
      .select("*")
      .eq("id", slot_id)
      .eq("veterinarian_id", vet_id)
      .eq("date", date)
      .eq("is_available", true)
      .single()

    if (!slot) {
      return NextResponse.json({ error: "Time slot not available" }, { status: 409 })
    }

    // Create appointment
    const appointmentDateTime = new Date(`${date}T${slot.start_time}`)

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        pet_id,
        vet_id,
        date: appointmentDateTime.toISOString(),
        service_type,
        notes,
        status: "scheduled",
      })
      .select(`
        *,
        pets (name, breed),
        users!appointments_vet_id_fkey (name, email)
      `)
      .single()

    if (appointmentError) {
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }

    // Update slot availability
    await supabase
      .from("appointment_slots")
      .update({
        current_bookings: slot.current_bookings + 1,
        is_available: slot.current_bookings + 1 >= slot.max_bookings ? false : true,
      })
      .eq("id", slot_id)

    // Create video consultation record if needed
    if (appointment_type === "video") {
      const { data: videoConsultation } = await supabase
        .from("video_consultations")
        .insert({
          appointment_id: appointment.id,
          pet_id,
          pet_owner_id: user.id,
          veterinarian_id: vet_id,
          scheduled_start: appointmentDateTime.toISOString(),
          status: "scheduled",
        })
        .select()
        .single()

      // Generate video session URL (would integrate with video service like Zoom/Twilio)
      const sessionUrl = `https://video.purrfectpetcare.com/session/${videoConsultation?.id}`

      await supabase.from("video_consultations").update({ session_url: sessionUrl }).eq("id", videoConsultation?.id)
    }

    // Create notifications
    await Promise.all([
      // Notification for pet owner
      supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Appointment Confirmed",
          message: `Your appointment for ${appointment.pets.name} has been scheduled for ${appointmentDateTime.toLocaleDateString()} at ${slot.start_time}`,
          type: "appointment",
          data: {
            appointment_id: appointment.id,
            appointment_type,
            date: appointmentDateTime.toISOString(),
          },
        }),

      // Notification for veterinarian
      supabase
        .from("notifications")
        .insert({
          user_id: vet_id,
          title: "New Appointment Booked",
          message: `New ${appointment_type} appointment scheduled for ${appointmentDateTime.toLocaleDateString()} at ${slot.start_time}`,
          type: "appointment",
          data: {
            appointment_id: appointment.id,
            pet_name: appointment.pets.name,
            owner_name: user.name,
          },
        }),
    ])

    // Log analytics event
    await supabase.from("analytics_events").insert({
      event_type: "appointment_booked",
      user_id: user.id,
      data: {
        appointment_id: appointment.id,
        appointment_type,
        service_type,
        vet_id,
      },
    })

    return NextResponse.json({
      appointment: {
        ...appointment,
        time: `${slot.start_time} - ${slot.end_time}`,
      },
      message: "Appointment booked successfully",
    })
  } catch (error) {
    console.error("Appointment booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
