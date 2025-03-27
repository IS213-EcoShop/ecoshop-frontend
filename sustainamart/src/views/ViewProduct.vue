```vue type="vue" project="SustainaMart" file="ProductPage.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 py-4">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <a href="/" class="text-[#704116] text-2xl font-bold">SustainaMart</a>
        
        <nav class="hidden lg:flex items-center space-x-6">
          <a href="/about" class="text-sm font-medium hover:text-[#704116]">About Us</a>
          <a href="/marketplace" class="text-sm font-medium hover:text-[#704116]">Marketplace</a>
          <a href="/trade-in" class="text-sm font-medium hover:text-[#704116]">Trade-in Service</a>
          <a href="/sustainability" class="text-sm font-medium hover:text-[#704116]">Sustainability Challenges & Rewards</a>
          <a href="/contact" class="text-sm font-medium hover:text-[#704116]">Contact Us</a>
        </nav>
        
        <div class="flex items-center space-x-4">
          <a href="/account" class="text-gray-800">
            <UserIcon size="20" />
          </a>
          <a href="/search" class="text-gray-800">
            <SearchIcon size="20" />
          </a>
          <a href="/wishlist" class="text-gray-800">
            <HeartIcon size="20" />
          </a>
          <a href="/cart" class="text-gray-800 relative">
            <ShoppingCartIcon size="20" />
            <span 
              v-if="cartItems.length > 0" 
              class="absolute -top-2 -right-2 bg-[#e97171] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartItems.length }}
            </span>
          </a>
        </div>
      </div>
    </header>

    <!-- Breadcrumb -->
    <div class="bg-[#f9f1e7] py-4">
      <div class="container mx-auto px-4">
        <div class="flex items-center text-sm">
          <a href="/marketplace" class="text-gray-500 hover:text-[#704116]">Marketplace</a>
          <span class="mx-2 text-gray-500">&gt;</span>
          <a href="/marketplace/product" class="text-gray-500 hover:text-[#704116]">Product</a>
          <span class="mx-2 text-gray-500">&gt;</span>
          <span class="text-gray-700">Asgaard sofa</span>
        </div>
      </div>
    </div>

    <!-- Product Section -->
    <div class="bg-[#f9f1e7] py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Product Image (removed thumbnails) -->
          <div class="flex-1 bg-[#f9f1e7] p-4">
            <img 
              src="/placeholder.svg?height=400&width=400" 
              alt="Asgaard sofa" 
              class="w-full h-auto object-contain"
            />
          </div>

          <!-- Product Info -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Asgaard sofa</h1>
            <p class="text-xl font-medium text-gray-900 mb-4">${{ product.price }}</p>
            
            <!-- Ratings -->
            <div class="flex items-center mb-1">
              <div class="flex">
                <StarIcon 
                  v-for="i in Math.floor(product.rating)" 
                  :key="i" 
                  class="w-5 h-5 text-[#ffc700] fill-current" 
                />
                <StarHalfIcon 
                  v-if="product.rating % 1 !== 0" 
                  class="w-5 h-5 text-[#ffc700] fill-current" 
                />
              </div>
              <span class="ml-2 text-sm text-gray-500">{{ product.reviewCount }} Customer Review(s)</span>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-gray-700 mb-6">
              {{ product.description }}
            </p>
            
            <!-- Size Selection -->
            <div class="mb-6">
              <p class="text-sm font-medium text-gray-700 mb-2">Size</p>
              <div class="flex space-x-4">
                <button
                  v-for="size in product.sizes"
                  :key="size"
                  :class="[
                    'w-10 h-10 flex items-center justify-center rounded-full',
                    selectedSize === size 
                      ? 'bg-[#b88e2f] text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  ]"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>
            
            <!-- Color Selection -->
            <div class="mb-8">
              <p class="text-sm font-medium text-gray-700 mb-2">Color</p>
              <div class="flex space-x-4">
                <button
                  v-for="(color, index) in product.colors"
                  :key="index"
                  :class="[
                    'w-8 h-8 rounded-full',
                    selectedColor === index ? 'ring-2 ring-offset-2 ring-[#b88e2f]' : ''
                  ]"
                  :style="{ backgroundColor: color }"
                  @click="selectedColor = index"
                  :aria-label="`Select ${color} color`"
                ></button>
              </div>
            </div>
            
            <!-- Add to Cart -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center border border-gray-300">
                <button 
                  class="w-10 h-10 flex items-center justify-center text-gray-700"
                  @click="decrementQuantity"
                >
                  -
                </button>
                <div class="w-10 h-10 flex items-center justify-center border-x border-gray-300">
                  {{ quantity }}
                </div>
                <button 
                  class="w-10 h-10 flex items-center justify-center text-gray-700"
                  @click="incrementQuantity"
                >
                  +
                </button>
              </div>
              <button 
                class="h-10 px-6 bg-[#704116] text-white border border-[#704116] hover:bg-[#8a5a2c] transition-colors"
                @click="addToCart(product, quantity)"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommended Products -->
    <div class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Recommended Products</h2>
        
        <div class="relative">
          <button 
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm"
            @click="prevSlide"
          >
            <ChevronLeftIcon size="20" />
          </button>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 px-12">
            <div 
              v-for="(product, index) in visibleProducts" 
              :key="product.id" 
              class="group"
            >
              <div class="relative mb-4 bg-[#f4f5f7] aspect-square flex items-center justify-center overflow-hidden">
                <div v-if="product.discount" class="absolute top-4 left-4 bg-[#e97171] text-white text-xs font-medium px-2 py-1 rounded-sm">
                  -{{ product.discount }}%
                </div>
                <div v-if="product.tag" class="absolute top-4 right-4 bg-[#2ec1ac] text-white text-xs font-medium px-2 py-1 rounded-sm">
                  {{ product.tag }}
                </div>
                <img 
                  :src="`/placeholder.svg?height=250&width=250`" 
                  :alt="product.name" 
                  class="object-contain"
                />
              </div>
              <h3 class="text-lg font-medium text-gray-800">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 mb-1">{{ product.category }}</p>
              <div class="flex items-center space-x-2 mb-3">
                <span class="font-medium">${{ product.price }}</span>
                <span v-if="product.oldPrice" class="text-sm text-gray-500 line-through">${{ product.oldPrice }}</span>
              </div>
              
              <!-- Quantity and Add to Cart for recommended products -->
              <div class="flex items-center space-x-2">
                <div class="flex items-center border border-gray-300">
                  <button 
                    class="w-8 h-8 flex items-center justify-center text-gray-700 text-sm"
                    @click="decrementRecommendedQuantity(product.id)"
                  >
                    -
                  </button>
                  <div class="w-8 h-8 flex items-center justify-center border-x border-gray-300 text-sm">
                    {{ product.quantity }}
                  </div>
                  <button 
                    class="w-8 h-8 flex items-center justify-center text-gray-700 text-sm"
                    @click="incrementRecommendedQuantity(product.id)"
                  >
                    +
                  </button>
                </div>
                <button 
                  class="h-8 px-3 text-sm bg-[#704116] text-white border border-[#704116] hover:bg-[#8a5a2c] transition-colors"
                  @click="addToCart(product, product.quantity)"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
          
          <button 
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm"
            @click="nextSlide"
          >
            <ChevronRightIcon size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#704116] text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div>
            <h3 class="text-xl font-bold mb-6">SustainaMart</h3>
            <p class="text-sm mb-4">
              2 Bayfront Avenue,<br />
              Unit B1-41, The Shoppes at Marina Bay Sands,<br />
              Singapore, 018972, Singapore
            </p>
          </div>
          
          <!-- Links -->
          <div>
            <h3 class="text-lg font-medium mb-6">Links</h3>
            <ul class="space-y-3">
              <li><a href="/about" class="text-sm hover:underline">About Us</a></li>
              <li><a href="/marketplace" class="text-sm hover:underline">Marketplace</a></li>
              <li><a href="/trade-in" class="text-sm hover:underline">Trade-In Service</a></li>
              <li><a href="/sustainability" class="text-sm hover:underline">Sustainability Challenges</a></li>
              <li><a href="/rewards" class="text-sm hover:underline">Rewards</a></li>
            </ul>
          </div>
          
          <!-- Help -->
          <div>
            <h3 class="text-lg font-medium mb-6">Help</h3>
            <ul class="space-y-3">
              <li><a href="/payment" class="text-sm hover:underline">Payment Options</a></li>
              <li><a href="/returns" class="text-sm hover:underline">Returns</a></li>
              <li><a href="/privacy" class="text-sm hover:underline">Privacy Policies</a></li>
              <li><a href="/faqs" class="text-sm hover:underline">FAQs</a></li>
            </ul>
          </div>
          
          <!-- Newsletter -->
          <div>
            <h3 class="text-lg font-medium mb-6">Newsletter</h3>
            <div class="flex">
              <input 
                type="email" 
                placeholder="Enter Your Email Address" 
                class="bg-white text-gray-800 rounded-none border-0 px-4 py-2 flex-grow"
              />
              <button class="bg-[#b88e2f] hover:bg-[#ffc700] text-white rounded-none px-4 py-2 uppercase text-sm font-medium">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
        
        <div class="border-t border-white/20 mt-12 pt-6 text-sm text-center">
          2025 SustainaMart. All rights reserved
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  UserIcon, 
  SearchIcon, 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  StarHalfIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next';

// Product data
const product = {
  id: 'asgaard-sofa',
  name: 'Asgaard sofa',
  price: '43.40',
  rating: 4.5,
  reviewCount: 5,
  description: 'Setting the bar as one of the loudest speakers in its class, the Kilburn is a compact, stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended highs for a sound.',
  sizes: ['S', 'M', 'L'],
  colors: ['#816dfa', '#000000', '#b88e2f'],
  image: '/placeholder.svg?height=400&width=400'
};

// Recommended products with unique IDs and quantity
const recommendedProducts = ref([
  {
    id: 'syltherine',
    name: 'Syltherine',
    category: 'Stylish cafe chair',
    price: '29.30',
    oldPrice: '32.80',
    discount: '30',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
  {
    id: 'leviosa',
    name: 'Leviosa',
    category: 'Stylish cafe chair',
    price: '21.30',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
  {
    id: 'lolito',
    name: 'Lolito',
    category: 'Luxury big sofa',
    price: '35.20',
    oldPrice: '48.00',
    discount: '50',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
  {
    id: 'respira',
    name: 'Respira',
    category: 'Outdoor bar table and stool',
    price: '34.30',
    tag: 'New',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
  {
    id: 'pingky',
    name: 'Pingky',
    category: 'Cute bed set',
    price: '42.50',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
  {
    id: 'potty',
    name: 'Potty',
    category: 'Minimalist flower pot',
    price: '18.90',
    discount: '25',
    oldPrice: '25.20',
    quantity: 1,
    image: '/placeholder.svg?height=250&width=250'
  },
]);

// Carousel functionality
const currentSlide = ref(0);
const itemsPerSlide = 4; // Number of items to show at once

// Compute visible products based on current slide
const visibleProducts = computed(() => {
  const start = currentSlide.value * itemsPerSlide;
  return recommendedProducts.value.slice(start, start + itemsPerSlide);
});

// Carousel navigation
const nextSlide = () => {
  const maxSlide = Math.ceil(recommendedProducts.value.length / itemsPerSlide) - 1;
  if (currentSlide.value < maxSlide) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0; // Loop back to the beginning
  }
};

const prevSlide = () => {
  const maxSlide = Math.ceil(recommendedProducts.value.length / itemsPerSlide) - 1;
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = maxSlide; // Loop to the end
  }
};

// State
const selectedSize = ref('S');
const selectedColor = ref(0);
const quantity = ref(1);
const cartItems = ref([]);

// Methods for main product
const incrementQuantity = () => {
  quantity.value++;
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Methods for recommended products
const incrementRecommendedQuantity = (productId) => {
  const product = recommendedProducts.value.find(p => p.id === productId);
  if (product) {
    product.quantity++;
  }
};

const decrementRecommendedQuantity = (productId) => {
  const product = recommendedProducts.value.find(p => p.id === productId);
  if (product && product.quantity > 1) {
    product.quantity--;
  }
};

// Cart functionality
const addToCart = (product, qty) => {
  // Check if product is already in cart
  const existingItem = cartItems.value.find(item => item.id === product.id);
  
  if (existingItem) {
    // Update quantity if product already exists
    existingItem.quantity += qty;
  } else {
    // Add new item to cart
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image || '/placeholder.svg?height=100&width=100'
    });
  }
  
  // Show confirmation message
  alert(`Added ${qty} ${product.name} to cart!`);
};
</script>

<style>
/* You can add any additional custom styles here if needed */
</style>