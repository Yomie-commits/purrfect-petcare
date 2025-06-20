"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, MapPin, DollarSign, Filter, Search, Star } from "lucide-react"

interface AdoptionListing {
  id: string
  pet_name: string
  species: string
  breed: string
  age: number
  gender: string
  size: string
  temperament: string
  description: string
  photos: string[]
  adoption_fee: number
  location: string
  good_with_kids: boolean
  good_with_pets: boolean
  energy_level: string
  users: {
    name: string
    email: string
    phone: string
  }
  created_at: string
}

export default function AdoptionPage() {
  const { user, token } = useAuth()
  const [listings, setListings] = useState<AdoptionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    species: "all",
    size: "all",
    location: "",
    goodWithKids: false,
    goodWithPets: false,
    maxAge: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedListing, setSelectedListing] = useState<AdoptionListing | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [filters, searchTerm])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.species !== "all") params.append("species", filters.species)
      if (filters.size !== "all") params.append("size", filters.size)
      if (filters.location) params.append("location", filters.location)
      if (filters.goodWithKids) params.append("goodWithKids", "true")
      if (filters.goodWithPets) params.append("goodWithPets", "true")
      if (filters.maxAge) params.append("maxAge", filters.maxAge)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/adoption/listings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (listingId: string, applicationData: any) => {
    if (!token) return

    try {
      const response = await fetch("/api/adoption/applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listing_id: listingId,
          application_data: applicationData,
        }),
      })

      if (response.ok) {
        setShowApplicationForm(false)
        // Show success message
      }
    } catch (error) {
      console.error("Error submitting application:", error)
    }
  }

  const getMatchScore = (listing: AdoptionListing) => {
    // Simple matching algorithm based on user preferences
    let score = 0
    if (filters.goodWithKids && listing.good_with_kids) score += 20
    if (filters.goodWithPets && listing.good_with_pets) score += 20
    if (filters.species !== "all" && listing.species === filters.species) score += 30
    if (filters.size !== "all" && listing.size === filters.size) score += 15
    if (filters.location && listing.location.includes(filters.location)) score += 15
    return Math.min(score, 100)
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Pet Adoption</h1>
          <p className="text-grey">Find your perfect companion and give a pet a loving home</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-grey" />
                <Input
                  placeholder="Search pets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.species} onValueChange={(value) => setFilters({ ...filters, species: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Species</SelectItem>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="bird">Birds</SelectItem>
                  <SelectItem value="rabbit">Rabbits</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.size} onValueChange={(value) => setFilters({ ...filters, size: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithKids"
                  checked={filters.goodWithKids}
                  onCheckedChange={(checked) => setFilters({ ...filters, goodWithKids: checked as boolean })}
                />
                <Label htmlFor="goodWithKids">Good with kids</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithPets"
                  checked={filters.goodWithPets}
                  onCheckedChange={(checked) => setFilters({ ...filters, goodWithPets: checked as boolean })}
                />
                <Label htmlFor="goodWithPets">Good with other pets</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-grey/20 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-grey/20 rounded mb-2" />
                  <div className="h-3 bg-grey/20 rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-grey/20 rounded w-20" />
                    <div className="h-3 bg-grey/20 rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const matchScore = getMatchScore(listing)
              return (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <div className="h-48 bg-grey/20 flex items-center justify-center">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img
                          src={listing.photos[0] || "/placeholder.svg"}
                          alt={listing.pet_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Heart className="h-12 w-12 text-grey" />
                      )}
                    </div>
                    {matchScore > 50 && (
                      <Badge className="absolute top-2 right-2 bg-teal text-white">
                        <Star className="h-3 w-3 mr-1" />
                        {matchScore}% Match
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-charcoal">{listing.pet_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {listing.species}
                      </Badge>
                    </div>

                    <p className="text-sm text-grey mb-2">
                      {listing.breed} • {listing.age} years • {listing.size}
                    </p>

                    <p className="text-sm text-charcoal mb-4 line-clamp-2">{listing.description}</p>

                    <div className="flex items-center justify-between text-xs text-grey mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                      {listing.adoption_fee > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          KES {listing.adoption_fee}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      {listing.good_with_kids && (
                        <Badge variant="secondary" className="text-xs">
                          Good with kids
                        </Badge>
                      )}
                      {listing.good_with_pets && (
                        <Badge variant="secondary" className="text-xs">
                          Good with pets
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{listing.pet_name}</DialogTitle>
                            <DialogDescription>
                              {listing.breed} • {listing.age} years old
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            {listing.photos && listing.photos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {listing.photos.slice(0, 4).map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo || "/placeholder.svg"}
                                    alt={`${listing.pet_name} ${index + 1}`}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">About {listing.pet_name}</h4>
                              <p className="text-sm text-grey">{listing.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Species:</strong> {listing.species}
                              </div>
                              <div>
                                <strong>Breed:</strong> {listing.breed}
                              </div>
                              <div>
                                <strong>Age:</strong> {listing.age} years
                              </div>
                              <div>
                                <strong>Size:</strong> {listing.size}
                              </div>
                              <div>
                                <strong>Gender:</strong> {listing.gender}
                              </div>
                              <div>
                                <strong>Energy Level:</strong> {listing.energy_level}
                              </div>
                            </div>

                            {listing.temperament && (
                              <div>
                                <h4 className="font-semibold mb-2">Temperament</h4>
                                <p className="text-sm text-grey">{listing.temperament}</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t">
                              <div>
                                <p className="text-sm text-grey">Contact: {listing.users.name}</p>
                                <p className="text-sm text-grey">{listing.location}</p>
                              </div>
                              {user && (
                                <Button
                                  onClick={() => {
                                    setSelectedListing(listing)
                                    setShowApplicationForm(true)
                                  }}
                                  className="bg-orange hover:bg-orange/90"
                                >
                                  Apply to Adopt
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {user && (
                        <Button
                          size="sm"
                          className="bg-orange hover:bg-orange/90 text-white"
                          onClick={() => {
                            setSelectedListing(listing)
                            setShowApplicationForm(true)
                          }}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {listings.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-grey mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">No pets found</h3>
              <p className="text-grey mb-4">Try adjusting your search filters to find more pets</p>
              <Button
                onClick={() =>
                  setFilters({
                    species: "all",
                    size: "all",
                    location: "",
                    goodWithKids: false,
                    goodWithPets: false,
                    maxAge: "",
                  })
                }
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application Form Dialog */}
        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adoption Application</DialogTitle>
              <DialogDescription>Apply to adopt {selectedListing?.pet_name}</DialogDescription>
            </DialogHeader>

            <AdoptionApplicationForm
              listing={selectedListing}
              onSubmit={(data) => selectedListing && handleApply(selectedListing.id, data)}
              onCancel={() => setShowApplicationForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function AdoptionApplicationForm({
  listing,
  onSubmit,
  onCancel,
}: {
  listing: AdoptionListing | null
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    experience: "",
    housing: "",
    yard: "",
    otherPets: "",
    children: "",
    workSchedule: "",
    veterinarian: "",
    references: "",
    motivation: "",
    emergency: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="experience">Pet ownership experience</Label>
        <Textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          placeholder="Describe your experience with pets..."
          required
        />
      </div>

      <div>
        <Label htmlFor="housing">Housing situation</Label>
        <Textarea
          id="housing"
          value={formData.housing}
          onChange={(e) => setFormData({ ...formData, housing: e.target.value })}
          placeholder="Describe your living situation (house/apartment, rent/own, etc.)..."
          required
        />
      </div>

      <div>
        <Label htmlFor="workSchedule">Work schedule</Label>
        <Textarea
          id="workSchedule"
          value={formData.workSchedule}
          onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
          placeholder="Describe your daily schedule and how you'll care for the pet..."
          required
        />
      </div>

      <div>
        <Label htmlFor="motivation">Why do you want to adopt {listing?.pet_name}?</Label>
        <Textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          placeholder="Tell us why you're interested in adopting this pet..."
          required
        />
      </div>

      <div>
        <Label htmlFor="veterinarian">Veterinarian information</Label>
        <Input
          id="veterinarian"
          value={formData.veterinarian}
          onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
          placeholder="Your veterinarian's name and contact information"
        />
      </div>

      <div>
        <Label htmlFor="references">References</Label>
        <Textarea
          id="references"
          value={formData.references}
          onChange={(e) => setFormData({ ...formData, references: e.target.value })}
          placeholder="Provide 2-3 references (name, relationship, phone number)..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-orange hover:bg-orange/90">
          Submit Application
        </Button>
      </div>
    </form>
  )
}
