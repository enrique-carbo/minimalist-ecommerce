"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  onFiltersChange?: (filters: {
    categoryId?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    featured?: boolean
  }) => void
}

export default function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [featuredOnly, setFeaturedOnly] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filters = {
      categoryId: selectedCategory,
      search: searchTerm || undefined,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
      featured: featuredOnly || undefined,
    }
    onFiltersChange?.(filters)
  }, [selectedCategory, searchTerm, priceRange, featuredOnly, onFiltersChange])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const clearFilters = () => {
    setSelectedCategory(undefined)
    setSearchTerm("")
    setPriceRange({ min: "", max: "" })
    setFeaturedOnly(false)
  }

  const hasActiveFilters = selectedCategory || searchTerm || priceRange.min || priceRange.max || featuredOnly

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <Accordion type="single" collapsible defaultValue="categories">
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm">Categories</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategory === category.id}
                    onCheckedChange={(checked) => {
                      setSelectedCategory(checked ? category.id : undefined)
                    }}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Price Range */}
        <Accordion type="single" collapsible defaultValue="price">
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm">Price Range</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="min-price" className="text-xs">Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max-price" className="text-xs">Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Featured Products */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={featuredOnly}
            onCheckedChange={(checked) => setFeaturedOnly(!!checked)}
          />
          <Label htmlFor="featured" className="text-sm cursor-pointer">
            Featured Products Only
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}