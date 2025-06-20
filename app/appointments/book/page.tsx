"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Clock, Video, MapPin, User, Stethoscope, CheckCircle } from "lucide-react"

interface Pet {
  id: string
  name: string
  breed: string
  age: number
}

interface Veterinarian {
  id: string
  name: string
  specialization: string
  rating: number
  experience_years: number
  clinic_name: string
  location: string
  video_consultation_available: boolean
}

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  slot_type: string
  is_available: boolean
}

export default function BookAppointmentPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPet, setSelectedPet] = useState("")
  const [selectedVet, setSelectedVet] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [appointmentType, setAppointmentType] = useState("regular")
  const [serviceType, setServiceType] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchPets()
    fetchVeterinarians()
  }, [user, token])

  useEffect(() => {
    if (selectedVet && selectedDate) {
      fetchTimeSlots()
    }
  }, [selectedVet, selectedDate])

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPets(data.pets || [])
      }
    } catch (error) {
      console.error("Error fetching pets:", error)
    }
  }

  const fetchVeterinarians = async () => {
    try {
      const response = await fetch("/api/veterinarians", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setVeterinarians(data.veterinarians || [])
      }
    } catch (error) {
      console.error("Error fetching veterinarians:", error)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedVet || !selectedDate) return

    try {
      const dateStr = selectedDate.toISOString().split("T")[0]
      const response = await fetch(`/api/appointments/slots?vet_id=${selectedVet}&date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.slots || [])
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedPet || !selectedVet || !selectedSlot || !serviceType) {
      return
    }

    setLoading(true)
    try {
      const appointmentData = {
        pet_id: selectedPet,
        vet_id: selectedVet,
        slot_id: selectedSlot,
        appointment_type: appointmentType,
        service_type: serviceType,
        notes: notes,
        date: selectedDate?.toISOString().split("T")[0],
      }

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        const result = await response.json()
        setBookingResult(result)
        setShowConfirmation(true)
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedVetData = veterinarians.find((v) => v.id === selectedVet)
  const selectedPetData = pets.find((p) => p.id === selectedPet)
  const selectedSlotData = timeSlots.find((s) => s.id === selectedSlot)

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Book Appointment</h1>
          <p className="text-grey">Schedule a visit with a veterinarian for your pet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pet Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange" />
                  Select Pet
                </CardTitle>
                <CardDescription>Choose which pet needs care</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedPet} onValueChange={setSelectedPet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.breed} ({pet.age} years)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Appointment Type */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Type</CardTitle>
                <CardDescription>Choose between in-person or video consultation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      appointmentType === "regular" ? "border-orange bg-orange/5" : "border-grey/20"
                    }`}
                    onClick={() => setAppointmentType("regular")}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-orange" />
                      <div>
                        <h3 className="font-semibold text-charcoal">In-Person Visit</h3>
                        <p className="text-sm text-grey">Visit the clinic for examination</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      appointmentType === "video" ? "border-orange bg-orange/5" : "border-grey/20"
                    }`}
                    onClick={() => setAppointmentType("video")}
                  >
                    <div className="flex items-center gap-3">
                      <Video className="h-6 w-6 text-teal" />
                      <div>
                        <h3 className="font-semibold text-charcoal">Video Consultation</h3>
                        <p className="text-sm text-grey">Online consultation from home</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Type */}
            <Card>
              <CardHeader>
                <CardTitle>Service Type</CardTitle>
                <CardDescription>What type of care does your pet need?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_checkup">General Checkup</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="dental_care">Dental Care</SelectItem>
                    <SelectItem value="surgery_consultation">Surgery Consultation</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                    <SelectItem value="behavioral_consultation">Behavioral Consultation</SelectItem>
                    <SelectItem value="nutrition_consultation">Nutrition Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Veterinarian Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal" />
                  Select Veterinarian
                </CardTitle>
                <CardDescription>Choose your preferred veterinarian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {veterinarians
                    .filter((vet) => appointmentType !== "video" || vet.video_consultation_available)
                    .map((vet) => (
                      <div
                        key={vet.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedVet === vet.id ? "border-orange bg-orange/5" : "border-grey/20"
                        }`}
                        onClick={() => setSelectedVet(vet.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-charcoal">Dr. {vet.name}</h3>
                            <p className="text-sm text-grey">{vet.specialization}</p>
                            <p className="text-sm text-grey">
                              {vet.clinic_name} • {vet.location}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{vet.experience_years} years experience</Badge>
                              <Badge variant="outline">⭐ {vet.rating}/5</Badge>
                              {vet.video_consultation_available && (
                                <Badge className="bg-teal text-white">Video Available</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            {selectedVet && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-orange" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-grey mb-2 block">Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                        className="rounded-md border"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-grey mb-2 block">Available Times</Label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedSlot === slot.id
                                  ? "border-orange bg-orange/5"
                                  : slot.is_available
                                    ? "border-grey/20 hover:border-grey/40"
                                    : "border-grey/10 bg-grey/5 cursor-not-allowed"
                              }`}
                              onClick={() => slot.is_available && setSelectedSlot(slot.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-grey" />
                                  <span className="text-charcoal">
                                    {slot.start_time} - {slot.end_time}
                                  </span>
                                </div>
                                <Badge
                                  variant={slot.is_available ? "outline" : "secondary"}
                                  className={slot.slot_type === "emergency" ? "border-red-500 text-red-700" : ""}
                                >
                                  {slot.slot_type}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-grey mx-auto mb-2" />
                            <p className="text-grey">No available slots for this date</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Any specific concerns or notes for the veterinarian</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your pet's symptoms, concerns, or any specific requests..."
                  className="min-h-24"
                />
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your appointment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPetData && (
                  <div>
                    <Label className="text-sm font-medium text-grey">Pet</Label>
                    <p className="text-charcoal">{selectedPetData.name}</p>
                    <p className="text-sm text-grey">
                      {selectedPetData.breed}, {selectedPetData.age} years
                    </p>
                  </div>
                )}

                {selectedVetData && (
                  <div>
                    <Label className="text-sm font-medium text-grey">Veterinarian</Label>
                    <p className="text-charcoal">Dr. {selectedVetData.name}</p>
                    <p className="text-sm text-grey">{selectedVetData.specialization}</p>
                    <p className="text-sm text-grey">{selectedVetData.clinic_name}</p>
                  </div>
                )}

                {appointmentType && (
                  <div>
                    <Label className="text-sm font-medium text-grey">Type</Label>
                    <div className="flex items-center gap-2">
                      {appointmentType === "video" ? (
                        <Video className="h-4 w-4 text-teal" />
                      ) : (
                        <MapPin className="h-4 w-4 text-orange" />
                      )}
                      <span className="text-charcoal capitalize">
                        {appointmentType === "video" ? "Video Consultation" : "In-Person Visit"}
                      </span>
                    </div>
                  </div>
                )}

                {serviceType && (
                  <div>
                    <Label className="text-sm font-medium text-grey">Service</Label>
                    <p className="text-charcoal capitalize">{serviceType.replace("_", " ")}</p>
                  </div>
                )}

                {selectedDate && selectedSlotData && (
                  <div>
                    <Label className="text-sm font-medium text-grey">Date & Time</Label>
                    <p className="text-charcoal">{selectedDate.toLocaleDateString()}</p>
                    <p className="text-charcoal">
                      {selectedSlotData.start_time} - {selectedSlotData.end_time}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-charcoal">Consultation Fee</span>
                    <span className="font-bold text-charcoal">
                      KES {appointmentType === "video" ? "1,500" : "2,500"}
                    </span>
                  </div>

                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedPet || !selectedVet || !selectedSlot || !serviceType || loading}
                    className="w-full bg-orange hover:bg-orange/90"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      "Book Appointment"
                    )}
                  </Button>
                </div>

                {appointmentType === "video" && (
                  <Alert>
                    <Video className="h-4 w-4" />
                    <AlertDescription>
                      You'll receive a video consultation link via email before your appointment.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Appointment Booked!
              </DialogTitle>
              <DialogDescription>Your appointment has been successfully scheduled.</DialogDescription>
            </DialogHeader>

            {bookingResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Appointment Details</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>Appointment ID: {bookingResult.appointment?.id}</p>
                    <p>Date: {new Date(bookingResult.appointment?.date).toLocaleDateString()}</p>
                    <p>Time: {bookingResult.appointment?.time}</p>
                    {appointmentType === "video" && <p>Video link will be sent to your email</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex-1">
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push(`/appointments/${bookingResult.appointment?.id}`)}
                    className="flex-1 bg-orange hover:bg-orange/90"
                  >
                    View Appointment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
