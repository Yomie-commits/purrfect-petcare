interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  businessShortCode: string
  passkey: string
  callbackUrl: string
  environment: "sandbox" | "production"
}

interface STKPushRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

class MpesaService {
  private config: MpesaConfig
  private baseUrl: string

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
      passkey: process.env.MPESA_PASSKEY!,
      callbackUrl: process.env.MPESA_CALLBACK_URL!,
      environment: (process.env.MPESA_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    }

    this.baseUrl =
      this.config.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get M-Pesa access token")
    }

    const data = await response.json()
    return data.access_token
  }

  private generatePassword(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passkey}${timestamp}`).toString(
      "base64",
    )
    return password
  }

  private getTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.getTimestamp()
      const password = this.generatePassword()

      // Format phone number (remove + and ensure it starts with 254)
      let phoneNumber = request.phoneNumber.replace(/\D/g, "")
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "254" + phoneNumber.slice(1)
      } else if (!phoneNumber.startsWith("254")) {
        phoneNumber = "254" + phoneNumber
      }

      const stkPushData = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(request.amount),
        PartyA: phoneNumber,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPushData),
      })

      if (!response.ok) {
        throw new Error(`M-Pesa API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("M-Pesa STK Push error:", error)
      throw error
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.getTimestamp()
      const password = this.generatePassword()

      const queryData = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryData),
      })

      if (!response.ok) {
        throw new Error(`M-Pesa query error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("M-Pesa query error:", error)
      throw error
    }
  }
}

export const mpesaService = new MpesaService()
