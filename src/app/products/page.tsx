import { Suspense } from "react"
import ProductList from "@/src/components/ProductList"
import ProductFilters from "@/src/components/ProductFilters"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Navigation from "@/src/components/Navigation"

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navigation />
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Products</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="mt-2 text-gray-600">Discover our complete collection of premium fashion items</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Content */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div>Loading products...</div>}>
                <ProductList />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}