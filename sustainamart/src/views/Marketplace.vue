<template>
  <div class="marketplace">

    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-blur-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Marketplace</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <chevron-right-icon class="breadcrumb-icon" />
          <span class="breadcrumb-current">Marketplace</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <button class="filter-button">
            <span class="filter-icon"></span> Filter
          </button>
          <div class="results-info">Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage *
            itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} results</div>
          <div class="sort-options">
            <span>Show</span>
            <select class="select-control" v-model="itemsPerPage" @change="resetPagination">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
            </select>
            <span>Sort by</span>
            <select class="select-control" v-model="sortBy" @change="applySort">
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="filter-section">
              <h3>Categories</h3>
              <div class="filter-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Green Beauty"> Green Beauty/ Personal Care
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Technology"> Technology Gadgets
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Fashion"> Fashion
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.categories" value="Furniture"> Furniture/ Home Decor
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3>Others</h3>
              <div class="filter-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.newItems"> New Items
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="filters.prelovedItems"> Preloved Items
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-slider">
                <input type="range" min="0" max="100" v-model="priceRange" class="slider" @change="applyPriceFilter">
                <div class="price-inputs">
                  <div>
                    <label>Min</label>
                  </div>
                  <div>
                    <label>Max</label>
                  </div>
                </div>
              </div>
            </div>

            <button class="apply-filters-btn" @click="applyFilters">Apply Filters</button>
          </aside>

          <!-- Products Section -->
          <div class="products-section">
            <!-- Tabs -->
            <div class="product-tabs">
              <button class="tab-button" :class="{ active: activeTab === 'new' }" @click="setActiveTab('new')">
                New Finds
              </button>
              <button class="tab-button" :class="{ active: activeTab === 'preloved' }"
                @click="setActiveTab('preloved')">
                Preloved Gems
              </button>
            </div>

            <!-- Product Grid -->
            <div class="product-grid">
              <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name">
                  <span v-if="product.tag" class="product-tag" :class="product.tagClass">
                    {{ product.tag }}
                  </span>
                  <button class="hover-cart-btn" @click.stop="addToCart(product)">Add to cart</button>
                  <a :href="`/product/${product.id}`" class="product-link"
                    @click.prevent="viewProductDetails(product.id)"></a>
                </div>
                <div class="product-info">
                  <a :href="`/product/${product.id}`" class="product-title-link"
                    @click.prevent="viewProductDetails(product.id)">
                    <h3 class="product-title">{{ product.name }}</h3>
                  </a>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">
                    <span class="current-price">${{ product.price.toFixed(2) }}</span>
                    <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice.toFixed(2)
                      }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button class="page-button prev" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                Prev
              </button>

              <button v-for="page in totalPages" :key="page" class="page-button"
                :class="{ active: currentPage === page }" @click="changePage(page)">
                {{ page }}
              </button>

              <button class="page-button next" :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)">
                Next
              </button>
            </div>
          </div>
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
  name: 'MarketplaceTab',
  beforeCreate() {
    console.log('MARKETPLACE - beforeCreate') // Should appear first

  },
  created() {
    console.log('MARKETPLACE - created') // Should appear second
  },
  beforeMount() {
    console.log('MARKETPLACE - beforeMount') // Should appear third
    this.fetchProducts()

  },
  mounted() {
    console.log('MARKETPLACE - mounted') // Should appear last
  },
  data() {

    return {
      priceRange: [0, 1000],
      cart: [],
      currentPage: 1,
      itemsPerPage: 12,
      activeTab: 'new',
      sortBy: 'default',
      filters: {
        categories: [],
        newItems: true,
        prelovedItems: false,
        minPrice: 0,
        maxPrice: 1000
      },
      // allProducts: [
      //   // Page 1
      //   {
      //     id: 1,
      //     name: 'Bamboo Chair',
      //     description: 'Sustainable, comfortable bamboo chair',
      //     price: 27.50,
      //     image: '/marketplace/bamboochair.png?height=200&width=200',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 2,
      //     name: 'Aloe Facial Toner',
      //     description: 'Organic aloe toner',
      //     price: 17.90,
      //     originalPrice: 24.00,
      //     image: '/marketplace/aloetoner.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 3,
      //     name: 'Terracotta Side Table',
      //     description: 'Handcrafted from raw terracotta',
      //     price: 30.00,
      //     image: '/marketplace/terracotta.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 4,
      //     name: 'BeesWax Food Wraps',
      //     description: 'Biodegradable wraps',
      //     price: 8.20,
      //     originalPrice: 10.90,
      //     image: '/marketplace/beeswax.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 5,
      //     name: 'Reusable Cotton Rounds',
      //     description: 'Washable cotton rounds',
      //     price: 4.50,
      //     image: '/marketplace/cottonrounds.png?height=200&width=200',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 6,
      //     name: 'Vegan Leather Sleeve',
      //     description: 'Cruelty-free vegan leather',
      //     price: 28.80,
      //     originalPrice: 35.40,
      //     image: '/marketplace/vegan.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 7,
      //     name: 'Coconut Face Bar',
      //     description: 'Detoxifying facial cleanser',
      //     price: 12.00,
      //     image: '/marketplace/coconut.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 8,
      //     name: 'Glass Storage Jars',
      //     description: 'Stylish crate chest',
      //     price: 7.40,
      //     originalPrice: 9.80,
      //     image: '/marketplace/glass.png?height=200&width=200',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 9,
      //     name: 'Bamboo Board',
      //     description: 'Sturdy, bamboo fabric',
      //     price: 7.80,
      //     image: '/marketplace/bamboo.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 10,
      //     name: 'Silk-Free Scarf',
      //     description: 'Organic cotton, natural dye',
      //     price: 16.30,
      //     originalPrice: 20.00,
      //     image: '/marketplace/scarf.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 11,
      //     name: 'WoodTone Charger',
      //     description: 'Wireless charging pad',
      //     price: 15.20,
      //     image: '/marketplace/woodtone.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Technology',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 12,
      //     name: 'Wooden Blocks',
      //     description: 'Sustainable, non-toxic wood',
      //     price: 13.50,
      //     originalPrice: 17.20,
      //     image: '/marketplace/blocks.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },

      //   // Page 2
      //   {
      //     id: 13,
      //     name: 'Bamboo Toothbrush',
      //     description: 'Biodegradable handle, soft bristles',
      //     price: 3.99,
      //     image: '/marketplace/toothbrush.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 14,
      //     name: 'Hemp Backpack',
      //     description: 'Durable, sustainable hemp material',
      //     price: 45.00,
      //     originalPrice: 60.00,
      //     image: '/marketplace/backpack.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 15,
      //     name: 'Solar Power Bank',
      //     description: 'Charge your devices with solar energy',
      //     price: 29.99,
      //     image: '/marketplace/powerbank.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Technology',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 16,
      //     name: 'Recycled Paper Notebook',
      //     description: '100% recycled paper, soy-based ink',
      //     price: 8.50,
      //     image: '/marketplace/notebook.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 17,
      //     name: 'Organic Cotton T-Shirt',
      //     description: 'Soft, breathable organic cotton',
      //     price: 19.99,
      //     originalPrice: 25.00,
      //     image: '/marketplace/organicshirt.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 18,
      //     name: 'Stainless Steel Water Bottle',
      //     description: 'Durable, reusable, BPA-free',
      //     price: 18.50,
      //     image: '/marketplace/waterbottle.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 19,
      //     name: 'Recycled Glass Vase',
      //     description: 'Handcrafted from recycled glass',
      //     price: 22.00,
      //     originalPrice: 28.00,
      //     image: '/marketplace/vase.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 20,
      //     name: 'Biodegradable Phone Case',
      //     description: 'Made from plant-based materials',
      //     price: 14.99,
      //     image: '/marketplace/phonecase.png?height=200&width=200',
      //     tag: 'Biodegradable',
      //     tagClass: 'low-waste',
      //     category: 'Technology',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 21,
      //     name: 'Organic Lip Balm Set',
      //     description: 'Natural ingredients, plastic-free packaging',
      //     price: 9.99,
      //     image: '/marketplace/lipbalm.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 22,
      //     name: 'Bamboo Cutlery Set',
      //     description: 'Portable, reusable utensils',
      //     price: 12.50,
      //     originalPrice: 15.00,
      //     image: '/marketplace/cutlery.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 23,
      //     name: 'Recycled Wool Blanket',
      //     description: 'Cozy, sustainable home essential',
      //     price: 49.99,
      //     image: '/marketplace/blanket.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 24,
      //     name: 'Natural Deodorant',
      //     description: 'Aluminum-free, compostable packaging',
      //     price: 8.99,
      //     originalPrice: 11.99,
      //     image: '/marketplace/deo.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },

      //   // Page 3
      //   {
      //     id: 25,
      //     name: 'Eco-Friendly Yoga Mat',
      //     description: 'Made from natural rubber and cork',
      //     price: 38.00,
      //     image: '/marketplace/mat.png?height=200&width=200',
      //     tag: 'Biodegradable',
      //     tagClass: 'low-waste',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 26,
      //     name: 'Reusable Produce Bags',
      //     description: 'Set of 5 mesh bags for grocery shopping',
      //     price: 10.99,
      //     originalPrice: 14.99,
      //     image: '/marketplace/bags.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 27,
      //     name: 'Bamboo Desk Organizer',
      //     description: 'Stylish, sustainable office accessory',
      //     price: 24.50,
      //     image: '/marketplace/organizer.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 28,
      //     name: 'Organic Cotton Bedding',
      //     description: 'Soft, chemical-free sheets and pillowcases',
      //     price: 79.99,
      //     originalPrice: 99.99,
      //     image: '/marketplace/bedding.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 29,
      //     name: 'Recycled Plastic Outdoor Rug',
      //     description: 'Made from recycled plastic bottles',
      //     price: 35.00,
      //     image: '/marketplace/rug.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 30,
      //     name: 'Compostable Phone Charger',
      //     description: 'Biodegradable materials, sustainable design',
      //     price: 19.99,
      //     originalPrice: 24.99,
      //     image: '/marketplace/phonecharger.png?height=200&width=200',
      //     tag: 'Biodegradable',
      //     tagClass: 'low-waste',
      //     category: 'Technology',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 31,
      //     name: 'Organic Shampoo Bar',
      //     description: 'Zero-waste hair care solution',
      //     price: 11.50,
      //     image: '/marketplace/shampoobar.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Green Beauty',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 32,
      //     name: 'Upcycled Denim Tote',
      //     description: 'Handmade from repurposed jeans',
      //     price: 29.99,
      //     image: '/marketplace/tote.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 33,
      //     name: 'Bamboo Bathroom Set',
      //     description: 'Sustainable toothbrush holder, soap dish, and more',
      //     price: 32.00,
      //     originalPrice: 40.00,
      //     image: '/marketplace/bambooset.png?height=200&width=200',
      //     tag: 'Plastic-Free',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 34,
      //     name: 'Recycled Paper Wall Art',
      //     description: 'Handcrafted decorative pieces',
      //     price: 45.00,
      //     image: '/marketplace/wallart.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 35,
      //     name: 'Solar-Powered Desk Lamp',
      //     description: 'Energy-efficient lighting solution',
      //     price: 28.99,
      //     originalPrice: 35.99,
      //     image: '/marketplace/lamp.png?height=200&width=200',
      //     tag: 'Low Waste',
      //     tagClass: 'low-waste',
      //     category: 'Technology',
      //     isNew: true,
      //     isPreloved: false
      //   },
      //   {
      //     id: 36,
      //     name: 'Organic Cotton Face Masks',
      //     description: 'Reusable, washable, comfortable',
      //     price: 15.00,
      //     image: '/marketplace/masks.png?height=200&width=200',
      //     tag: 'Cruelty-Free',
      //     tagClass: 'cruelty-free',
      //     category: 'Fashion',
      //     isNew: true,
      //     isPreloved: false
      //   },

      //   // Preloved items
      //   {
      //     id: 101,
      //     name: 'Vintage Armchair',
      //     description: 'Restored mid-century design',
      //     price: 85.00,
      //     originalPrice: 150.00,
      //     image: '/marketplace/armchair.png?height=200&width=200',
      //     tag: 'Upcycled',
      //     tagClass: 'low-waste',
      //     category: 'Furniture',
      //     isNew: false,
      //     isPreloved: true
      //   },
      //   {
      //     id: 102,
      //     name: 'Retro Coffee Table',
      //     description: 'Refurbished 1970s piece',
      //     price: 65.30,
      //     image: '/marketplace/coffeetable.png?height=200&width=200',
      //     tag: 'Refurbished',
      //     tagClass: 'plastic-free',
      //     category: 'Furniture',
      //     isNew: false,
      //     isPreloved: true
      //   },
      //   {
      //     id: 103,
      //     name: 'Antique Bookshelf',
      //     description: 'Restored wooden bookcase',
      //     price: 120.00,
      //     originalPrice: 180.00,
      //     image: '/marketplace/bookshelf.png?height=200&width=200',
      //     tag: 'Restored',
      //     tagClass: 'cruelty-free',
      //     category: 'Furniture',
      //     isNew: false,
      //     isPreloved: true
      //   }
      // ],
      allProducts: [],
      prelovedProducts: [],
      isLoading: false,
      error: null,
      prelovedProducts: []
    }
  },


  computed: {

    filteredProducts() {
      let result = [...this.allProducts];

      // Filter by tab
      if (this.activeTab === 'new') {
        result = result.filter(product => product.isNew);
      } else if (this.activeTab === 'preloved') {
        result = result.filter(product => product.isPreloved);
      }

      // Apply category filters
      if (this.filters.categories.length > 0) {
        result = result.filter(product =>
          this.filters.categories.some(cat => product.category.includes(cat))
        );
      }

      // Apply price filter
      result = result.filter(product =>
        product.price >= this.filters.minPrice && product.price <= this.filters.maxPrice
      );

      // Apply sorting
      if (this.sortBy === 'price-low') {
        result.sort((a, b) => a.price - b.price);
      } else if (this.sortBy === 'price-high') {
        result.sort((a, b) => b.price - a.price);
      } else if (this.sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }

      return result;
    },
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredProducts.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },
  methods: {
    async fetchProducts() {
      this.isLoading = true
      this.error = null

      try {
        // Fetch products from your API
        console.log('Fetching products from API...');

        const response = await fetch('https://personal-o2kymv2n.outsystemscloud.com/SustainaMart/rest/v1/allproducts/')
        if (!response.ok) throw new Error('Failed to fetch products')

        // Get the JSON data
        const responseData = await response.json();

        // Extract the Products array - THIS IS THE CRUCIAL FIX
        const products = responseData.Products || [];
        console.log('Products:', products);

        if (!Array.isArray(products)) {
          throw new Error('Products data is not an array');
        }
        console.log('Products array length:', products.length);


        this.allProducts = products.map(product => ({
          // Map your API fields to your component's expected structure
          id: product.productId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          image: product.ImageURL, // Or process with Supabase if needed
          category: product.Category,
          isNew: product.Condition === 'New',
          isPreloved: product.Condition === 'Refurbished',
          tag: product.TagClass ? product.TagClass.split('-').join(' ') : null,
          tagClass: product.TagClass
        }));


        //UNDER DEVELOPMENT 
        // this.allProducts = await Promise.all(
        //   products.map(async product => {
        //     const imageUrl = product.ImageURL
        //       ? (await supabase.storage.from('product-images').getPublicUrl(product.ImageURL)).data.publicUrl
        //       : product.ImageURL;

        //     return {
        //       id: product.productId,
        //       name: product.Name,
        //       // ... other fields
        //       image: imageUrl
        //     };
        //   })
        // );

      } catch (err) {
        this.error = err.message
        console.error('Error fetching products:', err)
      } finally {
        this.isLoading = false
      }
    },

    changePage(page) {
      this.currentPage = page;
      // Scroll to top of products section
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    setActiveTab(tab) {
      this.activeTab = tab;
      this.currentPage = 1;
    },
    applySort() {
      this.currentPage = 1;
    },
    applyPriceFilter() {
      // Convert slider value to price range
      this.filters.minPrice = 0;
      this.filters.maxPrice = this.priceRange * 10; // Max price of 200
    },
    applyFilters() {
      this.currentPage = 1;
    },
    resetPagination() {
      this.currentPage = 1;
    },
    addToCart(product) {
      // Check if product is already in cart
      const existingProductIndex = this.cart.findIndex(item => item.id === product.id);

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists in cart
        const updatedCart = [...this.cart];
        updatedCart[existingProductIndex].quantity += 1;
        this.cart = updatedCart;
      } else {
        // Add new product to cart
        const cartItem = {
          ...product,
          quantity: 1
        };

        this.cart.push(cartItem);
      }

      // Show notification or update UI
      alert(`${product.name} added to cart!`);
    },
    viewProductDetails(productId) {
      // In a real app, this would navigate to the product detail page
      // For now, we'll just show an alert
      alert(`Viewing details for product ID: ${productId}`);

      // In a real app with Vue Router, you would use:
      // this.$router.push(`/product/${productId}`);
    }
  },
  created() {
    // Initialize any data or perform actions when component is created
    this.applyFilters();
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
  Headphones as HeadphonesIcon
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

.main-nav a:hover,
.main-nav a.active {
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
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); /* Optional: adds slight shadow to make text more readable */
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

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f9f1e7;
  border-radius: 8px 8px 0 0;
  margin-top: 20px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background-color: #fff;
  border-radius: 4px;
  font-weight: 500;
}

.filter-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #333;
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.results-info {
  font-size: 14px;
  color: #666;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.select-control {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  margin: 30px 0;
}

/* Sidebar */
.sidebar {
  background-color: #f9f1e7;
  padding: 20px;
  border-radius: 8px;
}

.filter-section {
  margin-bottom: 25px;
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 600;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.price-slider {
  margin-top: 15px;
}

.slider {
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e0d5c8;
  border-radius: 5px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #704116;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #704116;
  cursor: pointer;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.apply-filters-btn {
  width: 100%;
  padding: 10px;
  background-color: #704116;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 20px;
}

/* Product Tabs */
.product-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.tab-button {
  padding: 12px;
  text-align: center;
  font-weight: 500;
  background-color: #fff;
  transition: all 0.3s;
}

.tab-button.active {
  background-color: #704116;
  color: #fff;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.product-image {
  position: relative;
  height: 200px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Link */
.product-link {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;
}

.product-title-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.product-title-link:hover .product-title {
  color: #704116;
}

/* Hover Add to Cart Button */
.hover-cart-btn {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  width: 100%;
  padding: 10px;
  background-color: #704116;
  color: white;
  border: none;
  font-weight: 500;
  transition: bottom 0.3s ease;
  text-align: center;
  z-index: 2;
}

.product-image:hover .hover-cart-btn {
  bottom: 0;
}

.product-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  z-index: 2;
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

.product-info {
  padding: 15px;
}

.product-title {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 600;
  transition: color 0.3s;
}

.product-description {
  font-size: 14px;
  color: #666;
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
  color: #999;
  text-decoration: line-through;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 20px;
}

.page-button {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  background-color: #f5f5f5;
  padding: 0 10px;
}

.page-button.active {
  background-color: #704116;
  color: #fff;
}

.page-button:hover:not(.active):not(:disabled) {
  background-color: #e0d5c8;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-button.prev,
.page-button.next {
  min-width: 60px;
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
  .content-grid {
    grid-template-columns: 200px 1fr;
  }

  .features-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-grid {
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

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .features-section {
    grid-template-columns: 1fr;
  }
}
</style>