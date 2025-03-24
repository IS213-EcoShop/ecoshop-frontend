<template>
  <div>
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Contact Us</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <i class="icon chevron-right"></i>
          <span>Contact Us</span>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <section class="faq-section">
      <h2 class="section-title">Frequently Asked Questions</h2>
      
      <div class="faq-container">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index" 
          class="faq-item"
        >
          <div class="faq-question" @click="toggleFaq(index)">
            <h3 class="question-title">{{ faq.question }}</h3>
            <button class="plus-button">
              <i class="icon plus"></i>
            </button>
          </div>
          <div v-if="expandedFaq === index" class="faq-answer">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="contact-section">
      <div class="contact-container">
        <h2 class="section-title">Get In Touch With Us</h2>
        <p class="section-subtitle">
          For More Information About Our Product & Services, Please Feel Free To Drop Us An Email. Our Staff Always Be There To Help You Out. Do Not Hesitate!
        </p>

        <div class="contact-grid">
          <div class="contact-info">
            <div class="info-item">
              <div class="info-icon">
                <i class="icon map-pin"></i>
              </div>
              <div class="info-content">
                <h3 class="info-title">Address</h3>
                <p class="info-text">81 Victoria St,</p>
                <p class="info-text">Singapore 188065</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <i class="icon phone"></i>
              </div>
              <div class="info-content">
                <h3 class="info-title">Phone</h3>
                <p class="info-text">Mobile: +(65) 8123-6789</p>
                <p class="info-text">Hotline: +(65) 6123-6789</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <i class="icon clock"></i>
              </div>
              <div class="info-content">
                <h3 class="info-title">Working Time</h3>
                <p class="info-text">Monday-Friday: 9:00 - 22:00</p>
                <p class="info-text">Saturday-Sunday: 9:00 - 21:00</p>
              </div>
            </div>
          </div>

          <div class="contact-form">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="name" class="form-label">Your name</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="formData.name"
                  placeholder="ABC" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="email" class="form-label">Email address</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="formData.email"
                  placeholder="ABC@def.com" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="subject" class="form-label">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  v-model="formData.subject"
                  placeholder="This is an optional" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="message" class="form-label">Message</label>
                <textarea 
                  id="message" 
                  v-model="formData.message"
                  rows="4" 
                  placeholder="Hi! I'd like to ask about..." 
                  class="form-textarea"
                ></textarea>
              </div>
              
              <button type="submit" class="submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
  data() {
    return {
      expandedFaq: 0,
      formData: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      faqs: [
        {
          question: "How do I earn rewards for sustainable purchases?",
          answer: "You can earn rewards by purchasing eco-friendly products, participating in sustainability challenges, and trading in used goods for refurbishment or recycling. Points earned can be redeemed for discounts and exclusive offers. Keep an eye on your rewards dashboard for new challenges and bonus opportunities!"
        },
        {
          question: "What makes a product eco-friendly?",
          answer: "Eco-friendly products are made with sustainable materials, have minimal environmental impact during production, use less energy, create less waste, and often come with recyclable or biodegradable packaging. We verify all products on our platform against strict sustainability criteria."
        },
        {
          question: "Can I return or trade in used products?",
          answer: "Yes, we accept returns and trade-ins for most used products. Items must be in reasonable condition. You'll receive store credit or points that can be used for future purchases. Check our trade-in policy for specific details on eligible items."
        },
        {
          question: "How does we ensure that refurbished products are high quality?",
          answer: "All refurbished products undergo a rigorous quality control process. Our technicians inspect, clean, repair, and test each item to ensure it meets our standards. We also offer a warranty on refurbished items for your peace of mind."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers. For certain regions, we also offer buy-now-pay-later options through our verified partners."
        }
      ]
    }
  },
  methods: {
    toggleFaq(index) {
      this.expandedFaq = this.expandedFaq === index ? -1 : index;
    },
    submitForm() {
      // Form submission logic would go here
      console.log('Form submitted:', this.formData);
      // Reset form after submission
      this.formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
    }
  }
}
</script>

<style scoped>
/* Hero section */
.hero {
  position: relative;
  height: 10rem;
  background-color: #faf3ea;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .hero {
    height: 15rem;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background-image: url('/placeholder.svg?height=400&width=1200');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
}

.hero-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 0.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: #704116;
}

.icon {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon.chevron-right {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
  width: 1rem;
  height: 1rem;
  margin: 0 0.25rem;
}

.icon.plus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='M12 5v14'/%3E%3C/svg%3E");
  width: 1rem;
  height: 1rem;
}

.icon.map-pin {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23704116' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E");
}

.icon.phone {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23704116' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E");
}

.icon.clock {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23704116' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E");
}

/* FAQ section */
.faq-section {
  padding: 3rem 1.5rem;
  max-width: 64rem;
  margin: 0 auto;
  width: 100%;
}

.faq-container {
  background-color: #f9f5f2;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.faq-item {
  border-bottom: 1px solid #d9d9d9;
  padding: 1.5rem 0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.question-title {
  font-weight: bold;
}

.plus-button {
  border: 1px solid #0c0b0b;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;
}

.faq-answer {
  margin-top: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Contact section */
.contact-section {
  padding: 3rem 1.5rem;
  background-color: #faf3ea;
}

.contact-container {
  max-width: 64rem;
  margin: 0 auto;
}

.section-subtitle {
  text-align: center;
  font-size: 0.875rem;
  margin-bottom: 2.5rem;
}

.contact-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  margin-top: 0.25rem;
}

.info-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.info-text {
  font-size: 0.875rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
}

.form-textarea {
  resize: vertical;
}

.submit-button {
  background-color: #b88e2f;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #a07a29;
}
</style>