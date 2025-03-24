<template>
    <div class="about-us-page">

      <!-- Hero Section with Auto-Switching Carousel -->
      <section class="hero-section" :style="{ backgroundImage: `url(${heroImages[currentImageIndex]})` }">
        <div class="hero-content">
          <div class="hero-card">
            <h2>Shop Sustainably, Earn Rewards & Make an Impact!</h2>
            <p>Buy eco-friendly products, trade in preloved items, and earn rewards for making sustainable choices</p>
            <button class="cta-button" @click="goToMarketplace">START SHOPPING</button>
          </div>
        </div>
        <div class="hero-indicators">
          <span 
            v-for="(_, index) in heroImages" 
            :key="index" 
            :class="['indicator', { active: index === currentImageIndex }]"
            @click="setActiveImage(index)"
          ></span>
        </div>
      </section>
  
      <!-- Get To Know Us Section -->
      <section class="know-us-section">
        <h2 class="section-title">Get To Know Us</h2>
        <div class="know-us-content">
          <div class="description">
            <p>A world where shopping isn't just about buying—it's about making a difference. Together, we're creating a future where sustainability is the norm, and every conscious choice shapes a better planet.</p>
          </div>
          <div class="feature-cards">
            <div class="feature-card" @click="goToMarketplace">
              <div class="card-image">
                <img src="/aboutPage/gettoknowus1.png?height=200&width=150" alt="Phone with recycling symbol" />
              </div>
              <p>Explore Eco-Friendly Finds</p>
            </div>
            <div class="feature-card" @click="goToTradeIn">
              <div class="card-image">
                <img src="/aboutPage/gettoknowus2.png?height=200&width=150" alt="Person using laptop" />
              </div>
              <p>Start Your Trade-In</p>
            </div>
            <div class="feature-card" @click="goToSustainability">
              <div class="card-image">
                <img src="/aboutPage/gettoknowus3.jpg?height=200&width=150" alt="People silhouettes at sunset" />
              </div>
              <p>Be A Sustainability Hero</p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Shop By Categories Section -->
      <section class="categories-section">
        <h2 class="section-title">Shop By Categories</h2>
        <div class="categories-grid">
          <div class="category-card" @click="goToCategory('green-beauty')">
            <img src="/aboutPage/greenbeauty.png?height=240&width=240" alt="Green beauty products" />
            <button class="category-button">GREEN BEAUTY</button>
          </div>
          <div class="category-card" @click="goToCategory('tech-gadgets')">
            <img src="/aboutPage/techgadget.png?height=240&width=240" alt="Tech gadgets" />
            <button class="category-button">TECH GADGETS</button>
          </div>
          <div class="category-card" @click="goToCategory('sustainable-fashion')">
            <img src="/aboutPage/susfashion.png?height=240&width=240" alt="Sustainable fashion items" />
            <button class="category-button">SUSTAINABLE FASHION</button>
          </div>
          <div class="category-card" @click="goToCategory('furniture-home-decor')">
            <img src="/aboutPage/furniture.png?height=240&width=240" alt="Home decor items" />
            <button class="category-button">FURNITURE & HOME DECOR</button>
          </div>
        </div>
        <div class="view-all">
          <a href="#" @click.prevent="goToMarketplace">View All</a>
        </div>
      </section>
  
      <!-- Our Impact Section -->
      <section class="impact-section">
        <h2 class="section-title">Our Impact</h2>
        <div class="impact-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <img src="/aboutPage/partner.svg?height=20&width=60" alt="Hearts icon" />
            </div>
            <h3>86% of our partnered brands</h3>
            <p>follow fair trade & sustainable production methods</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <img src="/aboutPage/people.svg?height=20&width=60" alt="Community icon" />
            </div>
            <h3>3,000+ community members</h3>
            <p>building a green future together</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <img src="/aboutPage/co2.svg?height=20&width=60" alt="CO2 reduction icon" />
            </div>
            <h3>35,000 metric tons of CO2 reduced</h3>
            <p>through conscious shopping & recycling efforts</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <img src="/aboutPage/waste.svg?height=20&width=60" alt="Waste reduction icon" />
            </div>
            <h3>12,000 metric tons of waste diverted from landfills</h3>
            <p>through our trade-in program</p>
          </div>
        </div>
      </section>
  
    </div>
  </template>
  
  <script>
  export default {
    name: 'AboutUs',
    data() {
      return {
        // Hero carousel images
        heroImages: [
          '/aboutPage/carousel1.jpg?height=500&width=1200&text=Sustainable+Living',
          '/aboutPage/carousel2.png?height=500&width=1200&text=Eco+Products',
          '/aboutPage/carousel3.png?height=500&width=1200&text=Green+Future'
        ],
        currentImageIndex: 0,
        carouselInterval: null
      }
    },
    mounted() {
      // Start the carousel auto-switching when component is mounted
      this.startCarousel();
    },
    beforeUnmount() {
      // Clear the interval when component is unmounted to prevent memory leaks
      this.stopCarousel();
    },
    methods: {
      // Navigation methods
      goToMarketplace() {
        window.location.href = '/marketplace';
      },
      
      goToTradeIn() {
        window.location.href = '/trade-in-service';
      },
      
      goToSustainability() {
        window.location.href = '/sustainability-challenges-rewards';
      },
      
      goToContact() {
        window.location.href = '/contact-us';
      },
      
      // Start the carousel auto-switching
      startCarousel() {
        this.carouselInterval = setInterval(() => {
          this.nextImage();
        }, 5000); // Switch every 5 seconds
      },
      
      // Stop the carousel auto-switching
      stopCarousel() {
        if (this.carouselInterval) {
          clearInterval(this.carouselInterval);
        }
      },
      
      // Go to the next image in the carousel
      nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
      },
      
      // Go to the previous image in the carousel
      prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.heroImages.length) % this.heroImages.length;
      },
      
      // Set the active image directly
      setActiveImage(index) {
        this.currentImageIndex = index;
        // Reset the interval when manually changing images
        this.stopCarousel();
        this.startCarousel();
      },
      // Navigate to specific category in the marketplace
      goToCategory(category) {
        // Navigate to marketplace with the category parameter
        window.location.href = `/marketplace?category=${category}`;
      }
    }
  }
  </script>
  
  <style scoped>
  /* Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Arial', sans-serif;
  }
  
  .about-us-page {
    background-color: #fcf8f3;
    color: #333333;
  }
  
  /* Navigation Bar */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .logo h1 {
    color: #704116;
    font-weight: bold;
    font-size: 1.5rem;
  }
  
  .nav-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-links a {
    text-decoration: none;
    color: #333333;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  .nav-links a:hover {
    color: #704116;
  }
  
  .nav-links a.active {
    color: #704116;
    font-weight: 600;
  }
  
  .nav-icons {
    display: flex;
    gap: 1rem;
  }
  
  .nav-icons button {
    background: none;
    border: none;
    cursor: pointer;
    color: #333333;
  }
  
  /* Hero Section with Carousel */
  .hero-section {
    position: relative;
    height: 500px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 2rem;
    transition: background-image 0.5s ease-in-out;
  }
  
  .hero-content {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  .hero-card {
    background-color: #fff3e3;
    padding: 2rem;
    border-radius: 8px;
    max-width: 450px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .hero-card h2 {
    color: #704116;
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .hero-card p {
    color: #7b523c;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .cta-button {
    background-color: #704116;
    color: #ffffff;
    border: none;
    padding: 0.8rem 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    background-color: #5a3412;
  }
  
  .hero-indicators {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #d9d9d9;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .indicator.active {
    background-color: #704116;
  }
  
  /* Get To Know Us Section */
  .know-us-section {
    padding: 4rem 2rem;
  }
  
  .section-title {
    color: #704116;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .know-us-content {
    display: flex;
    align-items: center;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .description {
    flex: 1;
    padding: 2rem;
    background-color: #fff3e3;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .description p {
    color: #7b523c;
    font-size: 1.1rem;
    line-height: 1.8;
    font-style: italic;
  }
  
  .feature-cards {
    flex: 1.5;
    display: flex;
    gap: 1.5rem;
  }
  
  .feature-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .feature-card:hover {
    transform: translateY(-8px);
  }
  
  .card-image {
    height: 180px;
    width: 130px;
    overflow: hidden;
    border-radius: 20px;
    margin: 0 auto 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .feature-card:hover .card-image {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .feature-card p {
    color: #333333;
    font-weight: 500;
    transition: color 0.3s ease;
  }
  
  .feature-card:hover p {
    color: #704116;
    font-weight: 600;
  }
  
  /* Shop By Categories Section */
  .categories-section {
    padding: 2rem;
    background-color: #f9f1e7;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 240px);
    gap: 1.5rem;
    margin-top: 2rem;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .category-card {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
    height: 100%;
  }
  
  .category-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .category-button {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: #704116;
    color: #ffffff;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .category-card:hover .category-button {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    background-color: #5a3412;
  }
  
  .view-all {
    text-align: center;
    margin-top: 2rem;
  }
  
  .view-all a {
    color: #704116;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  .view-all a:hover {
    color: #5a3412;
    text-decoration: underline;
  }
  
  /* Our Impact Section */
 /* Our Impact Section - Updated */
.impact-section {
  padding: 4rem 2rem;
  background-color: #fcf8f3;
  text-align: center;
  position: relative;
}

.section-title {
  color: #704116;
  font-size: 2rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
}

/* Add a decorative line under the title */
.impact-section .section-title:after {
  content: "";
  display: block;
  width: 80px;
  height: 3px;
  background-color: #8B4513;
  margin: 0.8rem auto 0;
}

.impact-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* Add connecting lines between stat cards */
.impact-stats:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 2px;
  background-color: rgba(112, 65, 22, 0.2);
  transform: translate(-50%, -50%);
}

.impact-stats:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 70%;
  background-color: rgba(112, 65, 22, 0.2);
  transform: translate(-50%, -50%);
}

.impact-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(112, 65, 22, 0.05) 0%, transparent 70%);
  z-index: 0;
}

.stat-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(112, 65, 22, 0.1);
  border-radius: 50%;
  padding: 1rem;
}

.stat-icon img {
  max-width: 50px;
  max-height: 50px;
  filter: brightness(0) saturate(100%) invert(26%) sepia(29%) saturate(1122%) hue-rotate(346deg) brightness(91%) contrast(84%);
}

.stat-card h3 {
  color: #704116;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  line-height: 1.4;
}

.stat-card p {
  color: #7b523c;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .impact-stats {
    grid-template-columns: 1fr;
  }
  
  .impact-stats:before,
  .impact-stats:after {
    display: none; /* Hide connecting lines on mobile */
  }
  
  .stat-card {
    max-width: 400px;
    margin: 0 auto;
  }
}
  
  /* Responsive Design */
  @media (max-width: 1024px) {
    .nav-links {
      display: none;
    }
    
    .hero-content {
      justify-content: center;
    }
    
    .impact-stats {
      grid-template-columns: 1fr;
    }
    
    .know-us-content {
      flex-direction: column;
      gap: 2rem;
    }
    
    .description {
      width: 100%;
    }
  }
  
  @media (max-width: 768px) {
    .feature-cards {
      flex-direction: column;
      align-items: center;
    }
    
    .categories-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 200px);
    }
    
    .footer-content {
      flex-direction: column;
    }
  }
  </style>