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
        <div class="cart-container" v-if="cartItems.length > 0">
          <h2 class="cart-title">Your Cart ({{ cartItems.length }} items)</h2>
          
          <div class="cart-items">
            <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
              <div class="product-col">
                <div class="product-image">
                  <img :src="item.image" :alt="item.name">
                  <span v-if="item.tag" class="product-tag" :class="item.tagClass">
                    {{ item.tag }}
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

          <!-- Vouchers Section -->
          <div class="vouchers-section">
            <h3 class="vouchers-title">Available Vouchers</h3>
            
            <div v-if="displayedVouchers.length > 0" class="vouchers-list">
              <div v-for="voucher in displayedVouchers" :key="voucher.id" class="voucher-item">
                <div class="voucher-info">
                  <div class="voucher-amount">{{ voucher.amount }}</div>
                  <div class="voucher-details">
                    <h4 class="voucher-name">{{ voucher.title }}</h4>
                    <p class="voucher-expiry">Expires: {{ voucher.expiryDate }}</p>
                  </div>
                </div>
                <button 
                  @click="applyVoucher(voucher)" 
                  class="apply-voucher-btn"
                  :disabled="selectedVoucher && selectedVoucher.id === voucher.id"
                >
                  {{ selectedVoucher && selectedVoucher.id === voucher.id ? 'Applied' : 'Apply' }}
                </button>
              </div>
              
              <!-- View All Vouchers button -->
              <div v-if="availableVouchers.length > 2" class="view-all-vouchers">
                <button @click="toggleShowAllVouchers" class="view-all-btn">
                  {{ showAllVouchers ? 'Show Less' : 'View All Vouchers' }}
                </button>
              </div>
            </div>
            
            <div v-else-if="selectedVoucher" class="applied-voucher">
              <div class="voucher-info">
                <div class="voucher-amount">{{ selectedVoucher.amount }}</div>
                <div class="voucher-details">
                  <h4 class="voucher-name">{{ selectedVoucher.title }}</h4>
                  <p>Voucher applied to your cart</p>
                </div>
              </div>
              <button @click="removeVoucher" class="remove-voucher-btn">
                Remove
              </button>
            </div>
            
            <div v-else class="no-vouchers">
              <p>You don't have any vouchers. <a href="/rewards">Earn points</a> to redeem vouchers!</p>
            </div>
          </div>

          <div class="cart-footer">
            <div class="cart-summary">
              <div v-if="selectedVoucher" class="summary-row discount">
                <span>Discount ({{ selectedVoucher.amount }}):</span>
                <span>-${{ calculateDiscount().toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="cart-actions">
              <a href="/marketplace" class="continue-shopping-btn">
                <arrow-left-icon size="16" />
                Continue Shopping
              </a>
              <button @click="checkout" class="checkout-btn">
                <credit-card-icon size="16" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-cart">
          <shopping-cart-icon size="64" class="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <a href="/marketplace" class="browse-products-btn">Browse Products</a>
        </div>
      </div>
    </main>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Voucher Applied Toast -->
    <div v-if="showVoucherToast" class="voucher-toast" :class="{ 'show': showVoucherToast }">
      <div class="toast-content">
        <check-circle-icon class="toast-icon" />
        <span>{{ voucherToastMessage }}</span>
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
      isLoading: false,
      error: null,
      availableVouchers: [],
      selectedVoucher: null,
      showVoucherToast: false,
      voucherToastMessage: '',
      // Add a flag to control whether to show all vouchers or just 2
      showAllVouchers: false
    }
  },
  computed: {
    // Limit the number of vouchers displayed based on showAllVouchers flag
    displayedVouchers() {
      if (this.showAllVouchers || this.availableVouchers.length <= 2) {
        return this.availableVouchers;
      } else {
        return this.availableVouchers.slice(0, 2);
      }
    }
  },
  methods: {
    // Add this method to toggle showing all vouchers
    toggleShowAllVouchers() {
      this.showAllVouchers = !this.showAllVouchers;
    },
    
    async fetchCartItems() {
      this.isLoading = true;
      
      try {
        // First check localStorage for cart items from marketplace
        const localCart = this.getLocalCart();
        
        if (localCart && localCart.length > 0) {
          console.log('Found cart items in localStorage:', localCart);
          this.cartItems = localCart;
          this.isLoading = false;
          return;
        }
        
        // If no local cart, try to fetch from API
        console.log('No local cart found, fetching from API...');
        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/cart/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        
        const data = await response.json();
        
        // Map the response data to our cart items format
        this.cartItems = data.CartItems ? data.CartItems.map(item => ({
          id: item.ProductId,
          name: item.ProductName,
          description: item.Description || '',
          price: item.Price,
          image: item.ImageURL || '/placeholder.svg?height=120&width=120',
          quantity: item.Quantity,
          tag: item.Tag,
          tagClass: item.TagClass
        })) : [];
        
      } catch (error) {
        console.error('Error fetching cart:', error);
        this.error = error.message;
        // If the API fails, we'll just show an empty cart or use localStorage
        const localCart = this.getLocalCart();
        if (localCart && localCart.length > 0) {
          this.cartItems = localCart;
        } else {
          this.cartItems = [];
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    // Get cart items from localStorage
    getLocalCart() {
      try {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        return [];
      }
    },
    
    // Save cart items to localStorage
    saveLocalCart() {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    },
    
    async updateCartItem(productId, quantity) {
      this.isLoading = true;
      
      try {
        // First update local cart
        const index = this.cartItems.findIndex(item => item.id === productId);
        if (index !== -1) {
          this.cartItems[index].quantity = quantity;
          this.saveLocalCart();
        }
        
        // Then try to update on the server
        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ProductId: productId,
            Quantity: quantity
          })
        });
        
        if (!response.ok) {
          console.warn('API update failed, but local cart was updated');
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
      this.updateCartItem(item.id, item.quantity + 1);
    },
    
    decreaseQuantity(index) {
      const item = this.cartItems[index];
      if (item.quantity > 1) {
        this.updateCartItem(item.id, item.quantity - 1);
      }
    },
    
    async removeItem(index) {
      const item = this.cartItems[index];
      this.isLoading = true;
      
      try {
        // First remove from local cart
        this.cartItems.splice(index, 1);
        this.saveLocalCart();
        
        // Then try to remove on the server
        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ProductId: item.id
          })
        });
        
        if (!response.ok) {
          console.warn('API removal failed, but item was removed from local cart');
        }
        
      } catch (error) {
        console.error('Error removing item:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    calculateSubtotal() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    calculateDiscount() {
      if (!this.selectedVoucher) return 0;
      
      // Extract the numeric value from the voucher amount (e.g., "$5" -> 5)
      const discountValue = this.selectedVoucher.value || parseInt(this.selectedVoucher.amount.replace('$', '')) || 0;
      
      // Make sure discount doesn't exceed subtotal
      return Math.min(discountValue, this.calculateSubtotal());
    },
    
    calculateTotal() {
      const subtotal = this.calculateSubtotal();
      const discount = this.calculateDiscount();
      return Math.max(0, subtotal - discount);
    },
    
    loadVouchers() {
      try {
        // Clear localStorage vouchers when starting the app
        if (window.sessionStorage.getItem('appJustStarted') !== 'true') {
          localStorage.removeItem('userVouchers');
          window.sessionStorage.setItem('appJustStarted', 'true');
        }
        
        // Load vouchers from localStorage
        const storedVouchers = JSON.parse(localStorage.getItem('userVouchers') || '[]');
        
        // Filter out vouchers that are already used/active
        this.availableVouchers = storedVouchers.filter(v => !v.isActive);
        
        // Check if there's an active voucher
        const activeVoucher = storedVouchers.find(v => v.isActive);
        if (activeVoucher) {
          this.selectedVoucher = activeVoucher;
        }
      } catch (error) {
        console.error('Error loading vouchers from localStorage:', error);
      }
    },
    
    applyVoucher(voucher) {
      // Update the selected voucher
      this.selectedVoucher = voucher;
      
      // Update voucher status in localStorage
      try {
        const storedVouchers = JSON.parse(localStorage.getItem('userVouchers') || '[]');
        
        // Reset all vouchers to inactive
        storedVouchers.forEach(v => v.isActive = false);
        
        // Set the selected voucher to active
        const voucherIndex = storedVouchers.findIndex(v => v.id === voucher.id);
        if (voucherIndex !== -1) {
          storedVouchers[voucherIndex].isActive = true;
        }
        
        // Save back to localStorage
        localStorage.setItem('userVouchers', JSON.stringify(storedVouchers));
        
        // Show toast notification
        this.voucherToastMessage = `${voucher.amount} discount applied!`;
        this.showVoucherToast = true;
        setTimeout(() => {
          this.showVoucherToast = false;
        }, 3000);
      } catch (error) {
        console.error('Error updating voucher in localStorage:', error);
      }
    },
    
    removeVoucher() {
      if (!this.selectedVoucher) return;
      
      try {
        const storedVouchers = JSON.parse(localStorage.getItem('userVouchers') || '[]');
        
        // Find the voucher and mark it as inactive
        const voucherIndex = storedVouchers.findIndex(v => v.id === this.selectedVoucher.id);
        if (voucherIndex !== -1) {
          storedVouchers[voucherIndex].isActive = false;
          
          // Save back to localStorage
          localStorage.setItem('userVouchers', JSON.stringify(storedVouchers));
        }
        
        // Reset selected voucher
        this.selectedVoucher = null;
        
        // Reload available vouchers
        this.loadVouchers();
        
      } catch (error) {
        console.error('Error removing voucher:', error);
      }
    },
    
    async checkout() {
      this.isLoading = true;
      
      try {
        // Prepare checkout data including voucher if applied
        const checkoutData = {
          cartItems: this.cartItems.map(item => ({
            ProductId: item.id,
            Quantity: item.quantity
          }))
        };
        
        // Add voucher information if one is selected
        if (this.selectedVoucher) {
          checkoutData.voucher = {
            code: this.selectedVoucher.code,
            amount: this.calculateDiscount()
          };
        }
        
        // Call the checkout endpoint to create a Stripe session
        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/checkout/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkoutData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }
        
        const data = await response.json();
        
        // If checkout is successful, mark the voucher as used and clear the cart
        if (this.selectedVoucher) {
          this.markVoucherAsUsed(this.selectedVoucher.id);
        }
        
        // Clear the cart in localStorage
        localStorage.removeItem('cart');
        
        // Redirect to Stripe checkout page
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
        
      } catch (error) {
        console.error('Error during checkout:', error);
        this.error = error.message;
        alert('There was an error processing your checkout. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    
    markVoucherAsUsed(voucherId) {
      try {
        // Get vouchers from localStorage
        const storedVouchers = JSON.parse(localStorage.getItem('userVouchers') || '[]');
        
        // Remove the used voucher
        const updatedVouchers = storedVouchers.filter(v => v.id !== voucherId);
        
        // Save back to localStorage
        localStorage.setItem('userVouchers', JSON.stringify(updatedVouchers));
      } catch (error) {
        console.error('Error marking voucher as used:', error);
      }
    },
    
    // Listen for cart updates from marketplace
    setupCartListener() {
      window.addEventListener('storage', (event) => {
        if (event.key === 'cart') {
          console.log('Cart updated in another tab, refreshing...');
          this.fetchCartItems();
        }
      });
    }
  },
  mounted() {
    // Fetch cart items when the component is mounted
    this.fetchCartItems();
    
    // Load available vouchers
    this.loadVouchers();
    
    // Setup listener for cart updates from other tabs/components
    this.setupCartListener();
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
  position: relative; /* Ensures content stays above the blur overlay */
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

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.product-tag.cruelty-free {
  background-color: #e97171;
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

/* Vouchers Section */
.vouchers-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8ead7;
  border-radius: 8px;
}

.vouchers-title {
  font-size: 18px;
  font-weight: 600;
  color: #704116;
  margin-bottom: 15px;
}

.vouchers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.voucher-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.voucher-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.voucher-amount {
  font-size: 24px;
  font-weight: 700;
  color: #704116;
  background-color: #f0e6d2;
  padding: 10px;
  border-radius: 6px;
  min-width: 60px;
  text-align: center;
}

.voucher-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.voucher-expiry {
  font-size: 12px;
  color: #777;
}

.apply-voucher-btn {
  padding: 8px 16px;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.apply-voucher-btn:hover:not(:disabled) {
  background-color: #5a3412;
}

.apply-voucher-btn:disabled {
  background-color: #a67d5a;
  cursor: not-allowed;
}

.no-vouchers {
  padding: 15px;
  text-align: center;
  background-color: white;
  border-radius: 6px;
}

.no-vouchers a {
  color: #704116;
  text-decoration: underline;
}

/* View All Vouchers button */
.view-all-vouchers {
  margin-top: 10px;
  text-align: center;
}

.view-all-btn {
  padding: 8px 16px;
  background-color: #f8ead7;
  color: #704116;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  border: 1px solid #704116;
  width: 100%;
}

.view-all-btn:hover {
  background-color: #f0e6d2;
}

.applied-voucher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.remove-voucher-btn {
  padding: 8px 16px;
  background-color: #e97171;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.remove-voucher-btn:hover {
  background-color: #d85c5c;
}

/* Cart Summary and Footer */
.cart-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cart-summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row.discount {
  color: #e97171;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 12px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  padding-top: 12px;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Empty Cart */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
  text-align: center;
}

.empty-cart-icon {
  color: #704116;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #704116;
}

.empty-cart p {
  color: #666;
  margin-bottom: 20px;
}

.browse-products-btn {
  padding: 12px 24px;
  background-color: #704116;
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-products-btn:hover {
  background-color: #5a3412;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #704116;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Voucher Toast */
.voucher-toast {
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

.voucher-toast.show {
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
  
  .features-section {
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
  
  .features-section {
    grid-template-columns: 1fr;
  }
  
  .voucher-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .apply-voucher-btn {
    width: 100%;
    margin-top: 10px;
  }
}
</style> 