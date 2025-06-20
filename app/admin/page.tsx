"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  PawPrint,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Heart,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  summary: {
    totalUsers: number
    totalRevenue: number
    totalAppointments: number
    completedAppointments: number
    totalPets: number
    activeLostPets: number
    availableAdoptions: number
    appointmentCompletionRate: number
  }
  trends: {
    userRegistrations: Array<{ date: string; count: number }>
    appointments: Array<{ date: string; count: number }>
    revenue: Array<{ date: string; amount: number }>
  }
  breakdowns: {
    paymentMethods: { [key: string]: number }
    petSpecies: { [key: string]: number }
    userRoles: { [key: string]: number }
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  stats: {
    totalPets: number
    totalAppointments: number
    totalSpent: number
  }
}

export default function AdminDashboard() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [userFilters, setUserFilters] = useState({
    role: "all", // Updated default value to "all"
    search: "",
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchAnalytics()
    fetchUsers()
  }, [user, period, userFilters])

  const fetchAnalytics = async () => {
    if (!token) return

    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchUsers = async () => {
    if (!token) return

    try {
      const params = new URLSearchParams()
      if (userFilters.role !== "all") params.append("role", userFilters.role)
      if (userFilters.search) params.append("search", userFilters.search)

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-orange animate-pulse mx-auto mb-4" />
          <p className="text-grey">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const COLORS = ["#FF7300", "#3AAFA9", "#111318", "#C0C0C0"]

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Admin Dashboard</h1>
          <p className="text-grey">System overview and management tools</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{analytics.summary.totalUsers}</div>
                  <p className="text-xs text-grey">Active registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">
                    KES {analytics.summary.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-grey">Total revenue generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{analytics.summary.totalAppointments}</div>
                  <p className="text-xs text-grey">
                    {analytics.summary.appointmentCompletionRate.toFixed(1)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Pets</CardTitle>
                  <PawPrint className="h-4 w-4 text-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{analytics.summary.totalPets}</div>
                  <p className="text-xs text-grey">Total pets in system</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange" />
                    Lost Pets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-charcoal mb-2">{analytics.summary.activeLostPets}</div>
                  <p className="text-sm text-grey">Currently reported as lost</p>
                  <Badge variant="destructive" className="mt-2">
                    Needs Attention
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-teal" />
                    Adoptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-charcoal mb-2">{analytics.summary.availableAdoptions}</div>
                  <p className="text-sm text-grey">Available for adoption</p>
                  <Badge variant="secondary" className="mt-2">
                    Active Listings
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold text-charcoal">Operational</span>
                  </div>
                  <p className="text-sm text-grey">All systems running normally</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">99.9% Uptime</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                    <Users className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">New user registration</p>
                      <p className="text-xs text-grey">John Doe registered as a pet owner</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      2 min ago
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                    <Calendar className="h-5 w-5 text-orange" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Appointment completed</p>
                      <p className="text-xs text-grey">Dr. Smith completed appointment with Max</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      15 min ago
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Payment received</p>
                      <p className="text-xs text-grey">KES 2,500 payment via M-Pesa</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      1 hour ago
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Filters */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage and monitor user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                    className="max-w-sm"
                  />
                  <Select
                    value={userFilters.role}
                    onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="pet_owner">Pet Owners</SelectItem>
                      <SelectItem value="vet">Veterinarians</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-orange" />
                        </div>
                        <div>
                          <h3 className="font-medium text-charcoal">{userData.name}</h3>
                          <p className="text-sm text-grey">{userData.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{userData.role}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              Joined {new Date(userData.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-grey">
                          <p>{userData.stats.totalPets} pets</p>
                          <p>{userData.stats.totalAppointments} appointments</p>
                          <p>KES {userData.stats.totalSpent.toLocaleString()} spent</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Registration Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.trends.userRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#FF7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.trends.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#3AAFA9" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.breakdowns.paymentMethods).map(([method, count]) => ({
                          name: method,
                          value: count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.breakdowns.paymentMethods).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pet Species Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(analytics.breakdowns.petSpecies).map(([species, count]) => ({
                        species,
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="species" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-grey">Database</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-grey">API Services</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-grey">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-grey">Notifications</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Delayed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">High API Usage</p>
                    <p className="text-xs text-yellow-600">API calls exceeded 80% of daily limit</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Failed Payment</p>
                    <p className="text-xs text-red-600">M-Pesa integration timeout detected</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Database Backup</p>
                    <p className="text-xs text-blue-600">Scheduled backup completed successfully</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
