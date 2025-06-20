import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"
import { mpesaService } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointment_id, amount, phone_number, account_reference, description } = await request.json()

    if (!amount || !phone_number) {
      return NextResponse.json(
        {
          error: "Amount and phone number are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // Create pending payment record
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        appointment_id,
        user_id: user.id,
        amount,
        method: "mpesa",
        status: "pending",
      })
      .select("*")
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    try {
      // Initiate M-Pesa STK Push
      const stkResponse = await mpesaService.initiateSTKPush({
        phoneNumber: phone_number,
        amount: amount,
        accountReference: account_reference || `PET-${payment.id.slice(0, 8)}`,
        transactionDesc: description || "Pet Care Payment",
      })

      // Store M-Pesa transaction details
      await supabase.from("mpesa_transactions").insert({
        payment_id: payment.id,
        merchant_request_id: stkResponse.MerchantRequestID,
        checkout_request_id: stkResponse.CheckoutRequestID,
        phone_number: phone_number,
        amount: amount,
        account_reference: account_reference || `PET-${payment.id.slice(0, 8)}`,
        transaction_desc: description || "Pet Care Payment",
      })

      return NextResponse.json({
        payment,
        mpesa_response: stkResponse,
        message: "STK Push initiated. Please check your phone to complete payment.",
      })
    } catch (mpesaError) {
      // Update payment status to failed
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id)

      return NextResponse.json(
        {
          error: "Failed to initiate M-Pesa payment",
          details: mpesaError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("M-Pesa payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
