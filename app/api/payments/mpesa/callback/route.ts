import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    const supabase = createServerClient()

    const { Body } = callbackData
    const { stkCallback } = Body

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // Find the transaction record
    const { data: transaction, error: findError } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("checkout_request_id", CheckoutRequestID)
      .single()

    if (findError || !transaction) {
      console.error("Transaction not found:", CheckoutRequestID)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    let mpesaReceiptNumber = null
    let transactionDate = null
    let phoneNumber = null
    let amount = null

    // Extract callback metadata if payment was successful
    if (ResultCode === 0 && CallbackMetadata?.Item) {
      const items = CallbackMetadata.Item

      for (const item of items) {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceiptNumber = item.Value
            break
          case "TransactionDate":
            transactionDate = new Date(item.Value.toString())
            break
          case "PhoneNumber":
            phoneNumber = item.Value
            break
          case "Amount":
            amount = item.Value
            break
        }
      }
    }

    // Update M-Pesa transaction record
    await supabase
      .from("mpesa_transactions")
      .update({
        result_code: ResultCode,
        result_desc: ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate,
        phone_number: phoneNumber || transaction.phone_number,
        amount: amount || transaction.amount,
      })
      .eq("id", transaction.id)

    // Update payment status
    const paymentStatus = ResultCode === 0 ? "completed" : "failed"
    await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: mpesaReceiptNumber,
      })
      .eq("id", transaction.payment_id)

    // Create notification for user
    if (transaction.payment_id) {
      const { data: payment } = await supabase
        .from("payments")
        .select("user_id")
        .eq("id", transaction.payment_id)
        .single()

      if (payment) {
        await supabase.from("notifications").insert({
          user_id: payment.user_id,
          title: ResultCode === 0 ? "Payment Successful" : "Payment Failed",
          message:
            ResultCode === 0
              ? `Your payment of KES ${amount || transaction.amount} has been processed successfully. Receipt: ${mpesaReceiptNumber}`
              : `Your payment failed: ${ResultDesc}`,
          type: "payment",
          data: {
            payment_id: transaction.payment_id,
            mpesa_receipt: mpesaReceiptNumber,
            amount: amount || transaction.amount,
          },
        })
      }
    }

    return NextResponse.json({ message: "Callback processed successfully" })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 })
  }
}
