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

        <!-- Cart Link -->
        <div class="cart-link-container">
          <a href="/cart" class="cart-link">
            <shopping-cart-icon size="18" />
            <span>View Cart ({{ cartItemCount }})</span>
          </a>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="filter-section">
              <h3>Categories</h3>
              <div class="filter-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Green-Beauty"> Green Beauty/ Personal Care
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
                <input type="range" min="0" max="1000" v-model="priceRange" class="slider" @input="updatePriceFilter">
                <div class="price-range-values">
                  <span>Current: ${{ filters.maxPrice }}</span>
                </div>
                <div class="price-inputs">
                  <div>
                    <label>Min: ${{ filters.minPrice }}</label>
                  </div>
                  <div>
                    <label>Max: $1000</label>
                  </div>
                </div>
              </div>
            </div>
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
                  <span class="product-title-link">
                    <h3 class="product-title">{{ product.name }}</h3>
                  </span>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">
                    <span class="current-price">${{ product.price.toFixed(2) }}</span>
                    <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice.toFixed(2)
                      }}</span>
                  </div>

                  <!-- Quantity Selector and Add to Cart -->
                  <div class="quantity-cart-container">
                    <div class="quantity-selector">
                      <button @click="decrementQuantity(product.id)" class="quantity-btn" :disabled="productQuantities[product.id] === 1">-</button>
                      <span class="quantity-value">{{ product.stock === 0 ? 0 : productQuantities[product.id] }}</span>
                      <button @click="incrementQuantity(product.id)" class="quantity-btn" :disabled="productQuantities[product.id] >= product.stock || product.stock === 0">+</button>
                    </div>
                    <button @click="addToCart(product)" class="add-to-cart-btn" :disabled="product.stock === 0">  {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                    </button>
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
      </div>
    </main>

    <!-- Cart Notification Popup -->
    <div class="notification-popup" v-if="showNotification" :class="{ 'show': showNotification }">
      <div class="notification-content">
        <h3 class="notification-title">Item Added to Cart <button class="close-notification"
            @click="hideNotification">×</button></h3>
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
    console.log('MARKETPLACE - beforeCreate')
  },
  created() {
    console.log('MARKETPLACE - created')
    // Load cart from localStorage
    this.loadCartFromStorage()
    
    // Check for category filter from URL or localStorage
    this.checkForCategoryFilter()
  },
  beforeMount() {
    console.log('MARKETPLACE - beforeMount')
    this.fetchProducts()
  },
  mounted() {
    console.log('MARKETPLACE - mounted')
    
    // Initial cart count update
    this.updateCartItemCount();
    
    // Set up periodic refresh of cart count (every 30 seconds)
    this.cartCountInterval = setInterval(() => {
      this.updateCartItemCount();
    }, 30000);
  },
  beforeDestroy() {
    // Clean up interval when component is destroyed
    if (this.cartCountInterval) {
      clearInterval(this.cartCountInterval);
    }
  },
  data() {
    return {
      priceRange: 0,
      cart: [],
      cartItemCount: 0,
      currentPage: 1,
      itemsPerPage: 12,
      sortBy: 'default',
      filters: {
        categories: [],
        minPrice: 0,
        maxPrice: 0
      },
      allProducts: [],
      isLoading: false,
      error: null,
      productQuantities: {}, // Store quantities for each product
      showNotification: false,
      notificationMessage: '',
      cartCountInterval: null
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
    // Check for category filter from URL or localStorage
    checkForCategoryFilter() {
      // First check URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      
      // If category is in URL, use it
      if (categoryParam) {
        console.log('Category found in URL:', categoryParam);
        this.filters.categories = [categoryParam];
        return;
      }
      
      // If not in URL, check localStorage
      const storedCategory = localStorage.getItem('selectedCategory');
      if (storedCategory) {
        console.log('Category found in localStorage:', storedCategory);
        this.filters.categories = [storedCategory];
        
        // Update URL to reflect the filter (optional)
        this.updateUrlWithCategory(storedCategory);
        
        // Clear localStorage after using it to prevent it from persisting
        // across multiple page visits unless that's desired behavior
        localStorage.removeItem('selectedCategory');
      }
    },
    
    // Update URL with category parameter without page reload
    updateUrlWithCategory(category) {
      const url = new URL(window.location);
      url.searchParams.set('category', category);
      window.history.pushState({}, '', url);
    },
    
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

        // Extract the Products array
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
          tagClass: product.TagClass,
          stock: product.Stock
        }));

        // Initialize quantities for all products
        const quantities = {};
        this.allProducts.forEach(product => {
          quantities[product.id] = 1;
        });
        this.productQuantities = quantities;

        // Set initial price range values
        this.filters.minPrice = 0;
        this.filters.maxPrice = 1000;
        this.priceRange = 1000;

      } catch (err) {
        this.error = err.message
        console.error('Error fetching products:', err)
      } finally {
        this.isLoading = false
      }
    },

    // Load cart from localStorage
    loadCartFromStorage() {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          this.cart = JSON.parse(cartData);
          this.updateCartItemCount();
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    },

    // Save cart to localStorage
    saveCartToStorage() {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        // Trigger storage event for other components to detect
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    },

    // Update cart item count from server
    async updateCartItemCount() {
      try {
        // Fetch cart data from the server endpoint
        const response = await fetch(`http://localhost:5201/cart/200`);
        
        if (!response.ok) {
          // If response is 400 (BAD REQUEST), it means the cart doesn't exist
          // This happens after successful payment when the cart is cleared
          if (response.status === 400) {
            console.log('Cart not found (likely cleared after payment), setting count to 0');
            this.cartItemCount = 0;
            
            // Also clear localStorage cart to keep things in sync
            localStorage.removeItem('cart');
            this.cart = [];
            return;
          }
          
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const cartData = await response.json();
        
        if (cartData.error) {
          throw new Error(cartData.error);
        }
        
        // Calculate total quantity from all items in the cart
        let totalQuantity = 0;
        const cart = cartData.cart || {};
        
        // Sum up quantities from all items
        for (const productId in cart) {
          totalQuantity += cart[productId].quantity || 0;
        }
        
        this.cartItemCount = totalQuantity;
        console.log('Cart count updated from server:', this.cartItemCount);
        
      } catch (error) {
        console.error('Error fetching cart count from server:', error);
        
        // Check if the error is related to the cart being cleared after payment
        if (error.message.includes('400')) {
          console.log('Setting cart count to 0 due to 400 error (cart likely cleared)');
          this.cartItemCount = 0;
          
          // Also clear localStorage cart to keep things in sync
          localStorage.removeItem('cart');
          this.cart = [];
          return;
        }
        
        // Fallback to localStorage if server fetch fails for other reasons
        this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        console.log('Using localStorage fallback for cart count:', this.cartItemCount);
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

    updatePriceFilter() {
      // Update the max price based on slider value
      this.filters.maxPrice = parseInt(this.priceRange);
      // Auto-apply filters when slider changes
      this.currentPage = 1;
    },

    resetPagination() {
      this.currentPage = 1;
    },

    // Increment quantity for a specific product
    incrementQuantity(productId) {
      const product = this.allProducts.find(p => p.id === productId);
      if (!product) return;

      const currentQuantity = this.productQuantities[productId] || 1;
      // Don't increment if we've reached stock limit
      if (currentQuantity >= product.stock) return;

      // Create a new object to ensure reactivity
      const newQuantities = { ...this.productQuantities };
      newQuantities[productId] = currentQuantity + 1;
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
      this.notificationMessage = message;
      this.showNotification = true;
      // No auto-hide - notification stays until user closes it
    },

    // Hide notification
    hideNotification() {
      this.showNotification = false;
    },

    // Navigate to cart page
    navigateToCart() {
      // Hide the notification
      this.hideNotification();
      // Navigate to Cart.vue
      window.location.href = '/cart';
    },

    // Add to cart with quantity
    async addToCart(product) {
      const quantity = this.productQuantities[product.id] || 1;

      // Check if product is already in cart
      const existingProductIndex = this.cart.findIndex(item => item.id === product.id);

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists in cart
        const updatedCart = [...this.cart];
        updatedCart[existingProductIndex].quantity += quantity;
        this.cart = updatedCart;
      } else {
        // Add new product to cart
        const cartItem = {
          ...product,
          quantity: quantity
        };
        this.cart.push(cartItem);
      }

      // Save cart to localStorage
      this.saveCartToStorage();

      // Show notification popup
      const message = `${quantity} ${product.name}${quantity > 1 ? 's' : ''} ${quantity > 1 ? 'have' : 'has'} been added to your cart successfully!`;
      this.showCartNotification(message);

      console.log('Cart updated:', this.cart);

      // Connect to the specified backend endpoint
      await this.updateServerCart(product.id, quantity);
      
      // Update cart count from server after server update
      await this.updateCartItemCount();
    },
    
    async addToServerCart(product, quantity) {
      try {
        const userId = 200; // This can be dynamic depending on your user session

        // Create the request payload
        const requestBody = {
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image
          },
          quantity: quantity,
          user_id: userId
        };

        // Send a POST request to your backend
        const response = await fetch('http://127.0.0.1:8000/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Failed to add product to cart: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Product added to server cart:', responseData);
        return true;
      } catch (error) {
        console.error('Error adding product to server cart:', error);
        return false;
      }
    },


    // Update server-side cart
    async updateServerCart(productId, quantity) {
      try {
        // Connect to the specified backend endpoint
        const response = await fetch('http://localhost:5300/cart-product/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userID: 200, // Default userID as specified
            productId: productId,
            quantity: quantity
          })
        });

        if (!response.ok) {
          console.warn(`Failed to update server cart: ${response.status} ${response.statusText}`);
          return false;
        }

        const data = await response.json();
        console.log('Server cart updated successfully:', data);
        return true;
      } catch (error) {
        console.error('Error updating server cart:', error);
        return false;
      }
    }
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

/* Cart Link */
.cart-link-container {
  display: flex;
  justify-content: flex-end;
  margin: 20px 0;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cart-link:hover {
  background-color: #5a3412;
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
  position: relative;
  /* Ensures content stays above the blur overlay */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  /* Optional: adds slight shadow to make text more readable */
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

/* Filter Bar - Changed to white background */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #ffffff;
  /* Changed from #f9f1e7 to white */
  border-radius: 8px 8px 0 0;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  /* Added subtle shadow for consistency with sidebar */
}

.results-info {
  font-size: 14px;
  color: #666;
  background-color: #f9f1e7;
  /* Keep this beige for the results info box */
  padding: 8px 15px;
  border-radius: 4px;
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
  background-color: #f9f1e7;
  /* Changed from #fff to beige */
  color: #333;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  margin: 30px 0;
}

/* Sidebar - Changed to white background */
.sidebar {
  background-color: #ffffff;
  /* White background */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Update the filter sections to beige and remove gap between them */
.filter-section {
  margin-bottom: 0;
  /* Remove bottom margin to eliminate gap */
  background-color: #f9f1e7;
  /* Beige color */
  padding: 15px;
  border-radius: 6px;
}

/* Add margin only to the first filter section */
.filter-section:first-child {
  margin-bottom: 1px;
  /* Just a tiny gap to visually separate them */
}

/* Update text color in sidebar for better contrast */
.filter-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 600;
  color: #333;
  /* Darker text for better contrast on beige */
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
  color: #333;
  /* Darker text for better contrast on beige */
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
  margin-top: 10px;
  color: #333;
  /* Darker text for better contrast on beige */
}

.price-range-values {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  /* Darker text for better contrast on beige */
  margin-bottom: 5px;
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
  cursor: default;
}

.product-title-link:hover .product-title {
  color: inherit;
  text-decoration: none;
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
  z-index: 10;
  /* Ensure buttons are above product link */
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
  z-index: 10;
  /* Ensure button is above product link */
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