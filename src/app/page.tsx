import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import Navigation from "@/src/components/Navigation"
import Hero from "@/src/components/Hero"
import ProductGrid from "@/src/components/ProductGrid"
import Footer from "@/src/components/Footer"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <Hero />
        
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our carefully curated collection of premium clothing and accessories
              </p>
            </div>
            
            <ProductGrid />
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="px-8">
                <Link href="/products">
                  View All Products
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Quality Guaranteed</h3>
                  <p className="text-gray-600">Premium materials and expert craftsmanship</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Fast Delivery</h3>
                  <p className="text-gray-600">Quick shipping to your doorstep</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">24/7 Support</h3>
                  <p className="text-gray-600">Always here to help you</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}