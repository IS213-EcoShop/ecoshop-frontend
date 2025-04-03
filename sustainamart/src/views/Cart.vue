<template>
  <div class="cart-page">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-blur-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Shopping Cart</h1>
        <div class="breadcrumb">
          <span class="breadcrumb-current">Ready to check out?</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <div class="cart-container">
          <h1 class="cart-title">Shopping Cart</h1>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
          
          <!-- Error state -->
          <div v-else-if="error" class="error-message">
            <div v-html="error"></div>
            <button v-if="!paymentLinkAvailable" @click="fetchCartItems" class="retry-button">Try Again</button>
          </div>
          
          <!-- Empty cart state -->
          <div v-else-if="cartItems.length === 0" class="empty-cart">
            <shopping-cart-icon size="64" class="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <a href="/marketplace" class="browse-products-btn">Browse Products</a>
          </div>
          
          <!-- Cart items -->
          <div v-else class="cart-items-container">
            <p class="cart-count">{{ cartItems.length }} item(s) in your cart</p>
            
            <div class="cart-items">
              <div v-for="(item, index) in cartItems" :key="item.productId" class="cart-item">
                <div class="product-col">
                  <div class="product-image">
                    <img :src="item.imageUrl || '/placeholder.svg?height=120&width=120'" :alt="item.name">
                    <span v-if="item.tagClass" class="product-tag" :class="item.tagClass">
                      {{ item.category }}
                    </span>
                  </div>
                  <div class="product-details">
                    <h3 class="product-title">{{ item.name }}</h3>
                    <p class="product-description">{{ item.description }}</p>
                    <div class="product-price">${{ item.price.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="item-actions">
                  <div class="quantity-control">
                    <button @click="decreaseQuantity(index)" class="quantity-btn">
                      <minus-icon size="16" />
                    </button>
                    <span class="quantity-value">{{ item.quantity }}</span>
                    <button @click="increaseQuantity(index)" class="quantity-btn">
                      <plus-icon size="16" />
                    </button>
                  </div>
                  <button @click="removeItem(index)" class="remove-btn">
                    <trash-icon size="16" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="subtotal">
                <span>Subtotal:</span>
                <span>${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
            </div>

            <!-- Recommendations Section -->
            <div v-if="recommendations.length > 0" class="recommendations-section">
              <h3 class="recommendations-title">Recommended for You</h3>
              <div class="recommendations-list">
                <div v-for="product in recommendations" :key="product.productId" class="recommendation-item">
                  <div class="recommendation-image">
                    <img :src="product.imageUrl || '/placeholder.svg?height=120&width=120'" :alt="product.name">
                    <span v-if="product.tagClass" class="product-tag" :class="product.tagClass">
                      {{ product.category }}
                    </span>
                  </div>
                  <div class="recommendation-details">
                    <h4 class="recommendation-title">{{ product.name }}</h4>
                    <p class="recommendation-description">{{ product.description }}</p>
                    <p class="recommendation-price">${{ product.price.toFixed(2) }}</p>
                    <button @click="addToCart(product)" class="add-to-cart-btn">
                      <plus-icon size="16" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Loading recommendations -->
            <div v-else-if="loadingRecommendations" class="loading-recommendations">
              <div class="loading-spinner"></div>
              <p>Loading recommendations...</p>
            </div>

            <div class="cart-actions">
              <a href="/marketplace" class="continue-shopping-btn">
                <arrow-left-icon size="16" />
                Continue Shopping
              </a>
              <button @click="checkout" class="checkout-btn" :disabled="isProcessingPayment">
                <credit-card-icon size="16" />
                {{ isProcessingPayment ? 'Processing...' : 'Proceed to Checkout' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Loading Overlay -->
    <div v-if="isLoading || isProcessingPayment" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p v-if="isProcessingPayment" class="payment-status-message">{{ paymentStatusMessage }}</p>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast" :class="{ 'show': showToast }">
      <div class="toast-content">
        <check-circle-icon class="toast-icon" />
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartPage',
  data() {
    return {
      cartItems: [],
      recommendations: [],
      isLoading: false,
      loadingRecommendations: false,
      error: null,
      showToast: false,
      toastMessage: '',
      userId: 200, // Using the userId from your example query
      isProcessingPayment: false,
      paymentStatusMessage: 'Preparing your payment...',
      stripePaymentUrl: null,
      paymentLinkAvailable: false,
      paymentCheckInterval: null,
      orderId: null
    }
  },
  methods: {
    async fetchCartItems() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // GraphQL query to fetch cart items with correct field names
        const query = `
          query GetCart($userId: Int!) {
            cart(userId: $userId) {
              productId
              name
              category
              condition
              description
              imageUrl
              price
              sustainabilityPoints
              tagClass
              quantity
            }
          }
        `;
        
        // Use a relative URL that will be proxied by Vite
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { userId: this.userId }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        this.cartItems = result.data.cart || [];
        console.log('Cart items fetched:', this.cartItems);
        
      } catch (error) {
        console.error('Error fetching cart:', error);
        this.error = `Failed to load cart items: ${error.message}`;
        this.cartItems = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchRecommendations() {
      this.loadingRecommendations = true;
      
      try {
        // GraphQL query to fetch recommendations with correct field names
        const query = `
          query GetRecommendations($userId: Int!) {
            recommendations(userId: $userId) {
              productId
              name
              category
              condition
              description
              imageUrl
              price
              sustainabilityPoints
              tagClass
            }
          }
        `;
        
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { userId: this.userId }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        this.recommendations = result.data.recommendations || [];
        console.log('Recommendations fetched:', this.recommendations);
        
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        this.recommendations = [];
      } finally {
        this.loadingRecommendations = false;
      }
    },
    
    async updateCartItem(productId, quantity) {
      this.isLoading = true;
      
      try {
        // For now, we'll just update the local state
        const index = this.cartItems.findIndex(item => item.productId === productId);
        if (index !== -1) {
          this.cartItems[index].quantity = quantity;
          
          // Here you would add the GraphQL mutation to update the cart on the server
          // const mutation = `
          //   mutation UpdateCartItem($userId: Int!, $productId: Int!, $quantity: Int!) {
          //     updateCartItem(userId: $userId, productId: $productId, quantity: $quantity) {
          //       success
          //     }
          //   }
          // `;
        }
        
      } catch (error) {
        console.error('Error updating cart:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    increaseQuantity(index) {
      const item = this.cartItems[index];
      this.updateCartItem(item.productId, item.quantity + 1);
    },
    
    decreaseQuantity(index) {
      const item = this.cartItems[index];
      if (item.quantity > 1) {
        this.updateCartItem(item.productId, item.quantity - 1);
      }
    },
    
    async removeItem(index) {
      const item = this.cartItems[index];
      this.isLoading = true;
      
      try {
        // Remove from local state
        this.cartItems.splice(index, 1);
        
        // Here you would add the GraphQL mutation to remove the item from the cart on the server
        // const mutation = `
        //   mutation RemoveCartItem($userId: Int!, $productId: Int!) {
        //     removeCartItem(userId: $userId, productId: $productId) {
        //       success
        //     }
        //   }
        // `;
        
      } catch (error) {
        console.error('Error removing item:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addToCart(product) {
      this.isLoading = true;
      
      try {
        // Add to local state first
        const existingItemIndex = this.cartItems.findIndex(item => item.productId === product.productId);
        
        if (existingItemIndex !== -1) {
          // If item already exists in cart, increase quantity
          this.cartItems[existingItemIndex].quantity += 1;
        } else {
          // Otherwise add new item to cart
          this.cartItems.push({
            ...product,
            quantity: 1
          });
        }
        
        // Here you would add the GraphQL mutation to add the item to the cart on the server
        // const mutation = `
        //   mutation AddToCart($userId: Int!, $productId: Int!, $quantity: Int!) {
        //     addToCart(userId: $userId, productId: $productId, quantity: $quantity) {
        //       success
        //     }
        //   }
        // `;
        
        // Show toast notification
        this.toastMessage = `${product.name} added to cart!`;
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
        
      } catch (error) {
        console.error('Error adding item to cart:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    calculateSubtotal() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    async checkout() {
      if (this.isProcessingPayment) return;
      
      this.isProcessingPayment = true;
      this.paymentStatusMessage = 'Preparing your payment...';
      this.error = null;
      
      try {
        console.log("🔄 Initiating checkout...");
        
        // Place order via microservice
        const placeOrderResponse = await fetch('http://127.0.0.1:5301/place_order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID: this.userId })
        });

        if (!placeOrderResponse.ok) {
          throw new Error('Order placement failed');
        }

        // Parse the response to get the Stripe payment URL
        const orderData = await placeOrderResponse.json();
        console.log("✅ Order response received:", orderData);
        
        if (orderData.code === 201 && orderData.stripe_payment_url) {
          // Store the Stripe payment URL
          this.stripePaymentUrl = orderData.stripe_payment_url;
          
          // Store order ID if available for checking payment status later
          if (orderData.order_details && orderData.order_details.id) {
            this.orderId = orderData.order_details.id;
          }
          
          // Update status message
          this.paymentStatusMessage = 'Redirecting to payment page...';
          
          // Open the Stripe payment URL in a new window
          const paymentWindow = window.open(this.stripePaymentUrl, '_blank');
          
          if (!paymentWindow) {
            // If popup is blocked, provide a link for the user to click
            this.paymentLinkAvailable = true;
            this.paymentStatusMessage = 'Payment window was blocked.';
            this.error = `
              <div class="payment-link-container">
                <p>Payment popup was blocked by your browser.</p>
                <a href="${this.stripePaymentUrl}" target="_blank" class="payment-link">
                  Click here to proceed to payment
                </a>
              </div>
            `;
            this.isProcessingPayment = false;
            return;
          }
          
          // Start checking payment status
          this.startPaymentStatusCheck();
          
        } else {
          throw new Error('Invalid response from server: Missing payment URL');
        }
        
      } catch (error) {
        console.error('Error during checkout:', error);
        this.error = `Checkout error: ${error.message}`;
        this.isProcessingPayment = false;
      }
    },
    
    startPaymentStatusCheck() {
      // Clear any existing interval
      if (this.paymentCheckInterval) {
        clearInterval(this.paymentCheckInterval);
      }
      
      this.paymentStatusMessage = 'Waiting for payment confirmation...';
      
      // Check payment status every 3 seconds
      this.paymentCheckInterval = setInterval(async () => {
        try {
          if (!this.orderId) {
            console.warn('No order ID available for payment status check');
            return;
          }
          
          const statusResponse = await fetch(`http://127.0.0.1:5301/check_payment_status/${this.orderId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!statusResponse.ok) {
            throw new Error('Failed to check payment status');
          }
          
          const statusData = await statusResponse.json();
          console.log('Payment status check:', statusData);
          
          if (statusData.status === 'completed' || statusData.status === 'succeeded') {
            // Payment successful
            this.handlePaymentSuccess();
          } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
            // Payment failed
            this.handlePaymentFailure(statusData.message || 'Payment was not completed');
          }
          // For 'pending' status, continue checking
          
        } catch (error) {
          console.error('Error checking payment status:', error);
          // Don't stop checking on error, just log it
        }
      }, 3000);
      
      // Set a timeout to stop checking after 10 minutes (600000 ms)
      setTimeout(() => {
        this.stopPaymentStatusCheck();
        if (this.isProcessingPayment) {
          this.handlePaymentFailure('Payment confirmation timed out. Please check your order status in your account.');
        }
      }, 600000);
    },
    
    stopPaymentStatusCheck() {
      if (this.paymentCheckInterval) {
        clearInterval(this.paymentCheckInterval);
        this.paymentCheckInterval = null;
      }
    },
    
    handlePaymentSuccess() {
      this.stopPaymentStatusCheck();
      this.isProcessingPayment = false;
      
      // Clear the cart
      this.cartItems = [];
      
      // Show success message
      this.toastMessage = "Payment successful! Your order has been placed.";
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
      
      // Redirect to order confirmation page if needed
      // window.location.href = '/order-confirmation';
    },
    
    handlePaymentFailure(message) {
      this.stopPaymentStatusCheck();
      this.isProcessingPayment = false;
      
      // Show error message
      this.error = `Payment failed: ${message}`;
      
      // Show toast notification
      this.toastMessage = "Payment was not completed. Please try again.";
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  },
  mounted() {
    // Fetch cart items and recommendations when the component is mounted
    this.fetchCartItems();
    this.fetchRecommendations();
  },
  beforeUnmount() {
    // Clean up interval when component is destroyed
    this.stopPaymentStatusCheck();
  }
}
</script>

<script setup>
import { 
  ShoppingCart as ShoppingCartIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Trash as TrashIcon,
  ArrowLeft as ArrowLeftIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon
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
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.breadcrumb {
  display: flex;
  align-items: center;
  color: #704116;
  border-radius: 1rem;
}

.breadcrumb-current {
  font-size: 0.875rem;
}

/* Main Content */
.main-content {
  padding: 40px 0;
}

/* Cart Container */
.cart-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
  padding: 20px;
}

.cart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #704116;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

/* Loading state */
.loading, .loading-recommendations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #704116;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-message {
  text-align: center;
  padding: 40px 0;
  color: #e53935;
}

.retry-button {
  background-color: #704116;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover {
  background-color: #5a3412;
}

/* Empty cart */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.empty-cart-icon {
  color: #704116;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-cart h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.empty-cart p {
  color: #666;
  margin-bottom: 24px;
}

.browse-products-btn {
  background-color: #704116;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-products-btn:hover {
  background-color: #5a3412;
}

/* Cart items */
.cart-count {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.product-col {
  display: flex;
  gap: 15px;
  flex: 1;
}

.product-image {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tag {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 3px 6px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
}

.product-tag.plastic-free {
  background-color: #62acb1;
}

.product-tag.low-waste {
  background-color: #2ec1ac;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.product-price {
  font-weight: 600;
  color: #704116;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #e0e0e0;
}

.quantity-value {
  width: 30px;
  text-align: center;
  font-weight: 500;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e97171;
  font-size: 14px;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 0.8;
}

/* Cart summary */
.cart-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
}

/* Recommendations Section */
.recommendations-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8ead7;
  border-radius: 8px;
}

.recommendations-title {
  font-size: 18px;
  font-weight: 600;
  color: #704116;
  margin-bottom: 15px;
}

.recommendations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.recommendation-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.recommendation-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-details {
  padding: 16px;
}

.recommendation-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.recommendation-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-price {
  font-weight: 600;
  color: #704116;
  margin-bottom: 12px;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background-color: #5a3412;
}

/* Cart Actions */
.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.continue-shopping-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid #704116;
  border-radius: 4px;
  color: #704116;
  font-weight: 500;
  transition: background-color 0.2s;
}

.continue-shopping-btn:hover {
  background-color: #f8ead7;
}

.checkout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #704116;
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #5a3412;
}

.checkout-btn:disabled {
  background-color: #a67c52;
  cursor: not-allowed;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-status-message {
  margin-top: 20px;
  font-size: 18px;
  color: #704116;
  text-align: center;
  max-width: 80%;
}

/* Payment Link */
.payment-link-container {
  margin-top: 20px;
  text-align: center;
}

.payment-link {
  display: inline-block;
  margin-top: 15px;
  padding: 12px 24px;
  background-color: #704116;
  color: white !important;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.payment-link:hover {
  background-color: #5a3412;
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #2e7d32;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 100;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  color: white;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .item-actions {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .cart-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .continue-shopping-btn, .checkout-btn {
    width: 100%;
    justify-content: center;
  }
  
  .recommendations-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-col {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 150px;
  }
  
  .recommendations-list {
    grid-template-columns: 1fr;
  }
}
</style>