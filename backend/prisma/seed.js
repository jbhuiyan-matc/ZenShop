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

  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 79.99,
        stock: 50,
        categoryId: electronics.id,
        imageUrl: '/images/headphones.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking',
        price: 199.99,
        stock: 30,
        categoryId: electronics.id,
        imageUrl: '/images/smartwatch.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker',
        price: 49.99,
        stock: 75,
        categoryId: electronics.id,
        imageUrl: '/images/speaker.jpg'
      }
    }),
    // Clothing
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: 24.99,
        stock: 100,
        categoryId: clothing.id,
        imageUrl: '/images/tshirt.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole',
        price: 89.99,
        stock: 40,
        categoryId: clothing.id,
        imageUrl: '/images/shoes.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jacket',
        description: 'Classic denim jacket with modern fit',
        price: 69.99,
        stock: 25,
        categoryId: clothing.id,
        imageUrl: '/images/jacket.jpg'
      }
    }),
    // Home & Garden
    prisma.product.create({
      data: {
        name: 'Ceramic Plant Pot',
        description: 'Elegant ceramic pot for indoor plants',
        price: 29.99,
        stock: 60,
        categoryId: home.id,
        imageUrl: '/images/pot.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with USB charging',
        price: 39.99,
        stock: 45,
        categoryId: home.id,
        imageUrl: '/images/lamp.jpg'
      }
    }),
    // Sports
    prisma.product.create({
      data: {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap',
        price: 34.99,
        stock: 80,
        categoryId: sports.id,
        imageUrl: '/images/yogamat.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Resistance Bands',
        description: 'Set of 5 resistance bands for home workouts',
        price: 19.99,
        stock: 120,
        categoryId: sports.id,
        imageUrl: '/images/bands.jpg'
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
