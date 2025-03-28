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
  
            <div class="cart-footer">
              <div class="cart-total">
                <span class="total-label">Total:</span>
                <span class="total-amount">${{ calculateTotal().toFixed(2) }}</span>
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
  
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
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
        error: null
      }
    },
    methods: {
      async fetchCartItems() {
        this.isLoading = true;
        try {
          // Connect to the cart endpoint
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
          // If the API fails, we'll just show an empty cart
          this.cartItems = [];
        } finally {
          this.isLoading = false;
        }
      },
      
      async updateCartItem(productId, quantity) {
        this.isLoading = true;
        try {
          // Call the update cart endpoint
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
            throw new Error('Failed to update cart');
          }
          
          // Refresh cart items after update
          await this.fetchCartItems();
          
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
          // Call the remove item endpoint
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
            throw new Error('Failed to remove item from cart');
          }
          
          // Refresh cart items after removal
          await this.fetchCartItems();
          
        } catch (error) {
          console.error('Error removing item:', error);
          this.error = error.message;
        } finally {
          this.isLoading = false;
        }
      },
      
      calculateTotal() {
        return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      async checkout() {
        this.isLoading = true;
        
        try {
          // Call the checkout endpoint to create a Stripe session
          const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/checkout/create-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              cartItems: this.cartItems.map(item => ({
                ProductId: item.id,
                Quantity: item.quantity
              }))
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create checkout session');
          }
          
          const data = await response.json();
          
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
      }
    },
    mounted() {
      // Fetch cart items when the component is mounted
      this.fetchCartItems();
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
    CreditCard as CreditCardIcon
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
  
  .cart-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .cart-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }
  
  .total-label {
    font-size: 18px;
    font-weight: 600;
  }
  
  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: #704116;
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
    
    .footer-content {
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
    
    .footer-content {
      grid-template-columns: 1fr;
    }
  }
  </style>