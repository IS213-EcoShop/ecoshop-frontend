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
        <!-- Cart Container -->
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
            
            <!-- Active Mission Banner (if applicable) -->
            <div v-if="hasPurchaseMission" class="active-mission-banner">
              <trophy-icon size="20" class="mission-icon" />
              <div class="mission-info">
                <h3>Active Mission</h3>
                <p>Complete your purchase to earn points!</p>
              </div>
            </div>
            
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

            <!-- Voucher Section -->
            <div class="voucher-section">
              <h3 class="voucher-title">
                <ticket-icon size="18" />
                Apply Voucher
              </h3>
              
              <div v-if="loadingVouchers" class="loading-vouchers">
                <div class="loading-spinner-small"></div>
                <span>Loading your vouchers...</span>
              </div>
              
              <div v-else-if="vouchers.length === 0" class="no-vouchers">
                <p>You don't have any vouchers available.</p>
              </div>
              
              <div v-else class="voucher-list">
                <div 
                  v-for="(voucher, index) in vouchers" 
                  :key="index" 
                  class="voucher-item"
                  :class="{ 'selected': selectedVoucherIndex === index }"
                  @click="selectVoucher(voucher, index)"
                >
                  <div class="voucher-info">
                    <h4 class="voucher-name">{{ voucher.name }}</h4>
                    <p class="voucher-expiry">Expires: {{ formatDate(voucher.expires_at) }}</p>
                  </div>
                  <div class="voucher-value">${{ voucher.value }}</div>
                  <div v-if="selectedVoucherIndex === index" class="voucher-selected-indicator">
                    <check-icon size="16" />
                  </div>
                </div>
              </div>
              
              <button 
                v-if="selectedVoucher" 
                @click="removeVoucher" 
                class="remove-voucher-btn"
              >
                <x-icon size="14" />
                Remove Voucher
              </button>
            </div>

            <div class="cart-summary">
              <div class="subtotal">
                <span>Subtotal:</span>
                <span>${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div v-if="selectedVoucher" class="discount">
                <span>Voucher Discount:</span>
                <span>-${{ selectedVoucher.value.toFixed(2) }}</span>
              </div>
              <div class="total">
                <span>Total:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
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

        <!-- Recommendations Section - Now outside of cart items container -->
        <div v-if="recommendations.length > 0" class="recommendations-container">
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
  name: "CartPage",
  data() {
    return {
      cartItems: [],
      recommendations: [],
      isLoading: false,
      loadingRecommendations: false,
      loadingVouchers: false,
      vouchers: [],
      selectedVoucher: null,
      selectedVoucherIndex: null,
      error: null,
      showToast: false,
      toastMessage: "",
      userId: 200, // Using the userId from your example query
      isProcessingPayment: false,
      paymentStatusMessage: "Preparing your payment...",
      stripePaymentUrl: null,
      paymentLinkAvailable: false,
      paymentCheckInterval: null,
      orderId: null,
      paymentId: null,
      checkoutSessionId: null,
      checkCount: 0,
      maxCheckAttempts: 20,
      activeMissions: [],
      hasPurchaseMission: false,
      windowCheckInterval: null,
    }
  },
  methods: {
    async fetchCartItems() {
      this.isLoading = true
      this.error = null

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
        `

        // Use a relative URL that will be proxied by Vite
        const response = await fetch("/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { userId: this.userId },
          }),
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const result = await response.json()

        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        this.cartItems = result.data.cart || []
        console.log("Cart items fetched:", this.cartItems)
      } catch (error) {
        console.error("Error fetching cart:", error)
        this.error = `Failed to load cart items: ${error.message}`
        this.cartItems = []
      } finally {
        this.isLoading = false
      }
    },

    async fetchVouchers() {
      this.loadingVouchers = true
      
      try {
        const response = await fetch(`http://localhost:5402/wallet/voucher/${this.userId}`)
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }
        
        const result = await response.json()
        this.vouchers = result.vouchers || []
        console.log("Vouchers fetched:", this.vouchers)
      } catch (error) {
        console.error("Error fetching vouchers:", error)
        this.vouchers = []
      } finally {
        this.loadingVouchers = false
      }
    },

    selectVoucher(voucher, index) {
      // Check if the voucher can be applied (e.g., minimum spend requirement)
      const subtotal = this.calculateSubtotal()
      
      // Example: Check if the voucher has a minimum spend requirement (from the name)
      const minSpendMatch = voucher.name.match(/min\. spend \$(\d+)/)
      
      if (minSpendMatch && minSpendMatch[1]) {
        const minSpend = parseFloat(minSpendMatch[1])
        
        if (subtotal < minSpend) {
          this.toastMessage = `This voucher requires a minimum spend of $${minSpend}.`
          this.showToast = true
          setTimeout(() => {
            this.showToast = false
          }, 3000)
          return
        }
      }
      
      // If already selected, deselect it
      if (this.selectedVoucherIndex === index) {
        this.selectedVoucher = null
        this.selectedVoucherIndex = null
      } else {
        this.selectedVoucher = voucher
        this.selectedVoucherIndex = index
        
        // Show toast notification
        this.toastMessage = `Voucher applied: ${voucher.name}`
        this.showToast = true
        setTimeout(() => {
          this.showToast = false
        }, 3000)
      }
    },
    
    removeVoucher() {
      this.selectedVoucher = null
      this.selectedVoucherIndex = null
      
      // Show toast notification
      this.toastMessage = "Voucher removed"
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    },

    async fetchRecommendations() {
      this.loadingRecommendations = true

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
        `

        const response = await fetch("/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { userId: this.userId },
          }),
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const result = await response.json()

        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        this.recommendations = result.data.recommendations || []
        console.log("Recommendations fetched:", this.recommendations)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        this.recommendations = []
      } finally {
        this.loadingRecommendations = false
      }
    },

    async decreaseQuantity(index) {
      const item = this.cartItems[index]
      if (item.quantity <= 1) {
        return // Don't decrement below 1
      }

      try {
        // First update the UI optimistically
        this.cartItems[index].quantity -= 1

        // Then connect to the specified backend endpoint
        const response = await fetch("http://localhost:5300/cart-product/decrement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: this.userId,
            productId: item.productId,
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to update server cart: ${response.status} ${response.statusText}`)
          // Revert the optimistic update if the server request fails
          this.cartItems[index].quantity += 1
          return false
        }

        const data = await response.json()
        console.log("Server cart updated successfully:", data)
        return true
      } catch (error) {
        console.error("Error updating cart:", error)
        // Revert the optimistic update if the request fails
        this.cartItems[index].quantity += 1
        return false
      }
    },

    async removeItem(index) {
      const item = this.cartItems[index]

      try {
        // Store the item in case we need to revert
        const removedItem = { ...this.cartItems[index] }

        // Remove from local state optimistically
        this.cartItems.splice(index, 1)

        // Connect to the specified backend endpoint
        const response = await fetch("http://localhost:5300/cart-product/remove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: this.userId,
            productId: item.productId,
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to remove item from server cart: ${response.status} ${response.statusText}`)
          // Revert the optimistic update if the server request fails
          this.cartItems.splice(index, 0, removedItem)
          return false
        }

        const data = await response.json()
        console.log("Item removed from server cart successfully:", data)

        // Show toast notification
        this.toastMessage = `${item.name} removed from cart!`
        this.showToast = true
        setTimeout(() => {
          this.showToast = false
        }, 3000)

        return true
      } catch (error) {
        console.error("Error removing item from cart:", error)
        // Revert the optimistic update if the request fails
        this.cartItems.splice(index, 0, item)
        return false
      }
    },

    async addToCart(product) {
      try {
        // First update the UI optimistically
        const existingItemIndex = this.cartItems.findIndex((item) => item.productId === product.productId)

        if (existingItemIndex !== -1) {
          // If item already exists in cart, increase quantity
          this.cartItems[existingItemIndex].quantity += 1
        } else {
          // Otherwise add new item to cart
          this.cartItems.push({
            ...product,
            quantity: 1,
          })
        }

        // Then connect to the specified backend endpoint
        const response = await fetch("http://localhost:5300/cart-product/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: this.userId,
            productId: product.productId,
            quantity: 1,
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to update server cart: ${response.status} ${response.statusText}`)

          // Revert the optimistic update if the server request fails
          if (existingItemIndex !== -1) {
            this.cartItems[existingItemIndex].quantity -= 1
          } else {
            this.cartItems = this.cartItems.filter((item) => item.productId !== product.productId)
          }
          return false
        }

        const data = await response.json()
        console.log("Product added to server cart successfully:", data)

        // Show toast notification
        this.toastMessage = `${product.name} added to cart!`
        this.showToast = true
        setTimeout(() => {
          this.showToast = false
        }, 3000)

        return true
      } catch (error) {
        console.error("Error adding item to cart:", error)

        // Revert the optimistic update if the request fails
        const existingItemIndex = this.cartItems.findIndex((item) => item.productId === product.productId)
        if (existingItemIndex !== -1) {
          this.cartItems[existingItemIndex].quantity -= 1
          if (this.cartItems[existingItemIndex].quantity <= 0) {
            this.cartItems = this.cartItems.filter((item) => item.productId !== product.productId)
          }
        } else {
          this.cartItems = this.cartItems.filter((item) => item.productId !== product.productId)
        }

        return false
      }
    },

    calculateSubtotal() {
      return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    
    calculateTotal() {
      const subtotal = this.calculateSubtotal()
      const discount = this.selectedVoucher ? this.selectedVoucher.value : 0
      
      // Ensure total doesn't go below zero
      return Math.max(subtotal - discount, 0)
    },

    async checkout() {
      if (this.isProcessingPayment) return

      this.isProcessingPayment = true
      this.paymentStatusMessage = "Preparing your payment..."
      this.error = null

      try {
        console.log("🔄 Initiating checkout...")

        // Check if we need to update mission progress for purchase
        if (this.hasPurchaseMission) {
          await this.updateMissionProgress("purchase_product")
        }

        // Prepare payload with voucher information if selected
        const payload = { 
          userID: this.userId 
        }
        
        // Add voucher information if a voucher is selected
        if (this.selectedVoucher) {
          payload.voucherId = this.selectedVoucher.id
          payload.voucherValue = this.selectedVoucher.value
        }

        // Place order via microservice
        const placeOrderResponse = await fetch("http://127.0.0.1:8000/place_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!placeOrderResponse.ok) {
          throw new Error("Order placement failed")
        }

        // Parse the response to get the Stripe payment URL
        const orderData = await placeOrderResponse.json()
        console.log("✅ Order response received:", orderData)

        if (orderData.code === 201 && orderData.payment_details.stripe_session_url) {
          // Store the Stripe payment URL
          this.stripePaymentUrl = orderData.payment_details.stripe_session_url

          // Extract checkout session ID from the URL if possible
          const sessionIdMatch = this.stripePaymentUrl.match(/session_id=([^&]*)/)
          if (sessionIdMatch && sessionIdMatch[1]) {
            this.checkoutSessionId = sessionIdMatch[1]
            console.log("Extracted checkout session ID:", this.checkoutSessionId)
          }

          // Store payment ID for checking payment status
          if (orderData.payment_details && orderData.payment_details.paymentID) {
            this.paymentId = orderData.payment_details.paymentID
          }

          // Store order ID if available
          if (orderData.order_details) {
            this.orderId = Object.keys(orderData.order_details)[0]
          }

          // Update status message
          this.paymentStatusMessage = "Redirecting to payment page..."

          // Open the Stripe payment URL in a new window
          const paymentWindow = window.open(this.stripePaymentUrl, "_blank")

          if (!paymentWindow) {
            // If popup is blocked, provide a link for the user to click
            this.paymentLinkAvailable = true
            this.paymentStatusMessage = "Payment window was blocked."
            this.error = `
              <div class="payment-link-container">
                <p>Payment popup was blocked by your browser.</p>
                <a href="${this.stripePaymentUrl}" target="_blank" class="payment-link">
                  Click here to proceed to payment
                </a>
              </div>
            `
            this.isProcessingPayment = false
            return
          }

          if (paymentWindow) {
            // Start checking payment status
            this.startPaymentStatusCheck(orderData)

            // Also monitor if the payment window is closed
            this.monitorPaymentWindow(paymentWindow, this.paymentId)
          }
        } else {
          throw new Error("Invalid response from server: Missing payment URL")
        }
      } catch (error) {
        console.error("Error during checkout:", error)
        this.error = `Checkout error: ${error.message}`
        this.isProcessingPayment = false
      }
    },

    startPaymentStatusCheck(orderData) {
      // Clear any existing interval
      if (this.paymentCheckInterval) {
        clearInterval(this.paymentCheckInterval)
      }

      // Make sure we have the payment ID
      if (!orderData.payment_details || !orderData.payment_details.paymentID) {
        console.error("No payment ID available for status check")
        this.handlePaymentFailure("Missing payment information")
        return
      }

      const paymentId = orderData.payment_details.paymentID
      console.log("Starting payment status check for payment ID:", paymentId)

      this.paymentStatusMessage = "Waiting for payment confirmation..."
      this.checkCount = 0

      // Check payment status every 3 seconds
      this.paymentCheckInterval = setInterval(async () => {
        try {
          this.checkCount++
          console.log(`Payment status check #${this.checkCount}`)

          // Use the correct endpoint and payment ID
          const statusResponse = await fetch(`http://localhost:8000/payment/${paymentId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          if (!statusResponse.ok) {
            throw new Error(`Failed to check payment status: ${statusResponse.status}`)
          }

          const statusData = await statusResponse.json()
          console.log("Payment status check:", statusData)

          // Check payment_status field from the response
          if (statusData.payment_status === "successful") {
            // Payment successful
            this.handlePaymentSuccess()
          } else if (statusData.payment_status === "failed" || statusData.payment_status === "canceled") {
            // Payment failed
            this.handlePaymentFailure("Payment was not completed")
          } else {
            // Still pending, update the message
            this.paymentStatusMessage = `Waiting for payment confirmation... (Status: ${statusData.payment_status || "pending"})`

            // If we've been checking for a while and still getting pending,
            // provide feedback but don't assume success
            if (this.checkCount >= 5 && statusData.payment_status === "pending") {
              // Check if we're on the success URL page
              const currentUrl = window.location.href
              if (currentUrl.includes("payment/") && currentUrl.includes(paymentId)) {
                console.log("Detected success URL with payment ID, assuming payment successful")
                this.handlePaymentSuccess()
                return
              }

              // If we've reached the maximum number of attempts, show timeout message
              if (this.checkCount >= this.maxCheckAttempts) {
                console.log("Reached maximum check attempts, payment status still pending")
                this.stopPaymentStatusCheck()
                this.isProcessingPayment = false
                this.error =
                  "Payment status could not be confirmed. Please check your order status in your account or contact support."
              }

              // Increase the interval after 5 checks to reduce server load
              if (this.checkCount === 5) {
                clearInterval(this.paymentCheckInterval)
                console.log("Increasing check interval to 5 seconds")
                this.paymentCheckInterval = setInterval(this.checkPaymentStatus.bind(this, paymentId), 5000)
              }
              // Increase again after 10 checks
              else if (this.checkCount === 10) {
                clearInterval(this.paymentCheckInterval)
                console.log("Increasing check interval to 10 seconds")
                this.paymentCheckInterval = setInterval(this.checkPaymentStatus.bind(this, paymentId), 10000)
              }
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error)
          // Don't stop checking on error, just log it
        }
      }, 3000)

      // Set a timeout to stop checking after 10 minutes (600000 ms)
      setTimeout(() => {
        this.stopPaymentStatusCheck()
        if (this.isProcessingPayment) {
          this.handlePaymentFailure("Payment confirmation timed out. Please check your order status in your account.")
        }
      }, 600000)
    },

    // Separate method for checking payment status
    async checkPaymentStatus(paymentId) {
      try {
        console.log(`Payment status check #${this.checkCount}`)
        this.checkCount++

        // Use the correct endpoint and payment ID
        const statusResponse = await fetch(`http://localhost:8000/payment/${paymentId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!statusResponse.ok) {
          throw new Error(`Failed to check payment status: ${statusResponse.status}`)
        }

        const statusData = await statusResponse.json()
        console.log("Payment status check:", statusData)

        // Check payment_status field from the response
        if (statusData.payment_status === "successful") {
          // Payment successful
          this.handlePaymentSuccess()
        } else if (statusData.payment_status === "failed" || statusData.payment_status === "canceled") {
          // Payment failed
          this.handlePaymentFailure("Payment was not completed")
        } else {
          // Still pending, update the message
          this.paymentStatusMessage = `Waiting for payment confirmation... (Status: ${statusData.payment_status || "pending"})`

          // If we've been checking for a while and still getting pending,
          // provide feedback but don't assume success
          if (this.checkCount >= this.maxCheckAttempts) {
            console.log("Reached maximum check attempts, payment status still pending")
            this.stopPaymentStatusCheck()
            this.isProcessingPayment = false
            this.error =
              "Payment status could not be confirmed. Please check your order status in your account or contact support."
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
        // Don't stop checking on error, just log it
      }
    },

    stopPaymentStatusCheck() {
      if (this.paymentCheckInterval) {
        clearInterval(this.paymentCheckInterval)
        this.paymentCheckInterval = null
      }

      if (this.windowCheckInterval) {
        clearInterval(this.windowCheckInterval)
        this.windowCheckInterval = null
      }
    },

    handlePaymentSuccess() {
      this.stopPaymentStatusCheck()
      this.isProcessingPayment = false

      // Show success message
      this.toastMessage = "Payment successful! Your order has been placed."
      this.showToast = true
      
      // Clear selected voucher after successful payment
      this.selectedVoucher = null

      // Redirect to rewards page if missions were completed
      if (this.hasPurchaseMission) {
        setTimeout(() => {
          window.location.href = "/rewards?missionCompleted=true"
        }, 2000)
      } else {
        // Just reload the page to refresh the cart
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    },

    handlePaymentFailure(message) {
      this.stopPaymentStatusCheck()
      this.isProcessingPayment = false

      // Show error message
      this.error = `Payment failed: ${message}`

      // Show toast notification
      this.toastMessage = "Payment was not completed. Please try again."
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 5000)
    },

    async increaseQuantity(index) {
      const item = this.cartItems[index]

      try {
        // First update the UI optimistically
        this.cartItems[index].quantity += 1

        // Then connect to the specified backend endpoint
        const response = await fetch("http://localhost:5300/cart-product/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: this.userId, // Default userID as specified
            productId: item.productId,
            quantity: 1, // Just increment by 1 as backend handles the logic
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to update server cart: ${response.status} ${response.statusText}`)
          // Revert the optimistic update if the server request fails
          this.cartItems[index].quantity -= 1
          return false
        }

        const data = await response.json()
        console.log("Server cart updated successfully:", data)
        return true
      } catch (error) {
        console.error("Error updating cart:", error)
        // Revert the optimistic update if the request fails
        this.cartItems[index].quantity -= 1
        return false
      }
    },

    async fetchActiveMissions() {
      try {
        // Fetch user's active missions
        const response = await fetch(`http://localhost:5403/mission/status/${this.userId}`)

        if (!response.ok) {
          console.error("Failed to fetch missions:", response.status)
          return
        }

        const missions = await response.json()
        this.activeMissions = missions

        // Check for purchase mission type
        this.hasPurchaseMission = missions.some(
          (mission) => mission.event_type === "purchase_product" && !mission.completed && !mission.claimed,
        )
      } catch (error) {
        console.error("Error fetching active missions:", error)
      }
    },

    async updateMissionProgress(eventType) {
      try {
        // Call the mission update API
        const response = await fetch(`http://localhost:5403/mission/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: this.userId,
            event_type: eventType,
          }),
        })

        if (!response.ok) {
          console.error(`Failed to update mission progress: ${response.status}`)
          return false
        }

        console.log(`Mission progress updated for ${eventType}`)
        return true
      } catch (error) {
        console.error("Error updating mission progress:", error)
        return false
      }
    },

    monitorPaymentWindow(paymentWindow, paymentId) {
      // Check if the window was closed
      const checkWindowClosed = setInterval(() => {
        if (paymentWindow.closed) {
          console.log("Payment window was closed by user")
          clearInterval(checkWindowClosed)

          // Check if payment is still processing
          if (this.isProcessingPayment) {
            // Don't immediately assume failure - check the status first
            this.checkPaymentStatusOnce(paymentId).then((status) => {
              if (status === "successful") {
                this.handlePaymentSuccess();
              } else if (status === "failed" || status === "canceled") {
                this.handlePaymentFailure("Payment was not completed");
              } else {
                // If still pending, wait a bit longer before checking again
                // This handles cases where the webhook hasn't processed yet
                setTimeout(() => {
                  this.checkPaymentStatusOnce(paymentId).then((finalStatus) => {
                    if (finalStatus === "successful") {
                      this.handlePaymentSuccess();
                    } else {
                      // Now we can assume it was abandoned
                      this.handlePaymentFailure("Payment appears to be abandoned");
                    }
                  });
                }, 3000); // Wait 3 seconds before final check
              }
            });
          }
        }
      }, 1000)

      // Store the interval ID so we can clear it later
      this.windowCheckInterval = checkWindowClosed
    },

    handleWindowFocus() {
      // If we're still processing payment and the user comes back to this window
      // it might mean they abandoned the payment OR they completed it successfully
      if (this.isProcessingPayment && this.paymentId) {
        console.log("User returned to the page while payment was processing")

        // Don't immediately assume failure - check the status first
        this.checkPaymentStatusOnce(this.paymentId).then((status) => {
          if (status === "successful") {
            this.handlePaymentSuccess();
          } else if (status === "failed" || status === "canceled") {
            this.handlePaymentFailure("Payment was not completed");
          } else if (status === "pending") {
            // If still pending, wait a bit longer before checking again
            // This handles cases where the webhook hasn't processed yet
            setTimeout(() => {
              this.checkPaymentStatusOnce(this.paymentId).then((finalStatus) => {
                if (finalStatus === "successful") {
                  this.handlePaymentSuccess();
                } else if (this.isProcessingPayment) {
                  // Only show the abandoned message if we're still processing
                  // This prevents showing the message if another check succeeded
                  this.handlePaymentFailure("Payment appears to be abandoned");
                }
              });
            }, 3000); // Wait 3 seconds before final check
          }
        });
      }
    },

    async checkPaymentStatusOnce(paymentId) {
      try {
        const statusResponse = await fetch(`http://localhost:8000/payment/${paymentId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!statusResponse.ok) {
          return "error"
        }

        const statusData = await statusResponse.json()
        return statusData.payment_status || "pending"
      } catch (error) {
        console.error("Error checking payment status:", error)
        return "error"
      }
    },
  },
  mounted() {
    // Fetch cart items, recommendations, and vouchers when the component is mounted
    this.fetchCartItems()
    this.fetchRecommendations()
    this.fetchActiveMissions()
    this.fetchVouchers() // Add this to fetch vouchers on mount

    // Check if we're returning from a payment (URL contains a session_id parameter)
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get("session_id")
    if (sessionId) {
      console.log("Detected return from payment with session ID:", sessionId)

      // If we have a session ID in the URL, we can assume the payment was successful
      // This handles the case where the user is redirected back before the webhook fires
      this.paymentId = sessionId
      this.isProcessingPayment = true
      this.paymentStatusMessage = "Verifying payment..."

      // Start checking payment status
      this.startPaymentStatusCheck({
        payment_details: {
          paymentID: sessionId,
        },
      })
    }

    window.addEventListener("focus", this.handleWindowFocus)
  },
  beforeUnmount() {
    // Clean up interval when component is destroyed
    this.stopPaymentStatusCheck()

    // Remove event listener
    window.removeEventListener("focus", this.handleWindowFocus)
  },
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
  CheckCircle as CheckCircleIcon,
  Trophy as TrophyIcon,
  Ticket as TicketIcon,
  Check as CheckIcon,
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

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #704116;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
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

/* Voucher Section */
.voucher-section {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.voucher-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #704116;
  margin-bottom: 16px;
}

.loading-vouchers {
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: #666;
}

.no-vouchers {
  padding: 10px 0;
  color: #666;
  font-style: italic;
}

.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.voucher-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.voucher-item:hover {
  border-color: #704116;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.voucher-item.selected {
  border-color: #704116;
  background-color: #f8ead7;
}

.voucher-info {
  flex: 1;
}

.voucher-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.voucher-expiry {
  font-size: 12px;
  color: #666;
}

.voucher-value {
  font-weight: 600;
  color: #704116;
  font-size: 16px;
}

.voucher-selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #704116;
}

.remove-voucher-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 6px 12px;
  border: 1px solid #e97171;
  border-radius: 4px;
  color: #e97171;
  font-size: 14px;
  transition: all 0.2s;
  align-self: flex-start;
}

.remove-voucher-btn:hover {
  background-color: #fff1f1;
}

/* Cart summary */
.cart-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.subtotal, .discount, .total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.subtotal, .discount {
  font-size: 16px;
}

.discount {
  color: #e97171;
}

.total {
  font-size: 18px;
  font-weight: 600;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
}

/* Recommendations Section */
.recommendations-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
  padding: 20px;
}

.recommendations-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #704116;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
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