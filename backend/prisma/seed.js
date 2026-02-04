import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zenshop.com' },
    update: {},
    create: {
      email: 'admin@zenshop.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Latest gadgets and electronic devices'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        description: 'Fashion and apparel'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        description: 'Home decor and gardening supplies'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Sports & Outdoors' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear'
      }
    })
  ]);
  console.log('Categories created:', categories.map(c => c.name).join(', '));

  // Create products
  const electronics = categories.find(c => c.name === 'Electronics');
  const clothing = categories.find(c => c.name === 'Clothing');
  const home = categories.find(c => c.name === 'Home & Garden');
  const sports = categories.find(c => c.name === 'Sports & Outdoors');

  // Delete existing products first to avoid duplicates
  await prisma.product.deleteMany({});

  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation. Features 40-hour battery life, comfortable over-ear design, and premium sound quality.',
        price: 79.99,
        stock: 50,
        categoryId: electronics.id,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking. Monitor your heart rate, sleep patterns, and daily activity with this stylish wearable.',
        price: 199.99,
        stock: 30,
        categoryId: electronics.id,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker with 360° sound. Perfect for outdoor adventures with 12-hour battery life.',
        price: 49.99,
        stock: 75,
        categoryId: electronics.id,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
      }
    }),
    // Clothing
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% organic cotton t-shirt. Breathable fabric with a modern fit that looks great on everyone.',
        price: 24.99,
        stock: 100,
        categoryId: clothing.id,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole. Engineered for comfort and performance on any terrain.',
        price: 89.99,
        stock: 40,
        categoryId: clothing.id,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jacket',
        description: 'Classic denim jacket with modern fit. Timeless style that pairs perfectly with any outfit.',
        price: 69.99,
        stock: 25,
        categoryId: clothing.id,
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop'
      }
    }),
    // Home & Garden
    prisma.product.create({
      data: {
        name: 'Ceramic Plant Pot',
        description: 'Elegant ceramic pot for indoor plants. Minimalist design with drainage hole for healthy plant growth.',
        price: 29.99,
        stock: 60,
        categoryId: home.id,
        imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with USB charging port. Three brightness levels and flexible neck for perfect lighting.',
        price: 39.99,
        stock: 45,
        categoryId: home.id,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
      }
    }),
    // Sports
    prisma.product.create({
      data: {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap. Extra thick cushioning for joint protection during your practice.',
        price: 34.99,
        stock: 80,
        categoryId: sports.id,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Resistance Bands',
        description: 'Set of 5 resistance bands for home workouts. Different resistance levels for progressive training.',
        price: 19.99,
        stock: 120,
        categoryId: sports.id,
        imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop'
      }
    })
  ]);

  console.log('Products created:', products.length);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
