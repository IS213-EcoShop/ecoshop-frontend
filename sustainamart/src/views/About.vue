<template>
  <div>
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">About Us</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <i class="icon chevron-right"></i>
          <span>About Us</span>
        </div>
      </div>
    </div>

    <!-- About Content -->
    <div class="about-content">
      <h1 class="about-title">About Us</h1>
      <p class="about-text">
        Welcome to SustainaMart, your premier destination for sustainable and eco-friendly products.
        Our mission is to make sustainable shopping accessible, rewarding, and impactful.
      </p>
      <p class="about-text">
        Founded in 2023, we've been at the forefront of promoting environmental consciousness
        through innovative retail solutions and community engagement.
      </p>
      
      <div class="about-section">
        <h2 class="section-title">Our Vision</h2>
        <p class="about-text">
          We envision a world where sustainable choices are the norm, not the exception. 
          By connecting conscious consumers with eco-friendly products and brands, we aim to 
          create a marketplace that values environmental stewardship and social responsibility.
        </p>
      </div>
      
      <div class="about-section">
        <h2 class="section-title">Our Values</h2>
        <ul class="values-list">
          <li class="value-item">
            <strong>Sustainability:</strong> We prioritize products that minimize environmental impact.
          </li>
          <li class="value-item">
            <strong>Transparency:</strong> We provide clear information about product origins and impact.
          </li>
          <li class="value-item">
            <strong>Community:</strong> We foster a community of like-minded individuals committed to sustainable living.
          </li>
          <li class="value-item">
            <strong>Innovation:</strong> We continuously seek new ways to make sustainable shopping more accessible.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
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

.icon.chevron-right {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin: 0 0.25rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.about-title {
  font-size: 2.25rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 2rem;
}

.about-text {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.about-section {
  margin-top: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #704116;
  margin-bottom: 1.5rem;
}

.values-list {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.value-item {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1rem;
}
</style>