<template>
  <div class="trade-in-page">
    <!-- Updated hero section with blurred background -->
    <div class="hero-section">
      <div class="hero-blur-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Trade-In Service</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <chevron-right-icon class="breadcrumb-icon" />
          <span class="breadcrumb-current">Trade-In Service</span>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="content-wrapper">
        <!-- Tabs for Form and Status - Improved tab design -->
        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'submission' }" 
            @click="activeTab = 'submission'"
          >
            <FileTextIcon size="18" class="tab-icon" />
            Submit New Trade-In
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'status' }" 
            @click="activeTab = 'status'"
          >
            <ClipboardListIcon size="18" class="tab-icon" />
            Trade-In Status
          </button>
        </div>

        <!-- Submission Form - Enhanced styling -->
        <div v-if="activeTab === 'submission'" class="submission-form">
          <h3 class="brown-title">Submit Your Item for Trade-In</h3>
          <p>Fill in the details below and upload clear photos of your item for quality assessment.</p>
          
          <form @submit.prevent="submitTradeIn">
            <div class="form-section">
              <h4><UserIcon size="20" class="section-icon" /> Personal Information</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="fullName">Full Name</label>
                  <div class="input-wrapper">
                    <UserIcon size="18" class="input-icon" />
                    <input type="text" id="fullName" v-model="form.fullName" required placeholder="Enter your full name">
                  </div>
                </div>
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <div class="input-wrapper">
                    <MailIcon size="18" class="input-icon" />
                    <input type="email" id="email" v-model="form.email" required placeholder="Enter your email address">
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <div class="input-wrapper">
                    <PhoneIcon size="18" class="input-icon" />
                    <input 
                      type="tel" 
                      id="phone" 
                      v-model="form.phone" 
                      required 
                      placeholder="Enter your 8-digit phone number"
                      pattern="[0-9]{8}"
                      maxlength="8"
                      @input="validatePhoneNumber"
                    >
                  </div>
                  <div v-if="phoneError" class="input-error">
                    <AlertCircleIcon size="14" class="error-icon" />
                    Please enter a valid 8-digit phone number
                  </div>
                </div>
                <div class="form-group">
                  <label for="address">Address</label>
                  <div class="input-wrapper">
                    <HomeIcon size="18" class="input-icon" />
                    <input type="text" id="address" v-model="form.address" required placeholder="Enter your address">
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4><PackageIcon size="20" class="section-icon" /> Product Information</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="productName">Product Name</label>
                  <div class="input-wrapper">
                    <TagIcon size="18" class="input-icon" />
                    <input type="text" id="productName" v-model="form.productName" required placeholder="Enter product name">
                  </div>
                </div>
                <div class="form-group">
                  <label for="category">Category</label>
                  <div class="select-wrapper">
                    <select id="category" v-model="form.category" required>
                      <option value="">Select a category</option>
                      <option value="green-beauty">Green Beauty</option>
                      <option value="sustainable-fashion">Sustainable Fashion</option>
                      <option value="tech-gadgets">Tech Gadgets</option>
                      <option value="furniture-home-decor">Furniture & Home Decor</option>
                    </select>
                    <ChevronDownIcon size="18" class="select-icon" />
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="description">Product Description</label>
                <textarea 
                  id="description" 
                  v-model="form.description" 
                  rows="4" 
                  required
                  placeholder="Describe your product including brand, materials, dimensions, and any notable features or defects"
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="condition">Condition</label>
                  <div class="select-wrapper">
                    <select id="condition" v-model="form.condition" required>
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                    <ChevronDownIcon size="18" class="select-icon" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="age">Age of Product (years)</label>
                  <div class="input-wrapper">
                    <CalendarIcon size="18" class="input-icon" />
                    <input 
                      type="number" 
                      id="age" 
                      v-model="form.age" 
                      min="0" 
                      step="1"
                      @keypress="validateAgeKeypress"
                      @input="validateAge"
                      required 
                      placeholder="Enter product age"
                    >
                  </div>
                  <div v-if="ageError" class="input-error">
                    <AlertCircleIcon size="14" class="error-icon" />
                    Please enter a valid whole number for product age
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4><ImageIcon size="20" class="section-icon" /> Product Images</h4>
              <p class="help-text">Upload a clear photo of your item (maximum 5 images).</p>
              
              <div class="image-upload-container">
                <div 
                  v-for="(image, index) in imagePreviewUrls" 
                  :key="index" 
                  class="image-preview"
                >
                  <img :src="image" alt="Product preview">
                  <button type="button" class="remove-btn" @click="removeImage(index)">
                    <XIcon size="16" />
                  </button>
                </div>
                
                <div class="upload-box" @click="triggerFileInput" v-if="imagePreviewUrls.length < 5">
                  <UploadIcon size="24" />
                  <span>Upload Image</span>
                  <input 
                    type="file" 
                    ref="fileInput" 
                    @change="handleFileUpload" 
                    accept="image/*" 
                    multiple 
                    class="hidden-input"
                  >
                </div>
              </div>
              <div class="upload-hint" v-if="imagePreviewUrls.length < 1">
                <AlertCircleIcon size="16" />
                <span>Please upload at least one image for a complete assessment</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="imagePreviewUrls.length < 1">
                <SendIcon size="18" />
                Submit Trade-In Request
              </button>
            </div>
          </form>
        </div>

        <!-- Status Section - Enhanced card design -->
        <div v-if="activeTab === 'status'" class="status-section">
          <h3 class="brown-title">Your Trade-In History</h3>
          
          <div v-if="tradeIns.length === 0" class="empty-state">
            <PackageIcon size="48" />
            <p>You don't have any trade-in requests yet.</p>
            <button class="action-btn primary-btn" @click="activeTab = 'submission'">Submit Your First Trade-In</button>
          </div>
          
          <div v-else class="trade-in-list">
            <div v-for="(item, index) in tradeIns" :key="index" class="trade-in-card">
              <div class="card-header">
                <h4>{{ item.productName }}</h4>
                <div class="status-badge" :class="getStatusClass(item.status)">
                  <span v-if="item.status === 'Pending'" class="status-icon"><ClockIcon size="14" /></span>
                  <span v-else-if="item.status === 'Accepted'" class="status-icon"><CheckIcon size="14" /></span>
                  <span v-else-if="item.status === 'Rejected'" class="status-icon"><XIcon size="14" /></span>
                  <span v-else-if="item.status === 'Claimed'" class="status-icon"><TrophyIcon size="14" /></span>
                  {{ item.status }}
                </div>
              </div>
              
              <div class="card-content">
                <div class="product-image">
                  <img :src="item.image" alt="Product image">
                </div>
                <div class="product-details">
                  <div class="detail-row">
                    <span class="label">Submitted:</span>
                    <span class="value">{{ formatDate(item.submittedDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Category:</span>
                    <span class="value">{{ item.category }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Condition:</span>
                    <span class="value">{{ item.condition }}</span>
                  </div>
                  <div v-if="item.status === 'Accepted' || item.status === 'Claimed'" class="detail-row points-row">
                    <span class="label">Reward:</span>
                    <span class="points-badge beige-box value">
                      <TrophyIcon size="16" />
                      20 Sustainability Points
                    </span>
                  </div>
                  <!-- Removed the Offered Value row for Asgaard Sofa -->
                  <div v-if="item.status === 'Accepted' && item.productName !== 'Asgaard Sofa' && item.offeredValue" class="detail-row">
                    <span class="label">Offered Value:</span>
                    <span class="value-badge value">Rs. {{ item.offeredValue.toLocaleString() }}</span>
                  </div>
                  <div v-if="item.status === 'Claimed'" class="detail-row claimed-row">
                    <span class="label">Claimed:</span>
                    <span class="value">{{ formatDate(item.claimedDate) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn" @click="viewDetails(item)">
                  <EyeIcon size="16" class="btn-icon" />
                  View Details
                </button>
                <button 
                  v-if="item.status === 'Accepted'" 
                  class="action-btn beige-box"
                  @click="claimRewardPoints(item, index)"
                >
                  <TrophyIcon size="16" class="btn-icon" />
                  Claim Reward Points
                </button>
                <button 
                  v-if="item.status === 'Pending'" 
                  class="action-btn beige-box"
                  @click="confirmCancelRequest(index)"
                >
                  <XCircleIcon size="16" class="btn-icon" />
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated Points Claimed Notification Popup with new design -->
    <div class="notification-popup" v-if="showNotification">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Points Claimed Successfully</h3>
          <button class="close-btn" @click="showNotification = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="success-icon-wrapper">
            <CheckIcon size="32" class="success-icon" />
          </div>
          <p>20 Sustainability Points have been added to your account. You can now redeem these points for vouchers and rewards!</p>
          
          <div class="centered-button">
            <!-- Removed CheckIcon from OK button -->
            <button class="view-cart-btn" @click="showNotification = false">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated View Details Popup for Pending Items with new design -->
    <div class="notification-popup" v-if="showPendingDetails">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Request Status</h3>
          <button class="close-btn" @click="showPendingDetails = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="info-icon-wrapper">
            <ClockIcon size="32" class="info-icon" />
          </div>
          <div>
            <p class="details-title">Your trade-in request is being processed</p>
            <p class="details-text">Our quality assessment team is currently reviewing your item. This process typically takes 2-3 business days. You'll receive an email notification once the assessment is complete.</p>
          </div>
          
          <div class="centered-button">
            <button class="view-cart-btn" @click="showPendingDetails = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated View Details Popup for Rejected Items with new design -->
    <div class="notification-popup" v-if="showRejectedDetails">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Request Status</h3>
          <button class="close-btn" @click="showRejectedDetails = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="rejected-icon-wrapper">
            <AlertTriangleIcon size="32" class="rejected-icon" />
          </div>
          <div>
            <p class="details-title">Your trade-in request was not accepted</p>
            <p class="details-text">Unfortunately, we couldn't accept your item for the following reason:</p>
            <p class="rejection-reason">The item shows significant wear and damage beyond what can be refurbished according to our sustainability standards.</p>
          </div>
          
          <div class="centered-button">
            <button class="view-cart-btn" @click="showRejectedDetails = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated View Details Popup for Accepted Items with new design -->
    <div class="notification-popup" v-if="showAcceptedDetails">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Request Status</h3>
          <button class="close-btn" @click="showAcceptedDetails = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="accepted-icon-wrapper">
            <CheckIcon size="32" class="accepted-icon" />
          </div>
          <div>
            <p class="details-title">Your trade-in request has been accepted!</p>
            <p class="details-text">Our team will collect your item for a face-to-face quality check.</p>
            <div class="collection-details">
              <p><strong>Collection Process:</strong></p>
              <ul>
                <li>Our team will contact you within 2 business days to schedule a pickup.</li>
                <li>Please ensure the item is ready for collection and matches the description provided.</li>
                <li>Our staff will verify the condition during the face-to-face quality check.</li>
                <li>Upon successful verification, your sustainability points will be available to claim.</li>
              </ul>
            </div>
          </div>
          
          <div class="centered-button">
            <button class="view-cart-btn" @click="showAcceptedDetails = false">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Updated Cancel Confirmation Popup with new design -->
    <div class="notification-popup" v-if="showCancelConfirmation">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Cancel Request</h3>
          <button class="close-btn" @click="showCancelConfirmation = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="warning-icon-wrapper">
            <AlertCircleIcon size="32" class="warning-icon" />
          </div>
          <div>
            <p class="details-title">Are you sure?</p>
            <p class="details-text">Do you really want to cancel this trade-in request? This action cannot be undone.</p>
          </div>
          
          <div class="centered-button">
            <button class="cancel-confirm-btn" @click="cancelRequest">Yes, Cancel Request</button>
            <button class="cancel-decline-btn" @click="showCancelConfirmation = false">No, Keep Request</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { 
  UserIcon, 
  HeartIcon, 
  ShoppingCartIcon, 
  UploadIcon, 
  XIcon, 
  PackageIcon,
  TrophyIcon,
  MailIcon,
  PhoneIcon,
  HomeIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
  AlertCircleIcon,
  SendIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  FileTextIcon,
  ClipboardListIcon,
  ImageIcon,
  EyeIcon,
  XCircleIcon,
  GiftIcon
} from 'lucide-vue-next';

// Active tab state
const activeTab = ref('submission');

// Form data
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  productName: '',
  category: '',
  description: '',
  condition: '',
  age: ''
});

// Image upload handling
const fileInput = ref(null);
const imagePreviewUrls = ref([]);
const uploadedFiles = ref([]);

// Notification states
const showNotification = ref(false);
const showPendingDetails = ref(false);
const showRejectedDetails = ref(false);
const showCancelConfirmation = ref(false);
const itemToCancel = ref(null);
const showAcceptedDetails = ref(false);

// Form validation
const phoneError = ref(false);
const ageError = ref(false);

// Total sustainability points - to be shared with Rewards.vue
const sustainabilityPoints = ref(0);

// Create a method to update points that can be called from this component
// and potentially exposed to other components
const updateSustainabilityPoints = (points) => {
  sustainabilityPoints.value += points;
  
  // Store points in localStorage to persist between page refreshes
  localStorage.setItem('sustainabilityPoints', sustainabilityPoints.value);
  
  // Emit an event that Rewards.vue can listen for
  // This requires setting up an event bus or using a state management solution
  emitPointsUpdated();
};

// Example of how to set up a simple event bus for Vue 3
// In a real application, you would define this in a separate file
const emitter = (() => {
  const events = {};
  
  const on = (event, callback) => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(callback);
  };
  
  const emit = (event, data) => {
    if (!events[event]) return;
    events[event].forEach(callback => callback(data));
  };
  
  return { on, emit };
})();

// Function to emit the points updated event
const emitPointsUpdated = () => {
  // Using our simple event bus
  emitter.emit('points-updated', sustainabilityPoints.value);
  
  // Alternative: If you're using Pinia or Vuex, you would dispatch an action here
  // Example with Pinia: useUserStore().updatePoints(sustainabilityPoints.value)
};

// Initialize points from localStorage if available
const initPoints = () => {
  const storedPoints = localStorage.getItem('sustainabilityPoints');
  if (storedPoints) {
    sustainabilityPoints.value = parseInt(storedPoints, 10);
  }
};

// Call initPoints when component is mounted
initPoints();

const validatePhoneNumber = () => {
  // Remove any non-numeric characters
  form.phone = form.phone.replace(/\D/g, '');
  
  // Check if the phone number is valid (8 digits)
  phoneError.value = form.phone.length > 0 && form.phone.length !== 8;
};

const validateAge = () => {
  // Convert to string first to handle the case when it's empty
  const ageStr = String(form.age);
  
  // Check if it's a valid whole number
  if (ageStr && (!/^\d+$/.test(ageStr) || parseFloat(ageStr) < 0)) {
    ageError.value = true;
    // Force to be a valid whole number
    form.age = ageStr.replace(/[^\d]/g, '');
  } else {
    ageError.value = false;
  }
};

const validateAgeKeypress = (event) => {
  // Only allow numbers (0-9)
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  for (let i = 0; i < files.length; i++) {
    if (imagePreviewUrls.value.length >= 5) break;
    
    const file = files[i];
    uploadedFiles.value.push(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrls.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = (index) => {
  imagePreviewUrls.value.splice(index, 1);
  uploadedFiles.value.splice(index, 1);
};

// Form submission
const submitTradeIn = () => {
  // Validate phone number before submission
  validatePhoneNumber();
  validateAge();
  
  if (phoneError.value || ageError.value) {
    alert('Please correct the errors in the form before submitting');
    return;
  }
  
  // Here you would typically send the form data and images to your backend
  console.log('Form submitted:', form);
  console.log('Uploaded files:', uploadedFiles.value);
  
  // Format category and condition for display
  const formatCategory = (category) => {
    if (!category) return '';
    
    // Handle special case for "furniture-home-decor"
    if (category === 'furniture-home-decor') return 'Furniture & Home Decor';
    
    // Split by hyphen, capitalize each word, and join with space
    return category.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formatCondition = (condition) => {
    if (!condition) return '';
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  };
  
  // For demo purposes, add the submission to the trade-ins list
  tradeIns.value.unshift({
    productName: form.productName,
    category: formatCategory(form.category),
    condition: formatCondition(form.condition),
    offeredValue: Math.floor(Math.random() * 200000) + 50000, // Random offered value for demo
    submittedDate: new Date(),
    status: 'Pending',
    image: imagePreviewUrls.value[0] || '/placeholder.svg?height=200&width=200'
  });
  
  // Reset form
  Object.keys(form).forEach(key => {
    form[key] = '';
  });
  imagePreviewUrls.value = [];
  uploadedFiles.value = [];
  
  // Switch to status tab to show the new submission
  activeTab.value = 'status';
};

// Claim reward points function
const claimRewardPoints = (item, index) => {
  // Update the item status to claimed
  tradeIns.value[index].status = 'Claimed';
  tradeIns.value[index].claimedDate = new Date();
  
  // Add 20 points to the user's sustainability points
  updateSustainabilityPoints(20);
  
  // Show notification
  showNotification.value = true;
};

// Modified to remove navigation - just close the popup
const navigateToCart = () => {
  showNotification.value = false;
};

// Update the viewDetails function to handle the "Claimed" status the same as "Accepted"
const viewDetails = (item) => {
  if (item.status === 'Pending') {
    showPendingDetails.value = true;
  } else if (item.status === 'Rejected') {
    showRejectedDetails.value = true;
  } else if (item.status === 'Accepted' || item.status === 'Claimed') {
    // Show the same details for both Accepted and Claimed items
    showAcceptedDetails.value = true;
  } else {
    console.log('View details for:', item);
    // Implement view details functionality for other statuses
  }
};

// Cancel request confirmation
const confirmCancelRequest = (index) => {
  itemToCancel.value = index;
  showCancelConfirmation.value = true;
};

// Cancel request function
const cancelRequest = () => {
  if (itemToCancel.value !== null) {
    tradeIns.value.splice(itemToCancel.value, 1);
    itemToCancel.value = null;
    showCancelConfirmation.value = false;
  }
};

// Sample trade-in data
const tradeIns = ref([
  {
    productName: 'Asgaard Sofa',
    category: 'Furniture & Home Decor',
    condition: 'Excellent',
    submittedDate: new Date(2025, 2, 15),
    status: 'Accepted',
    image: '/placeholder.svg?height=200&width=200'
  },
  {
    productName: 'Vintage Coffee Table',
    category: 'Furniture & Home Decor',
    condition: 'Good',
    submittedDate: new Date(2025, 2, 25),
    status: 'Pending',
    image: '/placeholder.svg?height=200&width=200'
  },
  {
    productName: 'Wooden Bookshelf',
    category: 'Furniture & Home Decor',
    condition: 'Fair',
    submittedDate: new Date(2025, 1, 10),
    status: 'Rejected',
    image: '/placeholder.svg?height=200&width=200'
  }
]);

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Accepted': return 'status-accepted';
    case 'Rejected': return 'status-rejected';
    case 'Pending': return 'status-pending';
    case 'Claimed': return 'status-claimed';
    default: return '';
  }
};

// Export the sustainability points and update method for use in other components
// This allows Rewards.vue to import and use these values
defineExpose({
  sustainabilityPoints,
  updateSustainabilityPoints,
  emitter // Export the event emitter for other components to listen to events
});
</script>

<style scoped>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: #242424;
  background-color: #ffffff;
  line-height: 1.5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Updated Hero Section with blurred background */
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

/* Content Styles */
.content-wrapper {
  padding: 50px 0;
  background-color: #ffffff;
}

/* Tabs - Enhanced with icons and better styling */
.tabs {
  display: flex;
  margin-bottom: 40px;
  border-bottom: 1px solid #f9f1e7;
  gap: 10px;
}

.tab-btn {
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 16px;
  font-weight: 600;
  color: #898989;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn.active {
  color: #5D3A1A;
  border-bottom-color: #5D3A1A;
  font-weight: 700;
}

.tab-btn:hover:not(.active) {
  color: #704116;
  background-color: rgba(93, 58, 26, 0.05);
}

.tab-icon {
  opacity: 0.8;
}

/* Form Styles - Enhanced with better spacing and transitions */
.submission-form {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(112, 65, 22, 0.08);
}

.brown-title {
  color: #5D3A1A !important;
}

.submission-form h3 {
  font-size: 28px;
  margin-bottom: 12px;
  font-weight: 700;
}

.submission-form p {
  color: #898989;
  margin-bottom: 30px;
  font-size: 16px;
}

.form-section {
  margin-bottom: 35px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f9f1e7;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h4 {
  font-size: 20px;
  margin-bottom: 25px;
  color: #5D3A1A;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.section-icon {
  color: #5D3A1A;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
}

.form-group {
  flex: 1;
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #242424;
  font-size: 15px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8B5A2B;
}

input, textarea, select {
  width: 100%;
  padding: 14px 15px 14px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

textarea {
  padding: 14px 15px;
  resize: vertical;
  min-height: 120px;
}

input:focus, textarea:focus, select:focus {
  border-color: #8B5A2B;
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
  background-color: #ffffff;
}

input::placeholder, textarea::placeholder {
  color: #bdbdbd;
}

.input-error {
  color: #c62828;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-icon {
  flex-shrink: 0;
}

.select-wrapper {
  position: relative;
}

select {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #fafafa;
  appearance: none;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8B5A2B;
  pointer-events: none;
}

.help-text {
  font-size: 15px;
  color: #898989;
  margin-bottom: 20px;
}

/* Image Upload - Enhanced with better hover effects */
.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.image-preview {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-preview:hover {
  transform: translateY(-5px);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-preview .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
}

.image-preview:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}

.image-preview .remove-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.upload-box {
  width: 140px;
  height: 140px;
  border: 2px dashed #bdbdbd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #898989;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.upload-box:hover {
  border-color: #8B5A2B;
  color: #704116;
  background-color: rgba(139, 90, 43, 0.05);
}

.upload-box span {
  margin-top: 8px;
  font-size: 14px;
}

.hidden-input {
  display: none;
}

.upload-hint {
  display: flex;
  align-items: center;
  color: #c62828;
  font-size: 14px;
  margin-top: 8px;
  background-color: rgba(198, 40, 40, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
}

.upload-hint span {
  margin-left: 6px;
}

/* Form Actions */
.form-actions {
  margin-top: 40px;
  text-align: right;
}

.submit-btn {
  padding: 14px 32px;
  background-color: #5D3A1A;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(93, 58, 26, 0.2);
}

.submit-btn:hover {
  background-color: #704116;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(93, 58, 26, 0.25);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
  box-shadow: none;
}

/* Status Section - Enhanced card design */
.status-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(112, 65, 22, 0.08);
}

.status-section h3 {
  font-size: 28px;
  margin-bottom: 30px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  color: #898989;
  padding: 60px 0;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.empty-state p {
  margin-top: 20px;
  font-size: 18px;
  margin-bottom: 24px;
}

.primary-btn {
  background-color: #5D3A1A;
  color: #ffffff;
}

.primary-btn:hover {
  background-color: #704116;
}

.action-btn {
  padding: 12px 20px;
  background-color: #f0f0f0;
  color: #242424;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

/* Trade-In List - Enhanced card design */
.trade-in-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.trade-in-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(112, 65, 22, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.trade-in-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(112, 65, 22, 0.12);
}

.card-header {
  background-color: #f9f1e7;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(112, 65, 22, 0.1);
}

.card-header h4 {
  font-size: 20px;
  color: #242424;
  font-weight: 600;
}

.status-badge {
  padding: 8px 12px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Updated status colors to be less jarring */
.status-accepted {
  background-color: #7cb342; /* Softer green */
}

.status-rejected {
  background-color: #e57373; /* Softer red */
}

.status-pending {
  background-color: #ffb74d; /* Softer orange */
}

.status-claimed {
  background-color: #ba68c8; /* Softer purple */
}

.card-content {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.product-image:hover img {
  transform: scale(1.1);
}

.product-details {
  flex: 1;
}

/* Update the detail-row styling to ensure consistent alignment */
.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  margin-bottom: 10px;
  font-size: 15px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
  align-items: center;
}

.detail-row .label {
  font-weight: 500;
  color: #704116;
  text-align: left;
}

.detail-row .value {
  text-align: right;
  justify-self: end;
}

/* Update the points-badge to maintain alignment */
.points-badge {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: end;
}

.claimed-row {
  color: #9c27b0;
  font-weight: 500;
}

.card-actions {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f9f1e7;
}

.action-btn.accept-btn {
  background-color: #e8d5b5; /* Changed to beige */
  color: #5D3A1A;
}

.action-btn.accept-btn:hover {
  background-color: #d9c6a6; /* Darker beige on hover */
}

.action-btn.cancel-btn {
  background-color: #e8d5b5; /* Changed to beige */
  color: #5D3A1A;
}

.action-btn.cancel-btn:hover {
  background-color: #d9c6a6; /* Darker beige on hover */
}

.btn-icon {
  flex-shrink: 0;
}

/* Notification Popup Styles - Updated with new design */
.notification-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.notification-content {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
  animation: slideUp 0.4s ease;
  overflow: hidden;
}

/* New popup style with beige header */
.notification-content.new-style {
  border-radius: 16px;
  overflow: hidden;
}

.notification-content.new-style .notification-header {
  background-color: #f8f0e3; /* Beige color for header */
  padding: 20px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-content.new-style .notification-header h3 {
  font-size: 22px;
  color: #5D3A1A; /* Brown text for contrast */
  font-weight: 600;
}

.notification-content.new-style .close-btn {
  color: #5D3A1A;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content.new-style .close-btn:hover {
  opacity: 0.7;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notification-body {
  padding: 30px;
  text-align: center;
}

.success-icon-wrapper, .info-icon-wrapper, .rejected-icon-wrapper, .accepted-icon-wrapper, .warning-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon-wrapper {
  background-color: rgba(76, 175, 80, 0.1);
}

.success-icon {
  color: #4caf50;
}

.info-icon-wrapper {
  background-color: rgba(255, 152, 0, 0.1);
}

.info-icon {
  color: #ff9800;
}

.rejected-icon-wrapper {
  background-color: rgba(244, 67, 54, 0.1);
}

.rejected-icon {
  color: #f44336;
}

.accepted-icon-wrapper {
  background-color: rgba(76, 175, 80, 0.1);
}

.accepted-icon {
  color: #4caf50;
}

.warning-icon-wrapper {
  background-color: rgba(255, 152, 0, 0.1);
}

.warning-icon {
  color: #ff9800;
}

.notification-body p {
  font-size: 16px;
  color: #242424;
  margin-bottom: 15px;
  line-height: 1.6;
}

.details-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #242424;
}

.details-text {
  color: #898989;
  margin-bottom: 20px;
  line-height: 1.6;
}

.rejection-reason {
  color: #c62828;
  font-weight: 500;
  background-color: rgba(198, 40, 40, 0.05);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.collection-details {
  margin-top: 24px;
  text-align: left;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 10px;
}

.collection-details p {
  margin-bottom: 10px;
}

.collection-details ul {
  list-style: disc;
  padding-left: 25px;
}

.collection-details li {
  margin-bottom: 8px;
  color: #898989;
}

/* Center button in popup */
.centered-button {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.view-cart-btn {
  padding: 14px 32px;
  background-color: #5D3A1A;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(93, 58, 26, 0.2);
}

.view-cart-btn:hover {
  background-color: #704116;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(93, 58, 26, 0.25);
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.cancel-confirm-btn {
  padding: 12px 24px;
  background-color: #5D3A1A; /* Changed to brown */
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(93, 58, 26, 0.2);
}

.cancel-confirm-btn:hover {
  background-color: #704116; /* Darker brown on hover */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(93, 58, 26, 0.25);
}

.cancel-decline-btn {
  padding: 12px 24px;
  background-color: #e0e0e0;
  color: #242424;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-decline-btn:hover {
  background-color: #bdbdbd;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-banner {
    padding: 80px 0 40px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .trade-in-list {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

.action-btn.beige-box {
  background-color: #e8d5b5 !important; /* Beige color */
  color: #5D3A1A !important; /* Darker text for contrast */
}

.action-btn.beige-box:hover {
  background-color: #d9c6a6 !important; /* Darker beige on hover */
}

.beige-box {
  background-color: #e8d5b5 !important; /* Beige color */
  color: #5D3A1A !important; /* Darker text for contrast */
}
</style>