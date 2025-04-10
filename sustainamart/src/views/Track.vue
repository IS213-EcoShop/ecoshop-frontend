```vue type="vue" project="Delivery Tracking" file="Track.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="tracking-page">
    <h1 class="page-title">Track Your Delivery</h1>
    
    <!-- Order ID Input Form -->
    <div class="tracking-form">
      <div class="input-container">
        <div class="input-wrapper">
          <label for="order-id" class="input-label">Order ID</label>
          <input 
            id="order-id" 
            v-model="orderId" 
            type="text" 
            placeholder="Enter your order ID" 
            class="input-field"
          />
        </div>
        <div class="button-wrapper">
          <button 
            @click="trackOrder" 
            class="cta-button"
            :disabled="isLoading || !orderId"
          >
            <span v-if="isLoading" class="loading-icon">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Tracking...' : 'TRACK' }}
          </button>
        </div>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
    
    <!-- Tracking Results -->
    <div v-if="trackingData.length > 0" class="tracking-results">
      <h2 class="section-title">Delivery Status</h2>
      
      <div class="timeline-container">
        <!-- Timeline Line -->
        <div class="timeline-line"></div>
        
        <!-- Timeline Items -->
        <div v-for="status in trackingData" :key="status.id" class="timeline-item">
          <!-- Status Dot -->
          <div class="status-dot" :class="getStatusColor(status.status)">
            <component :is="getStatusIcon(status.status)" class="status-icon" />
          </div>
          
          <!-- Status Content -->
          <div class="status-content">
            <div class="status-header">
              <h3 class="status-title">{{ formatStatus(status.status) }}</h3>
              <span class="status-date">{{ formatDate(status.createdAt) }}</span>
            </div>
            <p v-if="status.description" class="status-description">{{ status.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="hasSearched && !isLoading" class="empty-state">
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="empty-title">No tracking information found</h3>
        <p class="empty-message">Please check your order ID and try again</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Icons for status
const TruckIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 17h4V5H2v12h3"/>
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
      <circle cx="7.5" cy="17.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  `
};

const SearchIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  `
};

const PackageIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m16 16 2 2 4-4"/>
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
      <path d="M16.5 9.4 7.55 4.24"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  `
};

const CheckIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  `
};

// State
const orderId = ref('');
const trackingData = ref([]);
const isLoading = ref(false);
const error = ref('');
const hasSearched = ref(false);

// Hardcoded user ID as specified
const userId = 200;

// Track order function
const trackOrder = async () => {
  if (!orderId.value) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`http://localhost:5209/delivery/${userId}/${orderId.value}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Sort by createdAt date (oldest first)
    trackingData.value = data.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    hasSearched.value = true;
  } catch (err) {
    console.error('Error fetching tracking data:', err);
    error.value = 'Failed to fetch tracking information. Please try again.';
    trackingData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Format date to be more readable
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format status to be more readable
const formatStatus = (status) => {
  switch (status) {
    case 'DRIVER_FOUND':
      return 'Driver Found';
    case 'PICKED_UP':
      return 'Order Picked Up';
    case 'DELIVERED':
      return 'Order Delivered';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Get appropriate icon for status
const getStatusIcon = (status) => {
  switch (status) {
    case 'DRIVER_FOUND':
      return SearchIcon;
    case 'PICKED_UP':
      return TruckIcon;
    case 'DELIVERED':
      return CheckIcon;
    default:
      return PackageIcon;
  }
};

// Get appropriate color for status
const getStatusColor = (status) => {
  switch (status) {
    case 'DRIVER_FOUND':
      return 'status-amber';
    case 'PICKED_UP':
      return 'status-blue';
    case 'DELIVERED':
      return 'status-green';
    default:
      return 'status-gray';
  }
};
</script>

<style scoped>
/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

.tracking-page {
  background-color: #fcf8f3;
  color: #333333;
  padding: 2rem;
  min-height: 100vh;
}

.page-title {
  color: #704116;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

/* Tracking Form */
.tracking-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto 3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .input-container {
    flex-direction: row;
    align-items: flex-end;
  }
}

.input-wrapper {
  flex-grow: 1;
}

.input-label {
  display: block;
  color: #7b523c;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0d5c8;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #704116;
  box-shadow: 0 0 0 2px rgba(112, 65, 22, 0.2);
}

.button-wrapper {
  display: flex;
  justify-content: center;
}

.cta-button {
  background-color: #704116;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  background-color: #5a3412;
}

.cta-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-icon {
  margin-right: 0.5rem;
}

.error-message {
  color: #e53e3e;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

/* Tracking Results */
.tracking-results {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  color: #704116;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.section-title:after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background-color: #704116;
  margin: 0.8rem auto 0;
}

.timeline-container {
  position: relative;
  padding: 1rem 0;
}

.timeline-line {
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: rgba(112, 65, 22, 0.2);
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.status-dot {
  position: absolute;
  left: 12px;
  top: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.status-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.status-content {
  background-color: #fff3e3;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .status-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.status-title {
  color: #704116;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-date {
  color: #7b523c;
  font-size: 0.875rem;
}

.status-description {
  color: #7b523c;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Status Colors */
.status-amber {
  background-color: #f59e0b;
}

.status-blue {
  background-color: #3b82f6;
}

.status-green {
  background-color: #10b981;
}

.status-gray {
  background-color: #6b7280;
}

/* Empty State */
.empty-state {
  background-color: #fff;
  border-radius: 12px;
  padding: 3rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1c4b5;
  margin-bottom: 1.5rem;
}

.empty-title {
  color: #704116;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.empty-message {
  color: #7b523c;
  font-size: 0.95rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tracking-page {
    padding: 1rem;
  }
  
  .tracking-form,
  .tracking-results,
  .empty-state {
    padding: 1.5rem;
  }
}
</style>