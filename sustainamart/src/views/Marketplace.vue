<template>
  <div class="marketplace">

    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-blur-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Marketplace</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <chevron-right-icon class="breadcrumb-icon" />
          <span class="breadcrumb-current">Marketplace</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <button class="filter-button">
            <span class="filter-icon"></span> Filter
          </button>
          <div class="results-info">Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage *
            itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} results</div>
          <div class="sort-options">
            <span>Show</span>
            <select class="select-control" v-model="itemsPerPage" @change="resetPagination">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
            </select>
            <span>Sort by</span>
            <select class="select-control" v-model="sortBy" @change="applySort">
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="filter-section">
              <h3>Categories</h3>
              <div class="filter-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Green Beauty"> Green Beauty/ Personal Care
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Technology"> Technology Gadgets
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Fashion"> Fashion
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Furniture"> Furniture/ Home Decor
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-slider">
                <input type="range" min="0" max="100" v-model="priceRange" class="slider" @change="applyPriceFilter">
                <div class="price-inputs">
                  <div>
                    <label>Min</label>
                  </div>
                  <div>
                    <label>Max</label>
                  </div>
                </div>
              </div>
            </div>

            <button class="apply-filters-btn" @click="applyFilters">Apply Filters</button>
          </aside>

          <!-- Products Section -->
          <div class="products-section">
            <!-- Product Grid -->
            <div class="product-grid">
              <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name">
                  <span v-if="product.tag" class="product-tag" :class="product.tagClass">
                    {{ product.tag }}
                  </span>
                </div>
                <div class="product-info">
                  <a :href="`/product/${product.id}`" class="product-title-link"
                    @click.prevent="viewProductDetails(product.id)">
                    <h3 class="product-title">{{ product.name }}</h3>
                  </a>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">
                    <span class="current-price">${{ product.price.toFixed(2) }}</span>
                    <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice.toFixed(2)
                      }}</span>
                  </div>
                  
                  <!-- Quantity Selector and Add to Cart -->
                  <div class="quantity-cart-container">
                    <div class="quantity-selector">
                      <button @click="decrementQuantity(product.id)" class="quantity-btn">-</button>
                      <span class="quantity-value">{{ productQuantities[product.id] || 1 }}</span>
                      <button @click="incrementQuantity(product.id)" class="quantity-btn">+</button>
                    </div>
                    <button @click="addToCart(product)" class="add-to-cart-btn">Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button class="page-button prev" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                Prev
              </button>

              <button v-for="page in totalPages" :key="page" class="page-button"
                :class="{ active: currentPage === page }" @click="changePage(page)">
                {{ page }}
              </button>

              <button class="page-button next" :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="features-section">
          <div class="feature">
            <div class="feature-icon trophy-icon"></div>
            <div class="feature-content">
              <h3>High Quality</h3>
              <p>Crafted from top materials</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon warranty-icon"></div>
            <div class="feature-content">
              <h3>Warranty Protection</h3>
              <p>Over 2 years</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon shipping-icon"></div>
            <div class="feature-content">
              <h3>Free Shipping</h3>
              <p>Order over 150 $</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon support-icon"></div>
            <div class="feature-content">
              <h3>24 / 7 Support</h3>
              <p>Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Cart Notification Popup -->
    <div class="notification-popup" v-if="showNotification" :class="{ 'show': showNotification }">
      <div class="notification-content">
        <h3 class="notification-title">Item Added to Cart <button class="close-notification" @click="hideNotification">×</button></h3>
        <div class="notification-body">
          <div class="notification-icon-container">
            <check-circle-icon class="notification-icon" />
          </div>
          <p class="notification-message">{{ notificationMessage }}</p>
        </div>
        <button class="view-cart-btn" @click="navigateToCart">View Cart</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'MarketplaceTab',
  beforeCreate() {
    console.log('MARKETPLACE - beforeCreate') // Should appear first

  },
  created() {
    console.log('MARKETPLACE - created') // Should appear second
  },
  beforeMount() {
    console.log('MARKETPLACE - beforeMount') // Should appear third
    this.fetchProducts()

  },
  mounted() {
    console.log('MARKETPLACE - mounted') // Should appear last
  },
  data() {
    return {
      priceRange: [0, 1000],
      cart: [],
      currentPage: 1,
      itemsPerPage: 12,
      sortBy: 'default',
      filters: {
        categories: [],
        minPrice: 0,
        maxPrice: 1000
      },
      allProducts: [],
      isLoading: false,
      error: null,
      productQuantities: {}, // Store quantities for each product
      showNotification: false,
      notificationMessage: '',
      notificationTimeout: null
    }
  },


  computed: {
    filteredProducts() {
      let result = [...this.allProducts];

      // Apply category filters
      if (this.filters.categories.length > 0) {
        result = result.filter(product =>
          this.filters.categories.some(cat => product.category.includes(cat))
        );
      }

      // Apply price filter
      result = result.filter(product =>
        product.price >= this.filters.minPrice && product.price <= this.filters.maxPrice
      );

      // Apply sorting
      if (this.sortBy === 'price-low') {
        result.sort((a, b) => a.price - b.price);
      } else if (this.sortBy === 'price-high') {
        result.sort((a, b) => b.price - a.price);
      } else if (this.sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }

      return result;
    },
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredProducts.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },
  methods: {
    async fetchProducts() {
      this.isLoading = true
      this.error = null

      try {
        // Fetch products from your API
        console.log('Fetching products from API...');

        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/allproducts/')
        if (!response.ok) throw new Error('Failed to fetch products')

        // Get the JSON data
        const responseData = await response.json();

        // Extract the Products array - THIS IS THE CRUCIAL FIX
        const products = responseData.Products || [];
        console.log('Products:', products);

        if (!Array.isArray(products)) {
          throw new Error('Products data is not an array');
        }
        console.log('Products array length:', products.length);


        this.allProducts = products.map(product => ({
          // Map your API fields to your component's expected structure
          id: product.productId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          image: product.ImageURL, // Or process with Supabase if needed
          category: product.Category,
          tag: product.TagClass ? product.TagClass.split('-').join(' ') : null,
          tagClass: product.TagClass
        }));

        // Initialize quantities for all products
        const quantities = {};
        this.allProducts.forEach(product => {
          quantities[product.id] = 1;
        });
        this.productQuantities = quantities;

      } catch (err) {
        this.error = err.message
        console.error('Error fetching products:', err)
      } finally {
        this.isLoading = false
      }
    },

    changePage(page) {
      this.currentPage = page;
      // Scroll to top of products section
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    applySort() {
      this.currentPage = 1;
    },
    applyPriceFilter() {
      // Convert slider value to price range
      this.filters.minPrice = 0;
      this.filters.maxPrice = this.priceRange * 10; // Max price of 200
    },
    applyFilters() {
      this.currentPage = 1;
    },
    resetPagination() {
      this.currentPage = 1;
    },
    
    // Increment quantity for a specific product
    incrementQuantity(productId) {
      // Create a new object to ensure reactivity
      const newQuantities = { ...this.productQuantities };
      newQuantities[productId] = (newQuantities[productId] || 1) + 1;
      this.productQuantities = newQuantities;
      console.log(`Incremented product ${productId} to quantity ${this.productQuantities[productId]}`);
    },
    
    // Decrement quantity for a specific product
    decrementQuantity(productId) {
      if ((this.productQuantities[productId] || 1) > 1) {
        // Create a new object to ensure reactivity
        const newQuantities = { ...this.productQuantities };
        newQuantities[productId] = newQuantities[productId] - 1;
        this.productQuantities = newQuantities;
        console.log(`Decremented product ${productId} to quantity ${this.productQuantities[productId]}`);
      }
    },
    
    // Show notification
    showCartNotification(message) {
      // Clear any existing timeout
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      this.notificationMessage = message;
      this.showNotification = true;
      
      // Auto-hide after 3 seconds
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, 3000);
    },
    
    // Hide notification
    hideNotification() {
      this.showNotification = false;
    },
    
    // Navigate to cart page
    navigateToCart() {
      // Hide the notification
      this.hideNotification();
      
      // In a real app with Vue Router, you would use:
      // this.$router.push('/cart');
      
      // For now, we'll just show an alert
      alert('Navigating to cart page...');
      
      // You could also use window.location for a full page navigation:
      // window.location.href = '/cart';
    },
    
    // Add to cart with quantity
    addToCart(product) {
      const quantity = this.productQuantities[product.id] || 1;
      
      // Check if product is already in cart
      const existingProductIndex = this.cart.findIndex(item => item.id === product.id);

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists in cart
        const updatedCart = [...this.cart];
        updatedCart[existingProductIndex].quantity = quantity;
        this.cart = updatedCart;
      } else {
        // Add new product to cart
        const cartItem = {
          ...product,
          quantity: quantity
        };

        this.cart.push(cartItem);
      }

      // Show notification popup
      const message = `${quantity} ${product.name}${quantity > 1 ? 's' : ''} ${quantity > 1 ? 'have' : 'has'} been added to your cart successfully!`;
      this.showCartNotification(message);
      
      console.log('Cart updated:', this.cart);
    },
    
    viewProductDetails(productId) {
      // In a real app, this would navigate to the product detail page
      // For now, we'll just show an alert
      alert(`Viewing details for product ID: ${productId}`);

      // In a real app with Vue Router, you would use:
      // this.$router.push(`/product/${productId}`);
    }
  },
  created() {
    // Initialize any data or perform actions when component is created
    this.applyFilters();
  }
}
</script>

<script setup>
import { 
  User as UserIcon, 
  Search as SearchIcon, 
  Heart as HeartIcon, 
  ShoppingCart as ShoppingCartIcon,
  ChevronRight as ChevronRightIcon,
  Trophy as TrophyIcon,
  ShieldCheck as ShieldCheckIcon,
  Truck as TruckIcon,
  Headphones as HeadphonesIcon,
  CheckCircle as CheckCircleIcon,
  X as XIcon
} from 'lucide-vue-next'
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #242424;
  line-height: 1.6;
  background-color: #faf3ea;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

/* Header Styles */
.header {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #704116;
}

.main-nav ul {
  display: flex;
  gap: 20px;
}

.main-nav a {
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover,
.main-nav a.active {
  color: #704116;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon {
  width: 20px;
  height: 20px;
  background-color: #333;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.user-icon {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>');
}

.search-icon {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>');
}

.wishlist-icon {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>');
}

.cart-icon {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>');
}

/* Cart Icon and Mini Cart */
.cart-icon-wrapper {
  position: relative;
  cursor: pointer;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e97171;
  color: white;
  font-size: 10px;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero Banner */
.hero-section {
  position: relative;
  height: 200px;
  background-image: url('rectangle-1.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.2);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 10;
  position: relative; /* Ensures content stays above the blur overlay */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); /* Optional: adds slight shadow to make text more readable */
}

.breadcrumb {
  display: flex;
  align-items: center;
  color: #704116;
  border-radius: 1rem;
}

.breadcrumb-link {
  font-size: 0.875rem;
}

.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
  margin: 0 0.5rem;
}

.breadcrumb-current {
  font-size: 0.875rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f9f1e7;
  border-radius: 8px 8px 0 0;
  margin-top: 20px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background-color: #fff;
  border-radius: 4px;
  font-weight: 500;
}

.filter-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #333;
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.results-info {
  font-size: 14px;
  color: #666;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.select-control {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  margin: 30px 0;
}

/* Sidebar */
.sidebar {
  background-color: #f9f1e7;
  padding: 20px;
  border-radius: 8px;
}

.filter-section {
  margin-bottom: 25px;
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 600;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.price-slider {
  margin-top: 15px;
}

.slider {
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e0d5c8;
  border-radius: 5px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #704116;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #704116;
  cursor: pointer;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.apply-filters-btn {
  width: 100%;
  padding: 10px;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 20px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.product-image {
  position: relative;
  height: 200px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Link */
.product-title-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.product-title-link:hover .product-title {
  color: #704116;
}

/* Quantity Selector and Add to Cart */
.quantity-cart-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10; /* Ensure buttons are above product link */
}

.quantity-btn:hover {
  background-color: #e0e0e0;
}

.quantity-value {
  width: 30px;
  text-align: center;
  font-size: 14px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 8px 12px;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.3s;
  z-index: 10; /* Ensure button is above product link */
}

.add-to-cart-btn:hover {
  background-color: #5a3412;
}

/* Product Tag */
.product-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  z-index: 2;
}

.product-tag.cruelty-free {
  background-color: #e97171;
}

.product-tag.plastic-free {
  background-color: #62acb1;
}

.product-tag.low-waste {
  background-color: #2ec1ac;
}

.product-info {
  padding: 15px;
}

.product-title {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 600;
  transition: color 0.3s;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-price {
  font-weight: 600;
  font-size: 16px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 20px;
}

.page-button {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  background-color: #f5f5f5;
  padding: 0 10px;
}

.page-button.active {
  background-color: #704116;
  color: #fff;
}

.page-button:hover:not(.active):not(:disabled) {
  background-color: #e0d5c8;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-button.prev,
.page-button.next {
  min-width: 60px;
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 40px 0;
  padding: 30px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.feature {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background-color: #704116;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feature-icon::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #fff;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.trophy-icon::after {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>');
}

.warranty-icon::after {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>');
}

.shipping-icon::after {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>');
}

.support-icon::after {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>');
}

.feature-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.feature-content p {
  font-size: 14px;
  color: #666;
}

/* Notification Popup */
.notification-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  max-width: 450px;
  width: 90%;
  overflow: hidden;
}

.notification-popup.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.notification-content {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.notification-title {
  font-size: 18px;
  font-weight: 600;
  color: #704116;
  margin: 0;
  padding: 15px 20px;
  background-color: #f9f1e7;
  border-bottom: 1px solid rgba(112, 65, 22, 0.1);
  position: relative;
}

.notification-body {
  display: flex;
  align-items: center;
  padding: 20px;
}

.notification-icon-container {
  width: 60px;
  height: 60px;
  background-color: rgba(46, 193, 172, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.notification-icon {
  color: #2ec1ac;
  width: 30px;
  height: 30px;
}

.notification-message {
  font-size: 16px;
  color: #333;
  margin: 0;
  flex: 1;
}

.close-notification {
  position: absolute;
  top: 10px;
  right: 15px;
  color: #704116;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  padding: 0;
  margin: 0;
}

.view-cart-btn {
  background-color: #704116;
  color: white;
  border: none;
  padding: 12px 20px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  margin: 0 20px 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
  width: calc(100% - 40px);
}

.view-cart-btn:hover {
  background-color: #5a3412;
}

@media (max-width: 480px) {
  .notification-popup {
    width: 95%;
  }
  
  .notification-body {
    flex-direction: column;
    text-align: center;
  }
  
  .notification-icon-container {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>