import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, MapPin, CreditCard, Shield, Users } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Heart,
      title: "Pet Health Management",
      description: "Keep track of your pet's health records, vaccinations, and medical history in one place.",
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Schedule and manage veterinary appointments with automated reminders.",
    },
    {
      icon: MapPin,
      title: "Lost Pet Recovery",
      description: "Report lost pets and help reunite them with their families through our community network.",
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Secure payment processing with M-Pesa and PayPal integration for all services.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your pet's data is protected with enterprise-grade security and privacy measures.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other pet owners and veterinary professionals in your area.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Purrfect Care for Your
              <span className="text-pink-600"> Beloved Pets</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive pet care management system that helps you keep track of your pet's health, schedule
              appointments, and connect with veterinary professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Pet Care</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to keep your pets healthy and happy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-pink-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Give Your Pet the Best Care?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners who trust Purrfect Pet Care for their furry friends.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-pink-600 hover:bg-gray-100">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
