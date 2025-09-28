import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Premium
            <br />
            <span className="text-primary">Fashion</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Elevate your style with our carefully curated collection of premium clothing and accessories. 
            Quality meets sophistication in every piece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 text-lg" asChild>
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-black text-lg border-white hover:bg-white hover:text-gray-700" asChild>
              <Link href="/categories">
                Explore Categories
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}