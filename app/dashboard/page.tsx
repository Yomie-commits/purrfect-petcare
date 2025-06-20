"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Heart, MapPin, CreditCard, PawPrint } from "lucide-react"

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  health_status: string
}

interface Appointment {
  id: string
  date: string
  service_type: string
  status: string
  pets: { name: string }
  users: { name: string }
}

interface LostPet {
  id: string
  pet_name: string
  location: string
  status: string
  created_at: string
}

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    fetchDashboardData()
  }, [user, token, router])

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const [petsRes, appointmentsRes, lostPetsRes, paymentsRes] = await Promise.all([
        fetch("/api/pets", { headers }),
        fetch("/api/appointments", { headers }),
        fetch("/api/lost-pets", { headers }),
        fetch("/api/payments", { headers }),
      ])

      if (petsRes.ok) {
        const petsData = await petsRes.json()
        setPets(petsData.pets || [])
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData.appointments || [])
      }

      if (lostPetsRes.ok) {
        const lostPetsData = await lostPetsRes.json()
        setLostPets(lostPetsData.lostPets || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-pink-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.date) > new Date() && apt.status === "scheduled")
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your pets today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Pets</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pets.length}</div>
              <p className="text-xs text-muted-foreground">Registered pets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lost Reports</CardTitle>
              <MapPin className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lostPets.filter((pet) => pet.status === "lost").length}</div>
              <p className="text-xs text-muted-foreground">Active reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total spent</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="lost-pets">Lost Pets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your next scheduled veterinary visits</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.pets.name}</p>
                          <p className="text-sm text-gray-600">{appointment.service_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {new Date(appointment.date).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments scheduled</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Pets */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Pets</CardTitle>
                    <CardDescription>Your registered pets and their health status</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.slice(0, 6).map((pet) => (
                      <div key={pet.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{pet.name}</h3>
                          <Badge variant={pet.health_status === "healthy" ? "default" : "secondary"}>
                            {pet.health_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{pet.breed}</p>
                        <p className="text-sm text-gray-500">{pet.age} years old</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No pets registered yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pet Management</CardTitle>
                    <CardDescription>Manage your pets' profiles and health information</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <div className="space-y-4">
                    {pets.map((pet) => (
                      <div key={pet.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{pet.name}</h3>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} years old
                          </p>
                          <Badge variant={pet.health_status === "healthy" ? "default" : "secondary"} className="mt-1">
                            {pet.health_status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first pet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>View and manage all your veterinary appointments</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{appointment.pets.name}</h3>
                          <p className="text-sm text-gray-600">{appointment.service_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {new Date(appointment.date).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500">Dr. {appointment.users.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "scheduled"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {appointment.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-500 mb-6">Schedule your first veterinary appointment</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Book Your First Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lost-pets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lost Pet Reports</CardTitle>
                    <CardDescription>Community lost and found pet reports</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Report Lost Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lostPets.length > 0 ? (
                  <div className="space-y-4">
                    {lostPets.map((lostPet) => (
                      <div key={lostPet.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{lostPet.pet_name}</h3>
                          <p className="text-sm text-gray-600">Last seen: {lostPet.location}</p>
                          <p className="text-sm text-gray-500">
                            Reported: {new Date(lostPet.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              lostPet.status === "found"
                                ? "default"
                                : lostPet.status === "reunited"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {lostPet.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lost pet reports</h3>
                    <p className="text-gray-500 mb-6">Help reunite lost pets with their families</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Report a Lost Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
