// Sample menu data for testing purposes
export const sampleMenuItems = [
  {
    id: "1",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with tender chicken pieces, exotic spices, and saffron. Served with raita and pickle.",
    price: 120,
    category: "Main Course",
    image: null,
    isVeg: false,
    isSpicy: true,
    prepTime: 25,
    rating: 4.5,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "2",
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes in rich, creamy tomato-based gravy with aromatic spices. Served with naan or rice.",
    price: 95,
    category: "Main Course",
    image: null,
    isVeg: true,
    isSpicy: false,
    prepTime: 20,
    rating: 4.3,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "3",
    name: "Masala Dosa",
    description: "Crispy South Indian crepe made from fermented rice and lentil batter, filled with spiced potato curry.",
    price: 45,
    category: "South Indian",
    image: null,
    isVeg: true,
    isSpicy: true,
    prepTime: 15,
    rating: 4.7,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "4",
    name: "Vada Pav",
    description: "Mumbai's favorite street food - spiced potato fritter in a soft bun with chutneys and fried green chilies.",
    price: 25,
    category: "Snacks",
    image: null,
    isVeg: true,
    isSpicy: true,
    prepTime: 10,
    rating: 4.2,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "5",
    name: "Fresh Lime Soda",
    description: "Refreshing drink made with fresh lime juice, soda water, and a hint of mint. Available sweet or salty.",
    price: 25,
    category: "Beverages",
    image: null,
    isVeg: true,
    isSpicy: false,
    prepTime: 5,
    rating: 4.0,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "6",
    name: "Samosa",
    description: "Crispy triangular pastry filled with spiced potatoes and peas. Served hot with mint and tamarind chutney.",
    price: 20,
    category: "Snacks",
    image: null,
    isVeg: true,
    isSpicy: true,
    prepTime: 8,
    rating: 4.4,
    isAvailable: false,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "7",
    name: "Chole Bhature",
    description: "Spicy chickpea curry served with fluffy deep-fried bread. A North Indian favorite with pickles and onions.",
    price: 75,
    category: "North Indian",
    image: null,
    isVeg: true,
    isSpicy: true,
    prepTime: 18,
    rating: 4.6,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "8",
    name: "Gulab Jamun",
    description: "Soft, spongy milk dumplings soaked in aromatic sugar syrup. A classic Indian dessert served warm.",
    price: 35,
    category: "Desserts",
    image: null,
    isVeg: true,
    isSpicy: false,
    prepTime: 5,
    rating: 4.8,
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

// Function to load sample data into localStorage
export const loadSampleMenuData = () => {
  const existingData = localStorage.getItem('canteenMenuItems');
  if (!existingData || JSON.parse(existingData).length === 0) {
    localStorage.setItem('canteenMenuItems', JSON.stringify(sampleMenuItems));
    return true; // Data was loaded
  }
  return false; // Data already exists
};