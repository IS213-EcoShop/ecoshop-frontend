<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-column">
        <h3 class="footer-title">SustainaMart</h3>
        <p class="footer-text">2 Bayfront Avenue</p>
        <p class="footer-text">Unit B1-41, The Shoppes at Marina Bay Sands</p>
        <p class="footer-text">Singapore 018972</p>
      </div>

      <div class="footer-column">
        <h3 class="footer-title">Links</h3>
        <a href="/about" class="footer-link">About Us</a>
        <a href="/marketplace" class="footer-link">Marketplace</a>
        <a href="/trade-in" class="footer-link">Trade-In Service</a>
        <a href="/sustainability" class="footer-link">Sustainability Challenges</a>
        <a href="/rewards" class="footer-link">Rewards</a>
      </div>

      <div class="footer-column">
        <h3 class="footer-title">Help</h3>
        <a href="/payment" class="footer-link">Payment Options</a>
        <a href="/returns" class="footer-link">Returns</a>
        <a href="/privacy" class="footer-link">Privacy Policies</a>
        <a href="/faqs" class="footer-link">FAQs</a>
      </div>

      <div class="footer-column">
        <h3 class="footer-title">Newsletter</h3>
        <div class="newsletter-form">
          <input 
            type="email" 
            v-model="newsletter"
            placeholder="Enter Your Email Address" 
            class="newsletter-input"
          />
          <button class="newsletter-button" @click="subscribeNewsletter">SUBSCRIBE</button>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      2025 SustainaMart. All rights reserved
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      newsletter: ''
    }
  },
  methods: {
    subscribeNewsletter() {
      console.log('Newsletter subscription:', this.newsletter);
      this.newsletter = '';
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: #704116;
  color: white;
  padding: 2.5rem 1.5rem;
}

.footer-container {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.footer-text {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.footer-link {
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #d9d9d9;
}

.newsletter-form {
  display: flex;
  border-bottom: 1px solid white;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.newsletter-input {
  border: none;
  background: transparent;
  color: white;
  width: 100%;
  padding-bottom: 0.25rem;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.newsletter-input:focus {
  outline: none;
}

.newsletter-button {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  margin-left: 0.5rem;
  cursor: pointer;
}

.footer-bottom {
  max-width: 72rem;
  margin: 2rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  font-size: 0.875rem;
}
</style>