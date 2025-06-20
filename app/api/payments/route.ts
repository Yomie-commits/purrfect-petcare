import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// Mock M-Pesa payment processing
async function processMpesaPayment(phoneNumber: string, amount: number) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1

  return {
    success: isSuccess,
    transactionId: isSuccess ? `MP${Date.now()}${Math.random().toString(36).substr(2, 9)}` : null,
    message: isSuccess ? "Payment processed successfully" : "Payment failed",
  }
}

// Mock PayPal payment processing
async function processPaypalPayment(email: string, amount: number) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock success/failure (95% success rate)
  const isSuccess = Math.random() > 0.05

  return {
    success: isSuccess,
    transactionId: isSuccess ? `PP${Date.now()}${Math.random().toString(36).substr(2, 9)}` : null,
    message: isSuccess ? "PayPal payment completed" : "PayPal payment failed",
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointment_id, amount, method, phone_number, email } = await request.json()

    if (!amount || !method) {
      return NextResponse.json(
        {
          error: "Amount and payment method are required",
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
        method,
        status: "pending",
      })
      .select("*")
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    let paymentResult

    // Process payment based on method
    switch (method) {
      case "mpesa":
        if (!phone_number) {
          return NextResponse.json({ error: "Phone number required for M-Pesa" }, { status: 400 })
        }
        paymentResult = await processMpesaPayment(phone_number, amount)
        break

      case "paypal":
        if (!email) {
          return NextResponse.json({ error: "Email required for PayPal" }, { status: 400 })
        }
        paymentResult = await processPaypalPayment(email, amount)
        break

      default:
        return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 })
    }

    // Update payment record with result
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: paymentResult.success ? "completed" : "failed",
        transaction_id: paymentResult.transactionId,
      })
      .eq("id", payment.id)
      .select("*")
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
    }

    return NextResponse.json({
      payment: updatedPayment,
      message: paymentResult.message,
    })
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

    const supabase = createServerClient()

    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (
          date,
          service_type,
          pets (name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json({ payments })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
