import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Men\'s Clothing',
        description: 'Premium clothing for men',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Women\'s Clothing',
        description: 'Elegant clothing for women',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        description: 'Fashion accessories and more',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Shoes',
        description: 'Premium footwear collection',
      }
    })
  ])

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic White Shirt',
        description: 'A timeless white shirt made from premium cotton. Perfect for both casual and formal occasions.',
        price: 59.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 50,
        sku: 'WS-001',
        featured: true,
        categoryId: categories[1].id, // Women's Clothing
      }
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jacket',
        description: 'Classic denim jacket with modern fit. Perfect for layering in any season.',
        price: 89.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 30,
        sku: 'DJ-001',
        featured: true,
        categoryId: categories[0].id, // Men's Clothing
      }
    }),
    prisma.product.create({
      data: {
        name: 'Leather Handbag',
        description: 'Elegant leather handbag with premium craftsmanship. Spacious and stylish.',
        price: 199.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 15,
        sku: 'LH-001',
        featured: true,
        categoryId: categories[2].id, // Accessories
      }
    }),
    prisma.product.create({
      data: {
        name: 'Running Shoes',
        description: 'Comfortable running shoes with advanced cushioning technology.',
        price: 129.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 25,
        sku: 'RS-001',
        featured: true,
        categoryId: categories[3].id, // Shoes
      }
    }),
    prisma.product.create({
      data: {
        name: 'Casual T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear.',
        price: 29.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 100,
        sku: 'CT-001',
        featured: false,
        categoryId: categories[0].id, // Men's Clothing
      }
    }),
    prisma.product.create({
      data: {
        name: 'Summer Dress',
        description: 'Light and flowing summer dress perfect for warm weather.',
        price: 79.99,
        image: '/placeholder-product.jpg',
        images: JSON.stringify(['/placeholder-product.jpg']),
        stock: 20,
        sku: 'SD-001',
        featured: true,
        categoryId: categories[1].id, // Women's Clothing
      }
    })
  ])

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fashionstore.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    }
  })

  // Create sample buyer user
  const buyerPassword = await bcrypt.hash('buyer123', 12)
  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      name: 'John Buyer',
      password: buyerPassword,
      role: 'BUYER',
      emailVerified: true,
    }
  })

  console.log('Database seeded successfully!')
  console.log('Admin user:', { email: 'admin@fashionstore.com', password: 'admin123' })
  console.log('Buyer user:', { email: 'buyer@example.com', password: 'buyer123' })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })