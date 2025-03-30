<template>
    <div class="product-detail">
      <!-- Header -->
      <header class="header">
        <div class="container header-container">
          <div class="logo">SustainaMart</div>
          <nav class="main-nav">
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#" class="active">Marketplace</a></li>
              <li><a href="#">Trade-in Service</a></li>
              <li><a href="#">Sustainability Challenges & Rewards</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </nav>
          <div class="header-icons">
            <a href="#" class="icon-link"><span class="icon user-icon"></span></a>
            <a href="#" class="icon-link"><span class="icon search-icon"></span></a>
            <a href="#" class="icon-link"><span class="icon wishlist-icon"></span></a>
            <a href="#" class="icon-link cart-icon-wrapper">
              <span class="icon cart-icon"></span>
              <span v-if="cart.length > 0" class="cart-count">{{ cart.length }}</span>
              <!-- Mini Cart Dropdown -->
              <div v-if="showMiniCart && cart.length > 0" class="mini-cart">
                <h4>Your Cart ({{ cart.length }} items)</h4>
                <div class="mini-cart-items">
                  <div v-for="(item, index) in cart" :key="index" class="mini-cart-item">
                    <img :src="item.image" :alt="item.name" class="mini-cart-image">
                    <div class="mini-cart-details">
                      <p class="mini-cart-name">{{ item.name }}</p>
                      <p class="mini-cart-price">${{ item.price.toFixed(2) }} x {{ item.quantity }}</p>
                    </div>
                  </div>
                </div>
                <div class="mini-cart-footer">
                  <button class="view-cart-btn">View Cart</button>
                </div>
              </div>
            </a>
          </div>
        </div>
      </header>
  
      <!-- Breadcrumb -->
      <div class="breadcrumb-container">
        <div class="container">
          <div class="breadcrumb">
            <a href="#">Marketplace</a> &gt; <a href="#">Product</a> &gt; <span>{{ product.name }}</span>
          </div>
        </div>
      </div>
  
      <!-- Product Section -->
      <section class="product-section">
        <div class="container">
          <div class="product-layout">
            <!-- Product Gallery -->
            <div class="product-gallery">
              <div class="gallery-thumbnails">
                <div 
                  v-for="(image, index) in productImages" 
                  :key="index" 
                  class="thumbnail" 
                  :class="{ active: selectedImage === index }"
                  @click="selectedImage = index"
                >
                  <img :src="image" :alt="`${product.name} - View ${index + 1}`">
                </div>
              </div>
              <div class="gallery-main">
                <img :src="productImages[selectedImage]" :alt="product.name">
              </div>
            </div>
  
            <!-- Product Info -->
            <div class="product-info">
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="product-price">${{ product.price.toFixed(2) }}</div>
              
              <div class="product-rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= product.rating }">★</span>
                </div>
                <span class="review-count">{{ product.reviewCount }} Customer Review(s)</span>
              </div>
              
              <p class="product-description">{{ product.description }}</p>
              
              <!-- Product Options -->
              <div class="product-options">
                <div class="option-group">
                  <h3>Size</h3>
                  <div class="option-buttons">
                    <button 
                      v-for="size in product.sizes" 
                      :key="size" 
                      class="option-button" 
                      :class="{ active: selectedSize === size }"
                      @click="selectedSize = size"
                    >
                      {{ size }}
                    </button>
                  </div>
                </div>
                
                <div class="option-group">
                  <h3>Color</h3>
                  <div class="color-options">
                    <button 
                      v-for="color in product.colors" 
                      :key="color.name" 
                      class="color-button" 
                      :class="{ active: selectedColor === color.name }"
                      :style="{ backgroundColor: color.hex }"
                      @click="selectedColor = color.name"
                    ></button>
                  </div>
                </div>
              </div>
              
              <!-- Add to Cart -->
              <div class="add-to-cart">
                <div class="quantity-selector">
                  <button @click="decreaseQuantity" class="quantity-btn">-</button>
                  <span class="quantity">{{ quantity }}</span>
                  <button @click="increaseQuantity" class="quantity-btn">+</button>
                </div>
                <button class="add-to-cart-btn" @click="addToCart(product)">Add To Cart</button>
              </div>
              
              <!-- Added to Cart Notification -->
              <div v-if="showAddedNotification" class="added-notification">
                <span class="check-icon">✓</span> Product added to cart!
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Recommended Products -->
      <section class="recommended-section">
        <div class="container">
          <h2 class="section-title">Recommended Products</h2>
          <div class="recommended-products">
            <div 
              v-for="product in recommendedProducts" 
              :key="product.id" 
              class="product-card"
            >
              <!-- Product Badges -->
              <div class="product-badges">
                <div class="product-badge discount-badge" v-if="product.badge">{{ product.badge }}</div>
                <div 
                  v-if="product.sustainabilityTag" 
                  class="product-badge sustainability-badge"
                  :class="getSustainabilityClass(product.sustainabilityTag)"
                >
                  {{ product.sustainabilityTag }}
                </div>
              </div>
              
              <div class="product-image">
                <img :src="product.image" :alt="product.name">
              </div>
              <div class="product-details">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-category">{{ product.category }}</p>
                <div class="product-price">
                  <span class="current-price">${{ product.price.toFixed(2) }}</span>
                  <span class="original-price" v-if="product.originalPrice">${{ product.originalPrice.toFixed(2) }}</span>
                </div>
                <button class="add-to-cart-btn product-card-btn" @click="addToCart(product, 1)">Add to Cart</button>
              </div>
            </div>
          </div>
          <div class="show-more">
            <button class="show-more-btn">Show More</button>
          </div>
        </div>
      </section>
  
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-column">
              <h3 class="footer-logo">SustainaMart</h3>
              <address>
                2 Bayfront Avenue,<br>
                Unit #1-41, The Shoppes at Marina Bay Sands,<br>
                Singapore 018972, Singapore
              </address>
            </div>
            <div class="footer-column">
              <h4>Links</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Marketplace</a></li>
                <li><a href="#">Trade-in Service</a></li>
                <li><a href="#">Sustainability Challenges</a></li>
                <li><a href="#">Rewards</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Help</h4>
              <ul>
                <li><a href="#">Payment Options</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Privacy Policies</a></li>
                <li><a href="#">FAQs</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Newsletter</h4>
              <div class="newsletter-form">
                <input type="email" placeholder="Enter Your Email Address" class="newsletter-input">
                <button class="subscribe-btn">SUBSCRIBE</button>
              </div>
            </div>
          </div>
          <div class="copyright">
            <p>© 2025 SustainaMart. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductDetail',
    data() {
      return {
        selectedImage: 0,
        quantity: 1,
        selectedSize: 'S',
        selectedColor: 'Purple',
        showMiniCart: false,
        showAddedNotification: false,
        cart: [],
        product: {
          id: 16,
          name: 'Asgaard Sofa',
          price: 43.40,
          image: '/placeholder.svg?height=400&width=400',
          rating: 4.5,
          reviewCount: 5,
          description: 'Setting the bar as one of the loudest speakers in its class, the Asgaard is a compact, stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended highs for a sound that is both articulate and pronounced.',
          sizes: ['S', 'M', 'L'],
          colors: [
            { name: 'Purple', hex: '#816dfa' },
            { name: 'Black', hex: '#000000' },
            { name: 'Gold', hex: '#b88e2f' }
          ],
          sustainabilityTag: 'Low Waste'
        },
        recommendedProducts: [
          {
            id: 1,
            name: 'Syltherine',
            category: 'Stylish cafe chair',
            price: 29.30,
            originalPrice: 42.80,
            image: '/placeholder.svg?height=200&width=200',
            badge: '-30%',
            sustainabilityTag: 'Low Waste'
          },
          {
            id: 2,
            name: 'Leviosa',
            category: 'Stylish cafe chair',
            price: 21.30,
            image: '/placeholder.svg?height=200&width=200',
            sustainabilityTag: 'Plastic-Free'
          },
          {
            id: 3,
            name: 'Lolito',
            category: 'Luxury big sofa',
            price: 35.20,
            originalPrice: 48.00,
            image: '/placeholder.svg?height=200&width=200',
            badge: '-50%',
            sustainabilityTag: 'Biodegradable'
          },
          {
            id: 4,
            name: 'Respira',
            category: 'Outdoor bar table and stool',
            price: 34.30,
            image: '/placeholder.svg?height=200&width=200',
            badge: 'New',
            sustainabilityTag: 'Cruelty-Free'
          }
        ]
      }
    },
    computed: {
      productImages() {
        // In a real app, these would be actual product images
        return [
          '/placeholder.svg?height=400&width=400',
          '/placeholder.svg?height=400&width=400&text=Image2',
          '/placeholder.svg?height=400&width=400&text=Image3',
          '/placeholder.svg?height=400&width=400&text=Image4'
        ];
      }
    },
    mounted() {
      // Add click event listener to document to close mini cart when clicking outside
      document.addEventListener('click', this.handleOutsideClick);
    },
    beforeUnmount() {
      // Remove event listener when component is destroyed
      document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
      getSustainabilityClass(tag) {
        switch(tag) {
          case 'Low Waste':
            return 'low-waste';
          case 'Plastic-Free':
            return 'plastic-free';
          case 'Biodegradable':
            return 'biodegradable';
          case 'Cruelty-Free':
            return 'cruelty-free';
          default:
            return '';
        }
      },
      increaseQuantity() {
        this.quantity++;
      },
      decreaseQuantity() {
        if (this.quantity > 1) {
          this.quantity--;
        }
      },
      addToCart(product, qty = null) {
        // Use the specified quantity or the current quantity state
        const quantityToAdd = qty !== null ? qty : this.quantity;
        
        // Check if product is already in cart
        const existingProductIndex = this.cart.findIndex(item => 
          item.id === product.id && 
          (product.id !== this.product.id || 
            (this.selectedSize === item.size && this.selectedColor === item.color))
        );
        
        if (existingProductIndex !== -1) {
          // Update quantity if product already exists in cart
          const updatedCart = [...this.cart];
          updatedCart[existingProductIndex].quantity += quantityToAdd;
          this.cart = updatedCart;
        } else {
          // Add new product to cart
          const cartItem = {
            ...product,
            quantity: quantityToAdd,
            // Add selected options for main product
            size: product.id === this.product.id ? this.selectedSize : null,
            color: product.id === this.product.id ? this.selectedColor : null
          };
          
          this.cart.push(cartItem);
        }
        
        // Show notification
        this.showAddedNotification = true;
        setTimeout(() => {
          this.showAddedNotification = false;
        }, 3000);
        
        // Show mini cart
        this.showMiniCart = true;
      },
      toggleMiniCart(event) {
        event.stopPropagation();
        this.showMiniCart = !this.showMiniCart;
      },
      handleOutsideClick(event) {
        const cartIconWrapper = document.querySelector('.cart-icon-wrapper');
        if (this.showMiniCart && cartIconWrapper && !cartIconWrapper.contains(event.target)) {
          this.showMiniCart = false;
        }
      }
    }
  }
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
  
  .main-nav a:hover, .main-nav a.active {
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
  
  .mini-cart {
    position: absolute;
    top: 30px;
    right: -10px;
    width: 300px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 15px;
    z-index: 100;
  }
  
  .mini-cart h4 {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .mini-cart-items {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .mini-cart-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .mini-cart-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .mini-cart-details {
    flex: 1;
  }
  
  .mini-cart-name {
    font-size: 14px;
    font-weight: 500;
  }
  
  .mini-cart-price {
    font-size: 12px;
    color: #898989;
  }
  
  .mini-cart-footer {
    margin-top: 15px;
    text-align: center;
  }
  
  .view-cart-btn {
    width: 100%;
    padding: 8px;
    background-color: #704116;
    color: white;
    border-radius: 4px;
    font-weight: 500;
  }
  
  /* Breadcrumb */
  .breadcrumb-container {
    background-color: #f9f1e7;
    padding: 15px 0;
  }
  
  .breadcrumb {
    font-size: 14px;
    color: #242424;
  }
  
  .breadcrumb a {
    color: #242424;
    opacity: 0.8;
  }
  
  /* Product Section */
  .product-section {
    padding: 40px 0;
  }
  
  .product-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  
  /* Product Gallery */
  .product-gallery {
    display: flex;
    gap: 20px;
  }
  
  .gallery-thumbnails {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .thumbnail {
    width: 80px;
    height: 80px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.3s, border-color 0.3s;
  }
  
  .thumbnail.active {
    border-color: #704116;
    opacity: 1;
  }
  
  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .gallery-main {
    flex: 1;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Product Info */
  .product-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .product-price {
    font-size: 24px;
    font-weight: 600;
    color: #704116;
    margin-bottom: 15px;
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .stars {
    display: flex;
  }
  
  .star {
    color: #d9d9d9;
    font-size: 20px;
  }
  
  .star.filled {
    color: #ffc700;
  }
  
  .review-count {
    font-size: 14px;
    color: #898989;
  }
  
  .product-description {
    font-size: 16px;
    line-height: 1.6;
    color: #3a3a3a;
    margin-bottom: 30px;
  }
  
  /* Product Options */
  .product-options {
    margin-bottom: 30px;
  }
  
  .option-group {
    margin-bottom: 20px;
  }
  
  .option-group h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .option-buttons {
    display: flex;
    gap: 15px;
  }
  
  .option-button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .option-button.active {
    background-color: #704116;
    color: white;
    border-color: #704116;
  }
  
  .color-options {
    display: flex;
    gap: 15px;
  }
  
  .color-button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: all 0.3s;
  }
  
  .color-button.active {
    border-color: #704116;
    transform: scale(1.1);
  }
  
  /* Add to Cart */
  .add-to-cart {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .quantity-selector {
    display: flex;
    align-items: center;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }
  
  .quantity-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background-color: #f4f5f7;
  }
  
  .quantity {
    width: 40px;
    text-align: center;
    font-size: 16px;
  }
  
  .add-to-cart-btn {
    flex: 1;
    padding: 0 30px;
    height: 40px;
    background-color: #704116;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    transition: background-color 0.3s;
  }
  
  .add-to-cart-btn:hover {
    background-color: #5a3412;
  }
  
  /* Added to Cart Notification */
  .added-notification {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background-color: #e6f7e6;
    color: #2ec1ac;
    border-radius: 4px;
    font-weight: 500;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .check-icon {
    font-size: 18px;
    font-weight: bold;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Recommended Products */
  .recommended-section {
    padding: 60px 0;
    background-color: #f9f1e7;
  }
  
  .section-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .recommended-products {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    margin-bottom: 40px;
  }
  
  .product-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  /* Product Badges */
  .product-badges {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .product-badge {
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .discount-badge {
    background-color: #e97171;
  }
  
  .sustainability-badge {
    background-color: #2ec1ac;
  }
  
  .sustainability-badge.low-waste {
    background-color: #2ec1ac;
  }
  
  .sustainability-badge.plastic-free {
    background-color: #62acb1;
  }
  
  .sustainability-badge.biodegradable {
    background-color: #7cb342;
  }
  
  .sustainability-badge.cruelty-free {
    background-color: #e89f71;
  }
  
  .product-image {
    height: 200px;
    position: relative;
    overflow: hidden;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .product-card:hover .product-image img {
    transform: scale(1.05);
  }
  
  .product-details {
    padding: 15px;
  }
  
  .product-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .product-category {
    font-size: 14px;
    color: #898989;
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
    color: #b0b0b0;
    text-decoration: line-through;
  }
  
  /* Product Card Button */
  .product-card-btn {
    width: 100%;
    height: 36px;
    font-size: 14px;
    margin-top: 10px;
  }
  
  .show-more {
    text-align: center;
  }
  
  .show-more-btn {
    padding: 10px 30px;
    border: 1px solid #704116;
    border-radius: 4px;
    color: #704116;
    font-weight: 600;
    transition: all 0.3s;
  }
  
  .show-more-btn:hover {
    background-color: #704116;
    color: white;
  }
  
  /* Footer */
  .footer {
    background-color: #704116;
    color: #fff;
    padding: 50px 0 20px;
  }
  
  .footer-content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    margin-bottom: 30px;
  }
  
  .footer-logo {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 15px;
  }
  
  .footer-column h4 {
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: 600;
  }
  
  .footer-column ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .footer-column a {
    font-size: 14px;
    opacity: 0.8;
    transition: opacity 0.3s;
  }
  
  .footer-column a:hover {
    opacity: 1;
  }
  
  .newsletter-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .newsletter-input {
    padding: 10px;
    border: none;
    border-radius: 4px;
  }
  
  .subscribe-btn {
    padding: 10px;
    background-color: #fff;
    color: #704116;
    border-radius: 4px;
    font-weight: 600;
    transition: background-color 0.3s;
  }
  
  .subscribe-btn:hover {
    background-color: #f0f0f0;
  }
  
  .copyright {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 14px;
    opacity: 0.8;
  }
  
  /* Responsive Styles */
  @media (max-width: 1024px) {
    .product-layout {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    
    .recommended-products {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .footer-content {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      gap: 15px;
    }
    
    .main-nav ul {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .product-gallery {
      flex-direction: column-reverse;
    }
    
    .gallery-thumbnails {
      flex-direction: row;
      overflow-x: auto;
    }
    
    .footer-content {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .recommended-products {
      grid-template-columns: 1fr;
    }
    
    .add-to-cart {
      flex-direction: column;
    }
    
    .add-to-cart-btn {
      width: 100%;
    }
  }
  </style>