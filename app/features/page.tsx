import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, MapPin, CreditCard, Shield, Users, Smartphone, Bell, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Heart,
      title: "Comprehensive Pet Profiles",
      description:
        "Create detailed profiles for each pet including medical history, vaccinations, allergies, and behavioral notes.",
      benefits: ["Medical history tracking", "Vaccination schedules", "Photo galleries", "Emergency contacts"],
    },
    {
      icon: Calendar,
      title: "Smart Appointment Scheduling",
      description:
        "Book appointments with veterinarians, set reminders, and manage your pet care calendar effortlessly.",
      benefits: ["Online booking", "Automated reminders", "Calendar sync", "Recurring appointments"],
    },
    {
      icon: MapPin,
      title: "Lost Pet Recovery Network",
      description: "Report lost pets and help reunite them with families through our community-driven platform.",
      benefits: ["GPS location tracking", "Community alerts", "Photo recognition", "Reward system"],
    },
    {
      icon: CreditCard,
      title: "Secure Payment Processing",
      description: "Pay for veterinary services securely with M-Pesa, PayPal, and other payment methods.",
      benefits: ["Multiple payment options", "Secure transactions", "Payment history", "Automatic receipts"],
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Never miss important pet care tasks with intelligent reminders and notifications.",
      benefits: ["Vaccination reminders", "Appointment alerts", "Medication schedules", "Health checkups"],
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      description: "Track your pet's health trends and get insights into their wellbeing over time.",
      benefits: ["Weight tracking", "Health trends", "Vet recommendations", "Progress reports"],
    },
    {
      icon: Users,
      title: "Veterinary Network",
      description: "Connect with certified veterinarians and pet care professionals in your area.",
      benefits: ["Verified professionals", "Reviews and ratings", "Specialization filters", "Emergency contacts"],
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Access all features on any device with our responsive, mobile-optimized platform.",
      benefits: ["Cross-platform sync", "Offline access", "Push notifications", "Touch-friendly interface"],
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your pet's data is protected with bank-level security and privacy measures.",
      benefits: ["Data encryption", "GDPR compliant", "Regular backups", "Access controls"],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-800">Features</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="text-pink-600"> Complete Pet Care</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features you need to keep your pets healthy, happy,
              and safe. From health tracking to emergency support, we've got you covered.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-pink-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Pet Care?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners who trust Purrfect Pet Care for comprehensive pet management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-pink-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pink-600"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
