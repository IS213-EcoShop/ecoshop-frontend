<template>
  <div class="product-detail-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h2>Error Loading Product</h2>
      <p>{{ error }}</p>
      <button @click="fetchProductDetails" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Product Content -->
    <template v-else>
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb-container">
        <div class="container">
          <div class="breadcrumb">
            <router-link to="/marketplace" class="breadcrumb-link">Marketplace</router-link>
            <chevron-right-icon class="breadcrumb-icon" />
            <span class="breadcrumb-current">{{ product.name }}</span>
          </div>
        </div>
      </div>

      <!-- Product Detail Section -->
      <div class="container">
        <div class="product-detail">
          <!-- Product Images - Simplified to just show the main image -->
          <div class="product-images simplified">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" />
              <span v-if="product.tag" class="product-tag" :class="product.tagClass">
                {{ product.tag }}
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-price">${{ product.price.toFixed(2) }}</div>
            
            <!-- Rating -->
            <div class="product-rating">
              <div class="stars">
                <star-icon v-for="i in Math.floor(product.rating || 5)" :key="i" class="star filled" />
                <star-icon v-if="(product.rating || 5) % 1 >= 0.5" class="star half-filled" />
              </div>
              <span class="review-count">{{ product.reviewCount }} Customer Review(s)</span>
            </div>
            
            <!-- Description -->
            <p class="product-description">{{ product.description }}</p>
            
            <!-- Quantity and Add to Cart -->
            <div class="cart-actions">
              <div class="quantity-selector">
                <button @click="decrementQuantity" class="quantity-btn">-</button>
                <span class="quantity-value">{{ quantity }}</span>
                <button @click="incrementQuantity" class="quantity-btn">+</button>
              </div>
              <button @click="addToCart" class="add-to-cart-btn">Add To Cart</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Products Section -->
      <div v-if="!isFromRecommendation" class="recommended-products container">
        <h2 class="section-title">Recommended Products</h2>
        
        <div class="product-cards" ref="productCarousel">
          <div v-for="product in recommendedProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img :src="product.image" :alt="product.name">
              <span v-if="product.tag" class="product-tag" :class="product.tagClass">
                {{ product.tag }}
              </span>
            </div>
            <div class="product-card-info">
              <router-link 
                :to="{
                  path: `/product/${product.id}`,
                  query: { fromRecommendation: true }
                }" 
                class="product-card-link">
                <h3 class="product-card-title">{{ product.name }}</h3>
              </router-link>
              <p class="product-card-category">{{ product.category }}</p>
              <div class="product-card-price">
                <span class="current-price">${{ product.price.toFixed(2) }}</span>
                <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

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
import { 
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-vue-next'

export default {
  name: 'ProductDetail',
  components: {
    ChevronRightIcon,
    ChevronLeftIcon,
    StarIcon,
    CheckCircleIcon
  },
  props: {
    // Allow the id to be passed as a prop from the router
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      productId: null,
      product: {
        id: '',
        name: '',
        price: 0,
        description: '',
        reviewCount: 0,
        rating: 5,
        category: '',
        image: '',
        tag: '',
        tagClass: ''
      },
      selectedImageIndex: 0,
      quantity: 1,
      showNotification: false,
      notificationMessage: '',
      recommendedProducts: [],
      isLoading: true,
      error: null,
      productCache: {}, // Cache for product data
      recommendedCache: {} // Cache for recommended products
    };
  },
  computed: {
    isFromRecommendation() {
      return this.$route.query.fromRecommendation === 'true';
    }
  },
  watch: {
    // Watch for route changes to update the product when navigating between products
    '$route': {
      handler(newRoute) {
        const newId = newRoute.params.id;
        if (newId && newId !== this.productId) {
          console.log('Route changed, loading new product:', newId);
          this.productId = newId;
          this.resetProductView();
          this.fetchProductDetails();
        }
      },
      immediate: true
    }
  },
  methods: {
    resetProductView() {
      // Reset view state when changing products
      this.selectedImageIndex = 0;
      this.quantity = 1;
      window.scrollTo(0, 0);
    },
    incrementQuantity() {
      this.quantity++;
    },
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    addToCart() {
      try {
        // Create cart item
        const cartItem = {
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          quantity: this.quantity,
          image: this.product.image,
          description: this.product.description,
          tag: this.product.tag,
          tagClass: this.product.tagClass
        };
        
        // Check if we have a cart in localStorage
        let cart = [];
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          try {
            cart = JSON.parse(storedCart);
          } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            cart = [];
          }
        }
        
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex !== -1) {
          // Update quantity if product already exists
          cart[existingItemIndex].quantity += this.quantity;
        } else {
          // Add new item to cart
          cart.push(cartItem);
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
        
        // Show notification
        this.notificationMessage = `${this.quantity} ${this.product.name}${this.quantity > 1 ? 's' : ''} ${this.quantity > 1 ? 'have' : 'has'} been added to your cart successfully!`;
        this.showNotification = true;
        
        // Emit event for parent components
        this.$emit('cart-updated', cart);
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    },
    hideNotification() {
      this.showNotification = false;
    },
    navigateToCart() {
      // Hide the notification
      this.hideNotification();
      
      // Navigate to Cart.vue
      window.location.href = '/cart';
    },
    async fetchProductDetails() {
      // Don't show loading if we have cached data
      if (!this.productCache[this.productId]) {
        this.isLoading = true;
      }
      this.error = null;
      
      try {
        // Get product ID from props or route params
        this.productId = this.id || this.$route.params.id;
        
        console.log('Attempting to fetch product with ID:', this.productId);
        
        if (!this.productId) {
          throw new Error('Product ID is missing');
        }
        
        // First, try to get the product from localStorage (marketplace data)
        const marketplaceProducts = localStorage.getItem('marketplace-products');
        if (marketplaceProducts) {
          try {
            const products = JSON.parse(marketplaceProducts);
            const foundProduct = products.find(p => p.id.toString() === this.productId.toString());
            
            if (foundProduct) {
              console.log('Found product in localStorage:', foundProduct.name);
              this.product = { ...foundProduct };
              this.isLoading = false;
              
              // Still fetch recommended products
              await this.fetchRecommendedProducts();
              return;
            }
          } catch (e) {
            console.error('Error parsing marketplace products:', e);
          }
        }
        
        // Check if we have cached data for this product
        if (this.productCache[this.productId]) {
          console.log('Using cached product data for:', this.productId);
          this.product = { ...this.productCache[this.productId] };
          
          // Still fetch recommended products if needed
          if (!this.recommendedCache[this.productId]) {
            await this.fetchRecommendedProducts();
          } else {
            console.log('Using cached recommended products');
            this.recommendedProducts = [...this.recommendedCache[this.productId]];
          }
          
          this.isLoading = false;
          return;
        }
        
        // Try to fetch from API
        try {
          console.log('Making API request for product:', this.productId);
          const response = await fetch(`https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/product/${this.productId}`);
          
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API response data:', data);
          
          if (data && data.Product) {
            // Update product data from API response
            this.product = {
              id: data.Product.productId || this.productId,
              name: data.Product.Name || 'Product Name',
              price: data.Product.Price || 0,
              description: data.Product.Description || 'No description available',
              reviewCount: data.Product.ReviewCount || 0,
              rating: data.Product.Rating || 5,
              category: data.Product.Category || '',
              image: data.Product.ImageURL || '/placeholder.svg?height=400&width=500',
              tag: data.Product.TagText || '',
              tagClass: data.Product.TagClass || ''
            };
            
            console.log('Successfully loaded product data:', this.product.name);
            
            // Cache the product data
            this.productCache[this.productId] = { ...this.product };
          } else {
            // If API doesn't return expected data, try to find product in allProducts
            await this.fetchAllProducts();
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          // Try to find product in allProducts
          await this.fetchAllProducts();
        }
        
        // Fetch recommended products
        await this.fetchRecommendedProducts();
        
      } catch (error) {
        console.error('Error fetching product details:', error);
        this.error = error.message || 'Failed to load product details';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchAllProducts() {
      try {
        console.log('Fetching all products to find the requested product');
        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/allproducts/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data.Products)) {
          // Find the product with matching ID
          const foundProduct = data.Products.find(p => p.productId.toString() === this.productId.toString());
          
          if (foundProduct) {
            console.log('Found product in all products:', foundProduct.Name);
            
            this.product = {
              id: foundProduct.productId,
              name: foundProduct.Name,
              price: foundProduct.Price,
              description: foundProduct.Description || 'No description available',
              reviewCount: foundProduct.ReviewCount || 0,
              rating: foundProduct.Rating || 5,
              category: foundProduct.Category || '',
              image: foundProduct.ImageURL || '/placeholder.svg?height=400&width=500',
              tag: foundProduct.TagText || '',
              tagClass: foundProduct.TagClass || ''
            };
            
            // Cache the product data
            this.productCache[this.productId] = { ...this.product };
            
            // Save all products to localStorage for future use
            localStorage.setItem('marketplace-products', JSON.stringify(
              data.Products.map(p => ({
                id: p.productId,
                name: p.Name,
                price: p.Price,
                description: p.Description || '',
                image: p.ImageURL || '/placeholder.svg?height=400&width=500',
                category: p.Category || '',
                tag: p.TagText || '',
                tagClass: p.TagClass || '',
                reviewCount: p.ReviewCount || 0,
                rating: p.Rating || 5
              }))
            ));
            
            return;
          }
        }
        
        // If product not found, use demo data
        console.log('Product not found in API data, using demo data');
        this.setDemoProduct();
        
      } catch (error) {
        console.error('Error fetching all products:', error);
        this.setDemoProduct();
      }
    },
    async fetchRecommendedProducts() {
      try {
        // Check if we have cached recommendations
        if (this.recommendedCache[this.productId]) {
          this.recommendedProducts = this.recommendedCache[this.productId];
          return;
        }
        
        // Try to fetch recommended products from API
        const response = await fetch(`https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/recommendedproducts/${this.productId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && Array.isArray(data.Products)) {
            this.recommendedProducts = data.Products.map(p => ({
              id: p.productId,
              name: p.Name,
              category: p.Category,
              price: p.Price,
              originalPrice: p.OriginalPrice,
              image: p.ImageURL || '/placeholder.svg?height=200&width=300',
              tag: p.TagText,
              tagClass: p.TagClass
            }));
            
            // Cache the recommendations
            this.recommendedCache[this.productId] = [...this.recommendedProducts];
            return;
          }
        }
        
        // Fallback to demo data if API fails or returns unexpected format
        this.setDemoRecommendedProducts();
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        // Don't fail the whole page if recommended products fail to load
        this.setDemoRecommendedProducts();
      }
    },
    setDemoProduct() {
      console.log('Setting demo product data for ID:', this.productId);
      
      // Map of known product IDs to their demo data
      const productMap = {
        '1': {
          id: '1',
          name: 'Aloe Facial Toner',
          price: 26.38,
          description: 'Refresh and balance your skin with our natural Aloe Facial Toner. Made with organic aloe vera and cucumber extract, this alcohol-free formula gently removes impurities while maintaining your skin\'s natural pH balance.',
          reviewCount: 42,
          rating: 4.7,
          category: 'Skincare',
          image: '/placeholder.svg?height=400&width=500',
          tag: 'Cruelty Free',
          tagClass: 'cruelty-free'
        },
        '2': {
          id: '2',
          name: 'Bamboo Toothbrush',
          price: 8.99,
          description: 'Replace your plastic toothbrush with our biodegradable bamboo alternative. Features soft BPA-free bristles and a comfortable ergonomic handle made from sustainably harvested bamboo.',
          reviewCount: 28,
          rating: 4.3,
          category: 'Personal Care',
          image: '/placeholder.svg?height=400&width=500',
          tag: 'Plastic Free',
          tagClass: 'plastic-free'
        },
        '3': {
          id: '3',
          name: 'Organic Cotton Tote',
          price: 15.99,
          description: 'Our durable organic cotton tote is perfect for shopping, beach trips, or everyday use. Made from 100% GOTS certified organic cotton with reinforced stitching to handle heavy loads.',
          reviewCount: 56,
          rating: 4.8,
          category: 'Bags & Accessories',
          image: '/placeholder.svg?height=400&width=500',
          tag: 'Low Waste',
          tagClass: 'low-waste'
        },
        '4': {
          id: '4',
          name: 'Reusable Produce Bags',
          price: 12.50,
          description: 'Set of 5 mesh produce bags in various sizes, perfect for grocery shopping. Made from recycled polyester, these washable bags replace single-use plastic produce bags and let cashiers see contents easily.',
          reviewCount: 19,
          rating: 4.2,
          category: 'Kitchen & Dining',
          image: '/placeholder.svg?height=400&width=500'
        },
        '5': {
          id: '5',
          name: 'Stainless Steel Straw Set',
          price: 14.99,
          description: 'Our premium stainless steel straw set includes 4 straight straws, 4 bent straws, 2 cleaning brushes, and a cotton carrying pouch. Dishwasher safe and perfect for hot and cold beverages.',
          reviewCount: 37,
          rating: 4.6,
          category: 'Kitchen & Dining',
          image: '/placeholder.svg?height=400&width=500'
        },
        '6': {
          id: '6',
          name: 'Beeswax Food Wraps',
          price: 18.95,
          description: 'Replace plastic wrap with our reusable beeswax food wraps. Set includes 3 different sizes to cover various containers or wrap foods directly. Washable, biodegradable, and lasts up to a year with proper care.',
          reviewCount: 31,
          rating: 4.4,
          category: 'Kitchen & Dining',
          image: '/placeholder.svg?height=400&width=500'
        },
        '7': {
          id: '7',
          name: 'Recycled Paper Journal',
          price: 11.25,
          description: 'Our hardcover journal features 160 pages of 100% recycled, acid-free paper. Perfect for journaling, sketching, or note-taking with a lay-flat binding and an elastic closure band.',
          reviewCount: 24,
          rating: 4.1,
          category: 'Stationery',
          image: '/placeholder.svg?height=400&width=500'
        },
        '8': {
          id: '8',
          name: 'Organic Lip Balm Set',
          price: 9.99,
          description: 'Set of 4 organic lip balms in different natural flavors. Made with organic shea butter, coconut oil, and beeswax to keep your lips moisturized and protected from the elements.',
          reviewCount: 48,
          rating: 4.5,
          category: 'Personal Care',
          image: '/placeholder.svg?height=400&width=500'
        },
        '9': {
          id: '9',
          name: 'Bamboo Cutlery Set',
          price: 13.50,
          description: 'Portable bamboo cutlery set including fork, knife, spoon, chopsticks, and a straw with a cleaning brush. Comes in a convenient canvas carrying case with a carabiner clip.',
          reviewCount: 53,
          rating: 4.7,
          category: 'Kitchen & Dining',
          image: '/placeholder.svg?height=400&width=500'
        },
        '10': {
          id: '10',
          name: 'Natural Loofah Sponges',
          price: 7.95,
          description: 'Pack of 3 natural loofah sponges for exfoliating skin in the shower or cleaning around the house. Biodegradable, compostable, and grown without pesticides or chemicals.',
          reviewCount: 17,
          rating: 4.0,
          category: 'Personal Care',
          image: '/placeholder.svg?height=400&width=500'
        },
        '11': {
          id: '11',
          name: 'Wool Dryer Balls',
          price: 16.99,
          description: 'Set of 6 premium New Zealand wool dryer balls that naturally soften laundry and reduce drying time by up to 25%. A sustainable alternative to disposable dryer sheets, lasting for over 1,000 loads.',
          reviewCount: 22,
          rating: 4.3,
          category: 'Home & Laundry',
          image: '/placeholder.svg?height=400&width=500'
        },
        '12': {
          id: '12',
          name: 'Organic Cotton Napkins',
          price: 19.50,
          description: 'Set of 6 organic cotton napkins in natural color. These reusable napkins are soft, absorbent, and become softer with each wash. Perfect for everyday use or special occasions.',
          reviewCount: 39,
          rating: 4.6,
          category: 'Kitchen & Dining',
          image: '/placeholder.svg?height=400&width=500'
        }
      };
      
      // Check if we have demo data for this specific product ID
      if (productMap[this.productId]) {
        this.product = { ...productMap[this.productId] };
        console.log('Using specific demo data for product:', this.product.name);
      } else {
        // If no specific demo data, create a generic product with the ID
        const productNumber = isNaN(parseInt(this.productId)) ? Math.floor(Math.random() * 100) : parseInt(this.productId);
        
        this.product = {
          id: this.productId,
          name: `Sustainable Product ${productNumber}`,
          price: (19.99 + (productNumber * 2.5)) % 100,
          description: `This sustainable product is designed to reduce environmental impact while providing excellent functionality. Perfect for eco-conscious consumers looking to make a difference.`,
          reviewCount: Math.floor(Math.random() * 50) + 5,
          rating: (3.5 + (Math.random() * 1.5)).toFixed(1),
          category: 'Sustainable Living',
          image: '/placeholder.svg?height=400&width=500'
        };
        console.log('Using generic demo data for product:', this.product.name);
      }
      
      // Cache the demo product
      this.productCache[this.productId] = { ...this.product };
    },
    setDemoRecommendedProducts() {
      // Create different recommendations based on the current product category
      const recommendedProducts = [];
      
      // Get all demo products except the current one
      const demoProducts = [
        {
          id: '1',
          name: 'Aloe Facial Toner',
          category: 'Skincare',
          price: 26.38,
          image: '/placeholder.svg?height=200&width=300',
          tag: 'Cruelty Free',
          tagClass: 'cruelty-free'
        },
        {
          id: '2',
          name: 'Bamboo Toothbrush',
          category: 'Personal Care',
          price: 8.99,
          image: '/placeholder.svg?height=200&width=300',
          tag: 'Plastic Free',
          tagClass: 'plastic-free'
        },
        {
          id: '3',
          name: 'Organic Cotton Tote',
          category: 'Bags & Accessories',
          price: 15.99,
          image: '/placeholder.svg?height=200&width=300',
          tag: 'Low Waste',
          tagClass: 'low-waste'
        },
        {
          id: '4',
          name: 'Reusable Produce Bags',
          category: 'Kitchen & Dining',
          price: 12.50,
          image: '/placeholder.svg?height=200&width=300'
        },
        {
          id: '5',
          name: 'Stainless Steel Straw Set',
          category: 'Kitchen & Dining',
          price: 14.99,
          image: '/placeholder.svg?height=200&width=300'
        },
        {
          id: '6',
          name: 'Beeswax Food Wraps',
          category: 'Kitchen & Dining',
          price: 18.95,
          image: '/placeholder.svg?height=200&width=300'
        }
      ];
      
      // Filter out the current product
      const filteredProducts = demoProducts.filter(p => p.id !== this.productId);
      
      // Try to find products in the same category
      const sameCategory = filteredProducts.filter(p => 
        p.category === this.product.category
      );
      
      // Add same category products first
      recommendedProducts.push(...sameCategory);
      
      // Add other products until we have at least 4
      if (recommendedProducts.length < 4) {
        const otherProducts = filteredProducts.filter(p => 
          !recommendedProducts.some(rp => rp.id === p.id)
        );
        
        recommendedProducts.push(...otherProducts.slice(0, 4 - recommendedProducts.length));
      }
      
      this.recommendedProducts = recommendedProducts;
      
      // Cache the recommendations
      this.recommendedCache[this.productId] = [...this.recommendedProducts];
    }
  },
  created() {
    // Initial fetch will be handled by the watcher
  }
}
</script>

<style scoped>
/* Base Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #704116;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #704116;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Breadcrumb Styles */
.breadcrumb-container {
  background-color: #faf3ea;
  padding: 15px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #704116;
}

.breadcrumb-icon {
  width: 16px;
  height: 16px;
  margin: 0 8px;
}

.breadcrumb-current {
  color: #333;
}

/* Product Detail Layout */
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 40px 0;
}

/* Product Images - Simplified */
.product-images.simplified {
  display: flex;
  justify-content: center;
}

.main-image {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  height: 400px;
  background-color: #faf3ea;
  position: relative; /* Add this to position the tag */
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 32px;
  font-weight: 600;
  color: #242424;
  margin: 0;
}

.product-price {
  font-size: 24px;
  font-weight: 600;
  color: #704116;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
}

.star {
  width: 20px;
  height: 20px;
  color: #FFD700;
}

.star.filled {
  fill: #FFD700;
}

.star.half-filled {
  position: relative;
}

.star.half-filled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: #FFD700;
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>');
  mask-size: cover;
}

.review-count {
  font-size: 14px;
  color: #666;
}

.product-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* Cart Actions */
.cart-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

.quantity-btn:hover {
  background-color: #e0e0e0;
}

.quantity-value {
  width: 40px;
  text-align: center;
  font-size: 16px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 0 30px;
  background-color: #704116;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: #5a3412;
}

/* Recommended Products Section */
.recommended-products {
  margin: 60px auto;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
}

.product-cards {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  padding: 10px 0;
}

.product-cards::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.product-card {
  min-width: 280px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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

.product-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.product-tag.sale {
  background-color: #e97171;
}

.product-tag.new {
  background-color: #2ec1ac;
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

.product-card-info {
  padding: 15px;
}

.product-card-link {
  text-decoration: none;
  color: inherit;
}

.product-card-title {
  font-size: 16px;
  margin: 0 0 5px 0;
  font-weight: 600;
  transition: color 0.3s;
}

.product-card-link:hover .product-card-title {
  color: #704116;
}

.product-card-category {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.product-card-price {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* Responsive Styles */
@media (max-width: 992px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-image {
    height: 300px;
  }
}

@media (max-width: 576px) {
  .cart-actions {
    flex-direction: column;
  }
  
  .add-to-cart-btn {
    width: 100%;
    padding: 12px;
  }
}
</style>