"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Camera,
  Edit,
  Plus,
  Calendar,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Stethoscope,
  Syringe,
  Brain,
  Video,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  weight: number
  health_status: string
  medical_history: string
  photo_url: string
  microchip_id: string
  insurance_info: any
  emergency_contact: any
  dietary_requirements: string
  allergies: string[]
  medications: any[]
  behavioral_notes: string
  activity_level: string
  spayed_neutered: boolean
  last_checkup: string
  next_checkup: string
}

interface HealthData {
  pet: Pet
  healthRecords: any[]
  vaccinations: any[]
  healthMetrics: any[]
  healthAlerts: any[]
  behaviorLogs: any[]
  healthInsights: {
    weightTrend: string
    activityLevel: number
    eatingPattern: number
    lastCheckup: string
    upcomingVaccinations: any[]
    activeAlerts: number
  }
}

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addDialogType, setAddDialogType] = useState<string>("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchPetData()
  }, [user, token, params.id])

  const fetchPetData = async () => {
    try {
      const response = await fetch(`/api/pets/${params.id}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching pet data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHealthData = async (type: string, data: any) => {
    try {
      const response = await fetch(`/api/pets/${params.id}/health`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        fetchPetData() // Refresh data
      }
    } catch (error) {
      console.error("Error adding health data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-grey">Loading pet profile...</p>
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Heart className="h-16 w-16 text-grey mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">Pet not found</h3>
            <p className="text-grey mb-4">The pet you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { pet, healthRecords, vaccinations, healthMetrics, healthAlerts, behaviorLogs, healthInsights } = healthData

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "excellent":
        return "health-excellent"
      case "good":
        return "health-good"
      case "fair":
        return "health-fair"
      case "poor":
        return "health-poor"
      case "critical":
        return "health-critical"
      default:
        return "health-good"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-grey" />
    }
  }

  // Prepare chart data
  const weightData = healthMetrics
    .filter((m) => m.metric_type === "weight")
    .slice(0, 10)
    .reverse()
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString(),
      weight: m.value,
    }))

  const activityData = healthMetrics
    .filter((m) => m.metric_type === "activity")
    .slice(0, 7)
    .reverse()
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString(),
      minutes: m.value,
    }))

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pet Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-grey/20 rounded-full overflow-hidden">
                  {pet.photo_url ? (
                    <img
                      src={pet.photo_url || "/placeholder.svg"}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-grey" />
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full p-2">
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-charcoal">{pet.name}</h1>
                <p className="text-grey">
                  {pet.breed} • {pet.age} years old
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getHealthStatusColor(pet.health_status)} border`}>{pet.health_status}</Badge>
                  {pet.microchip_id && <Badge variant="outline">Microchipped</Badge>}
                  {pet.spayed_neutered && <Badge variant="outline">Spayed/Neutered</Badge>}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                <Edit className="h-4 w-4 mr-2" />
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
              <Button className="bg-orange hover:bg-orange/90">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <div className="mb-6">
            {healthAlerts.map((alert) => (
              <Alert
                key={alert.id}
                className={`mb-2 ${
                  alert.severity === "critical"
                    ? "border-red-500 bg-red-50"
                    : alert.severity === "high"
                      ? "border-orange-500 bg-orange-50"
                      : "border-yellow-500 bg-yellow-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.title}</strong>
                  <p className="mt-1">{alert.description}</p>
                  {alert.recommendations && (
                    <p className="mt-2 text-sm font-medium">Recommendation: {alert.recommendations}</p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Records</TabsTrigger>
            <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
            <TabsTrigger value="monitoring">AI Monitoring</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Insights Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weight Trend</CardTitle>
                  {getTrendIcon(healthInsights.weightTrend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{pet.weight} kg</div>
                  <p className="text-xs text-grey capitalize">{healthInsights.weightTrend}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
                  <Activity className="h-4 w-4 text-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{healthInsights.activityLevel.toFixed(0)} min</div>
                  <p className="text-xs text-grey">Daily average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Checkup</CardTitle>
                  <Stethoscope className="h-4 w-4 text-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-charcoal">
                    {healthInsights.lastCheckup
                      ? new Date(healthInsights.lastCheckup).toLocaleDateString()
                      : "No records"}
                  </div>
                  <p className="text-xs text-grey">
                    {pet.next_checkup && `Next: ${new Date(pet.next_checkup).toLocaleDateString()}`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{healthInsights.activeAlerts}</div>
                  <p className="text-xs text-grey">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Tracking</CardTitle>
                  <CardDescription>Weight changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="var(--orange)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Levels</CardTitle>
                  <CardDescription>Daily activity in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="minutes" fill="var(--teal)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about {pet.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-grey">Breed</Label>
                    <p className="text-charcoal">{pet.breed}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-grey">Age</Label>
                    <p className="text-charcoal">{pet.age} years</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-grey">Weight</Label>
                    <p className="text-charcoal">{pet.weight} kg</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-grey">Activity Level</Label>
                    <p className="text-charcoal capitalize">{pet.activity_level || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-grey">Microchip ID</Label>
                    <p className="text-charcoal">{pet.microchip_id || "Not microchipped"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-grey">Spayed/Neutered</Label>
                    <p className="text-charcoal">{pet.spayed_neutered ? "Yes" : "No"}</p>
                  </div>
                </div>

                {pet.allergies && pet.allergies.length > 0 && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-grey">Allergies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pet.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {pet.dietary_requirements && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-grey">Dietary Requirements</Label>
                    <p className="text-charcoal mt-1">{pet.dietary_requirements}</p>
                  </div>
                )}

                {pet.behavioral_notes && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-grey">Behavioral Notes</Label>
                    <p className="text-charcoal mt-1">{pet.behavioral_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">Health Records</h3>
                <p className="text-grey">Medical history and veterinary visits</p>
              </div>
              <Button
                onClick={() => {
                  setAddDialogType("health_record")
                  setShowAddDialog(true)
                }}
                className="bg-orange hover:bg-orange/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>

            <div className="space-y-4">
              {healthRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg capitalize">{record.record_type}</CardTitle>
                        <CardDescription>
                          {new Date(record.date).toLocaleDateString()} • {record.veterinarian} at {record.clinic}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {record.record_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {record.diagnosis && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-grey">Diagnosis</Label>
                        <p className="text-charcoal">{record.diagnosis}</p>
                      </div>
                    )}
                    {record.treatment && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-grey">Treatment</Label>
                        <p className="text-charcoal">{record.treatment}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-grey">Notes</Label>
                        <p className="text-charcoal">{record.notes}</p>
                      </div>
                    )}
                    {record.follow_up_required && (
                      <Alert className="mt-4">
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          Follow-up required on {new Date(record.follow_up_date).toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}

              {healthRecords.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Stethoscope className="h-16 w-16 text-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-charcoal mb-2">No health records yet</h3>
                    <p className="text-grey mb-4">Start tracking {pet.name}'s medical history</p>
                    <Button
                      onClick={() => {
                        setAddDialogType("health_record")
                        setShowAddDialog(true)
                      }}
                    >
                      Add First Record
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">Vaccination Records</h3>
                <p className="text-grey">Track immunizations and due dates</p>
              </div>
              <Button
                onClick={() => {
                  setAddDialogType("vaccination")
                  setShowAddDialog(true)
                }}
                className="bg-orange hover:bg-orange/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vaccination
              </Button>
            </div>

            {/* Upcoming Vaccinations */}
            {healthInsights.upcomingVaccinations.length > 0 && (
              <Card className="border-orange bg-orange/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-orange" />
                    Upcoming Vaccinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {healthInsights.upcomingVaccinations.map((vaccination) => (
                      <div key={vaccination.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-charcoal">{vaccination.vaccine_name}</p>
                          <p className="text-sm text-grey">
                            Due: {new Date(vaccination.next_due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-orange text-white border-orange">
                          Due Soon
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {vaccinations.map((vaccination) => (
                <Card key={vaccination.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{vaccination.vaccine_name}</CardTitle>
                        <CardDescription>
                          Administered: {new Date(vaccination.date_administered).toLocaleDateString()}
                          {vaccination.next_due_date && (
                            <> • Next due: {new Date(vaccination.next_due_date).toLocaleDateString()}</>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {vaccination.vaccine_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-grey">Veterinarian</Label>
                        <p className="text-charcoal">{vaccination.veterinarian}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-grey">Clinic</Label>
                        <p className="text-charcoal">{vaccination.clinic}</p>
                      </div>
                      {vaccination.batch_number && (
                        <div>
                          <Label className="text-sm font-medium text-grey">Batch Number</Label>
                          <p className="text-charcoal">{vaccination.batch_number}</p>
                        </div>
                      )}
                      {vaccination.manufacturer && (
                        <div>
                          <Label className="text-sm font-medium text-grey">Manufacturer</Label>
                          <p className="text-charcoal">{vaccination.manufacturer}</p>
                        </div>
                      )}
                    </div>
                    {vaccination.notes && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-grey">Notes</Label>
                        <p className="text-charcoal">{vaccination.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {vaccinations.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Syringe className="h-16 w-16 text-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-charcoal mb-2">No vaccination records</h3>
                    <p className="text-grey mb-4">Keep track of {pet.name}'s immunizations</p>
                    <Button
                      onClick={() => {
                        setAddDialogType("vaccination")
                        setShowAddDialog(true)
                      }}
                    >
                      Add First Vaccination
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">AI Health Monitoring</h3>
                <p className="text-grey">Track vital signs and health patterns</p>
              </div>
              <Button
                onClick={() => {
                  setAddDialogType("health_metric")
                  setShowAddDialog(true)
                }}
                className="bg-orange hover:bg-orange/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Metric
              </Button>
            </div>

            {/* Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-teal" />
                  AI Health Score
                </CardTitle>
                <CardDescription>Overall health assessment based on tracked metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Health Score</span>
                      <span>85/100</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Good</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">7.2</p>
                    <p className="text-sm text-grey">Activity Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">8.5</p>
                    <p className="text-sm text-grey">Nutrition Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">9.1</p>
                    <p className="text-sm text-grey">Wellness Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["weight", "activity", "eating"].map((metricType) => {
                const metrics = healthMetrics.filter((m) => m.metric_type === metricType).slice(0, 5)
                const latest = metrics[0]

                return (
                  <Card key={metricType}>
                    <CardHeader>
                      <CardTitle className="capitalize">{metricType}</CardTitle>
                      <CardDescription>Recent measurements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {latest ? (
                        <div>
                          <div className="text-2xl font-bold text-charcoal mb-2">
                            {latest.value} {latest.unit}
                          </div>
                          <p className="text-sm text-grey">{new Date(latest.recorded_at).toLocaleDateString()}</p>
                          <div className="mt-4 space-y-2">
                            {metrics.slice(1, 4).map((metric, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-grey">{new Date(metric.recorded_at).toLocaleDateString()}</span>
                                <span className="text-charcoal">
                                  {metric.value} {metric.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-grey">No data recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">Behavior Tracking</h3>
                <p className="text-grey">Monitor behavioral patterns and changes</p>
              </div>
              <Button
                onClick={() => {
                  setAddDialogType("behavior_log")
                  setShowAddDialog(true)
                }}
                className="bg-orange hover:bg-orange/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Behavior
              </Button>
            </div>

            <div className="space-y-4">
              {behaviorLogs.map((log) => (
                <Card key={log.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">{log.behavior_type}</CardTitle>
                        <CardDescription>
                          {new Date(log.logged_at).toLocaleDateString()} at{" "}
                          {new Date(log.logged_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          log.intensity === "high"
                            ? "border-red-500 text-red-700"
                            : log.intensity === "medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-green-500 text-green-700"
                        }
                      >
                        {log.intensity} intensity
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal mb-4">{log.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {log.duration_minutes && (
                        <div>
                          <Label className="text-grey">Duration</Label>
                          <p className="text-charcoal">{log.duration_minutes} minutes</p>
                        </div>
                      )}
                      {log.location && (
                        <div>
                          <Label className="text-grey">Location</Label>
                          <p className="text-charcoal">{log.location}</p>
                        </div>
                      )}
                      {log.triggers && (
                        <div>
                          <Label className="text-grey">Triggers</Label>
                          <p className="text-charcoal">{log.triggers}</p>
                        </div>
                      )}
                      {log.weather_conditions && (
                        <div>
                          <Label className="text-grey">Weather</Label>
                          <p className="text-charcoal">{log.weather_conditions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {behaviorLogs.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Brain className="h-16 w-16 text-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-charcoal mb-2">No behavior logs</h3>
                    <p className="text-grey mb-4">Start tracking {pet.name}'s behavior patterns</p>
                    <Button
                      onClick={() => {
                        setAddDialogType("behavior_log")
                        setShowAddDialog(true)
                      }}
                    >
                      Log First Behavior
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">Appointments</h3>
                <p className="text-grey">Schedule and manage veterinary visits</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Video Consultation
                </Button>
                <Button className="bg-orange hover:bg-orange/90">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>

            {/* Appointment booking and management would go here */}
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-grey mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">Appointment system coming soon</h3>
                <p className="text-grey mb-4">Advanced booking and video consultation features</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Data Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add {addDialogType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</DialogTitle>
              <DialogDescription>
                Record new {addDialogType.replace("_", " ")} data for {pet.name}
              </DialogDescription>
            </DialogHeader>

            <AddDataForm
              type={addDialogType}
              onSubmit={(data) => handleAddHealthData(addDialogType, data)}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function AddDataForm({
  type,
  onSubmit,
  onCancel,
}: {
  type: string
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const renderForm = () => {
    switch (type) {
      case "health_record":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="record_type">Record Type</Label>
              <Select
                value={formData.record_type}
                onValueChange={(value) => setFormData({ ...formData, record_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="veterinarian">Veterinarian</Label>
              <Input
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <Label htmlFor="clinic">Clinic</Label>
              <Input
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="Animal Hospital"
              />
            </div>
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Diagnosis details..."
              />
            </div>
            <div>
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="Treatment provided..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )

      case "vaccination":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="vaccine_name">Vaccine Name</Label>
              <Input
                value={formData.vaccine_name}
                onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
                placeholder="DHPP, Rabies, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="vaccine_type">Vaccine Type</Label>
              <Select
                value={formData.vaccine_type}
                onValueChange={(value) => setFormData({ ...formData, vaccine_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vaccine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="non-core">Non-Core</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_administered">Date Administered</Label>
              <Input
                type="date"
                value={formData.date_administered}
                onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="next_due_date">Next Due Date</Label>
              <Input
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="veterinarian">Veterinarian</Label>
              <Input
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <Label htmlFor="clinic">Clinic</Label>
              <Input
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="Animal Hospital"
              />
            </div>
            <div>
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="Vaccine batch number"
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Vaccine manufacturer"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )

      case "health_metric":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Metric Type</Label>
              <Select
                value={formData.metric_type}
                onValueChange={(value) => setFormData({ ...formData, metric_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="eating">Eating</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) })}
                placeholder="Enter measurement value"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="bpm">Beats per minute (bpm)</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="grams">Grams (g)</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recorded_at">Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.recorded_at}
                onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="iot_device">IoT Device</SelectItem>
                  <SelectItem value="app">Mobile App</SelectItem>
                  <SelectItem value="vet">Veterinarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this measurement..."
              />
            </div>
          </div>
        )

      case "behavior_log":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="behavior_type">Behavior Type</Label>
              <Select
                value={formData.behavior_type}
                onValueChange={(value) => setFormData({ ...formData, behavior_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select behavior type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eating">Eating</SelectItem>
                  <SelectItem value="sleeping">Sleeping</SelectItem>
                  <SelectItem value="playing">Playing</SelectItem>
                  <SelectItem value="aggression">Aggression</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="social">Social Interaction</SelectItem>
                  <SelectItem value="vocalization">Vocalization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the behavior observed..."
                required
              />
            </div>
            <div>
              <Label htmlFor="intensity">Intensity</Label>
              <Select
                value={formData.intensity}
                onValueChange={(value) => setFormData({ ...formData, intensity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) })}
                placeholder="How long did this behavior last?"
              />
            </div>
            <div>
              <Label htmlFor="triggers">Triggers</Label>
              <Textarea
                value={formData.triggers}
                onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                placeholder="What might have triggered this behavior?"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where did this occur?"
              />
            </div>
            <div>
              <Label htmlFor="weather_conditions">Weather Conditions</Label>
              <Input
                value={formData.weather_conditions}
                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                placeholder="Sunny, rainy, cold, etc."
              />
            </div>
            <div>
              <Label htmlFor="logged_at">Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.logged_at}
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                required
              />
            </div>
          </div>
        )

      default:
        return <div>Unknown form type</div>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderForm()}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-orange hover:bg-orange/90">
          Save {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Button>
      </div>
    </form>
  )
}
