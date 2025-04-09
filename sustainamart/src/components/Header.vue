<template>
  <header class="header">
    <div class="header-left">
      <a href="/" class="logo">SustainaMart</a>
      <nav class="nav">
        <a href="/about" class="nav-link">About Us</a>
        <a href="/marketplace" class="nav-link">Marketplace</a>
        <a href="/trade-in" class="nav-link">Trade-In Service</a>
        <a href="/rewards" class="nav-link">Sustainability Challenges & Rewards</a>
        <a href="/contact" class="nav-link">Contact Us</a>
        <a href="/track" class="nav-link">Tracking</a>
      </nav>
    </div>
    <div class="header-right">
      <button aria-label="User account" class="icon-button">
        <i class="icon user"></i>
      </button>
      <button aria-label="Search" class="icon-button">
        <i class="icon search"></i>
      </button>
      <button aria-label="Wishlist" class="icon-button">
        <i class="icon heart"></i>
      </button>
      <router-link to="/cart" aria-label="Shopping cart" class="icon-button">
        <i class="icon cart"></i>
      </router-link>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #d9d9d9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.logo {
  color: #704116;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav {
  display: none;
}

@media (min-width: 768px) {
  .nav {
    display: flex;
    gap: 1.5rem;
  }
}

.nav-link {
  font-size: 0.875rem;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #704116;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon.user {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E");
}

.icon.search {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
}

.icon.heart {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E");
}

.icon.cart {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='8' cy='21' r='1'/%3E%3Ccircle cx='19' cy='21' r='1'/%3E%3Cpath d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/%3E%3C/svg%3E");
}
</style>