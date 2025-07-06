require('dotenv').config();
const mongoose = require('mongoose');
const WishlistTemplate = require('./models/WishlistTemplate');


// Connect to MongoDB
mongoose
.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

const defaultTemplates = [
  {
    name: 'Birthday Wishlist',
    description: 'A collection of birthday gift ideas for any age',
    category: 'Celebration',
    isPublic: true,
    templateProducts: [
      {
        name: 'Wireless Headphones',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        price: 99.99,
        category: 'Electronics',
        tags: ['tech', 'music', 'wireless'],
        description: 'High-quality wireless headphones for music lovers'
      },
      {
        name: 'Gourmet Chocolate Box',
        imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
        price: 29.99,
        category: 'Food & Beverages',
        tags: ['chocolate', 'gourmet', 'sweet'],
        description: 'Premium selection of artisan chocolates'
      },
      {
        name: 'Personalized Photo Frame',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
        price: 24.99,
        category: 'Home & Garden',
        tags: ['personalized', 'memories', 'home'],
        description: 'Beautiful frame for treasured memories'
      }
    ]
  },
  {
    name: 'Wedding Registry',
    description: 'Essential items for newlyweds starting their life together',
    category: 'Wedding',
    isPublic: true,
    templateProducts: [
      {
        name: 'Kitchen Mixer',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        price: 299.99,
        category: 'Kitchen',
        tags: ['cooking', 'baking', 'appliance'],
        description: 'Professional stand mixer for baking enthusiasts'
      },
      {
        name: 'Bedding Set',
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
        price: 89.99,
        category: 'Bedroom',
        tags: ['bedding', 'comfort', 'sleep'],
        description: 'Luxury cotton bedding set for ultimate comfort'
      },
      {
        name: 'Coffee Maker',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        price: 149.99,
        category: 'Kitchen',
        tags: ['coffee', 'morning', 'beverage'],
        description: 'Programmable coffee maker for perfect brews'
      }
    ]
  },
  {
    name: 'Holiday Gift Guide',
    description: 'Perfect gifts for the holiday season',
    category: 'Holiday',
    isPublic: true,
    templateProducts: [
      {
        name: 'Smart Watch',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        price: 199.99,
        category: 'Electronics',
        tags: ['smart', 'fitness', 'tech'],
        description: 'Feature-rich smartwatch for health tracking'
      },
      {
        name: 'Scented Candles Set',
        imageUrl: 'https://images.unsplash.com/photo-1603006905005-6a2cc2ee0a8a?w=400',
        price: 39.99,
        category: 'Home & Garden',
        tags: ['candles', 'aromatherapy', 'relaxation'],
        description: 'Aromatic candles for cozy atmosphere'
      },
      {
        name: 'Board Game Collection',
        imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400',
        price: 59.99,
        category: 'Entertainment',
        tags: ['games', 'family', 'fun'],
        description: 'Family-friendly board games for entertainment'
      }
    ]
  },
  {
    name: 'Baby Shower Gifts',
    description: 'Essential items for expecting parents',
    category: 'Baby',
    isPublic: true,
    templateProducts: [
      {
        name: 'Baby Monitor',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        price: 129.99,
        category: 'Baby Care',
        tags: ['monitor', 'safety', 'peace-of-mind'],
        description: 'Video baby monitor with night vision'
      },
      {
        name: 'Diaper Bag',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        price: 79.99,
        category: 'Baby Care',
        tags: ['diapers', 'travel', 'organization'],
        description: 'Stylish and functional diaper bag'
      },
      {
        name: 'Baby Clothes Set',
        imageUrl: 'https://images.unsplash.com/photo-1553451191-6d8b735d5c56?w=400',
        price: 49.99,
        category: 'Baby Care',
        tags: ['clothing', 'comfort', 'cute'],
        description: 'Soft and comfortable baby clothing set'
      }
    ]
  },
  {
    name: 'Graduation Gifts',
    description: 'Perfect gifts for graduates starting their next chapter',
    category: 'Education',
    isPublic: true,
    templateProducts: [
      {
        name: 'Laptop',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        price: 899.99,
        category: 'Electronics',
        tags: ['computer', 'work', 'study'],
        description: 'High-performance laptop for work and study'
      },
      {
        name: 'Professional Watch',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
        price: 199.99,
        category: 'Fashion',
        tags: ['professional', 'style', 'timepiece'],
        description: 'Elegant watch for professional settings'
      },
      {
        name: 'Travel Backpack',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        price: 89.99,
        category: 'Travel',
        tags: ['travel', 'adventure', 'durable'],
        description: 'Durable backpack for travel and adventures'
      }
    ]
  }
];

async function seedTemplates() {
  try {
    // Clear existing templates
    await WishlistTemplate.deleteMany({});
    console.log('Cleared existing templates');

    // Insert default templates
    const templates = await WishlistTemplate.insertMany(defaultTemplates);
    console.log(`Successfully seeded ${templates.length} templates`);

    // Log the created templates
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('Error seeding templates:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedTemplates(); 