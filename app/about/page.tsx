import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Pet-First Approach",
      description: "Every decision we make is centered around improving the lives of pets and their families.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "We maintain the highest standards of data security and privacy protection for your pet's information.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Our platform thrives on the collective knowledge and support of pet owners and veterinary professionals.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology to serve pets better.",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Pet Owners" },
    { number: "200+", label: "Veterinary Partners" },
    { number: "100K+", label: "Pets Registered" },
    { number: "99.9%", label: "Uptime Reliability" },
  ]

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Veterinary Officer",
      description:
        "With 15+ years in veterinary medicine, Dr. Johnson ensures our platform meets the highest medical standards.",
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      description: "Former Google engineer passionate about using technology to improve animal welfare and pet care.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Community",
      description: "Pet owner and advocate who leads our community initiatives and lost pet recovery programs.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-800">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Dedicated to
              <span className="text-pink-600"> Better Pet Care</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Founded by pet lovers for pet lovers, Purrfect Pet Care is on a mission to revolutionize how we care for
              our furry, feathered, and scaled family members through technology and community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe every pet deserves the best possible care, and every pet owner should have access to the
                tools and resources they need to provide it. Our platform bridges the gap between pet owners and
                veterinary professionals, creating a comprehensive ecosystem for pet health and wellness.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                From the moment you welcome a new pet into your family to their golden years, we're here to support
                every step of their journey with innovative technology, expert guidance, and a caring community.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                  Join Our Community
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-pink-600 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Purrfect Pet Care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to improving pet care worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-pink-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Purrfect Pet Care Family</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Be part of a community that's revolutionizing pet care, one pet at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-pink-600 hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pink-600"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
