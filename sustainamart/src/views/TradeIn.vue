<template>
  <div class="trade-in-page">
    \
    <!-- Hero Banner - Reverted to original light color -->
    <div class="hero-banner" style="background-image: url('/marketplace/headerbackground.png?height=300&width=1200')">
      <div class="container">
        <h2 class="hero-title" style="color: #5D3A1A;">Trade-In Service</h2>
        <div class="breadcrumb" style="color: #5D3A1A;">
          <span>Home</span>
          <span class="separator">›</span>
          <span class="current">Trade-In Service</span>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="content-wrapper">
        <!-- Tabs for Form and Status -->
        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'submission' }" 
            @click="activeTab = 'submission'"
          >
            Submit New Trade-In
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'status' }" 
            @click="activeTab = 'status'"
          >
            Trade-In Status
          </button>
        </div>

        <!-- Submission Form -->
        <div v-if="activeTab === 'submission'" class="submission-form">
          <h3>Submit Your Item for Trade-In</h3>
          <p>Fill in the details below and upload clear photos of your item for quality assessment.</p>
          
          <form @submit.prevent="submitTradeIn">
            <div class="form-section">
              <h4>Personal Information</h4>
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
              <h4>Product Information</h4>
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
                    Please enter a valid whole number for product age
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Product Images</h4>
              <p class="help-text">Upload a clear photo of your item.</p>
              
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
                <span>Please upload an image for a complete assessment</span>
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

        <!-- Status Section -->
        <div v-if="activeTab === 'status'" class="status-section">
          <h3>Your Trade-In History</h3>
          
          <div v-if="tradeIns.length === 0" class="empty-state">
            <PackageIcon size="48" />
            <p>You don't have any trade-in requests yet.</p>
            <button class="action-btn" @click="activeTab = 'submission'">Submit Your First Trade-In</button>
          </div>
          
          <div v-else class="trade-in-list">
            <div v-for="(item, index) in tradeIns" :key="index" class="trade-in-card">
              <div class="card-header">
                <h4>{{ item.productName }}</h4>
                <div class="status-badge" :class="getStatusClass(item.status)">
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
                    <span>{{ formatDate(item.submittedDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Category:</span>
                    <span>{{ item.category }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Condition:</span>
                    <span>{{ item.condition }}</span>
                  </div>
                  <div v-if="item.status === 'Accepted' || item.status === 'Claimed'" class="detail-row points-row">
                    <span class="label">Reward:</span>
                    <span class="points-badge">
                      <TrophyIcon size="16" />
                      20 Sustainability Points
                    </span>
                  </div>
                  <!-- Removed the Offered Value row for Asgaard Sofa -->
                  <div v-if="item.status === 'Accepted' && item.productName !== 'Asgaard Sofa' && item.offeredValue" class="detail-row">
                    <span class="label">Offered Value:</span>
                    <span>Rs. {{ item.offeredValue.toLocaleString() }}</span>
                  </div>
                  <div v-if="item.status === 'Claimed'" class="detail-row claimed-row">
                    <span class="label">Claimed:</span>
                    <span>{{ formatDate(item.claimedDate) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn" @click="viewDetails(item)">View Details</button>
                <button 
                  v-if="item.status === 'Accepted'" 
                  class="action-btn accept-btn"
                  @click="claimRewardPoints(item, index)"
                >
                  <TrophyIcon size="16" class="btn-icon" />
                  Claim Reward Points
                </button>
                <button 
                  v-if="item.status === 'Pending'" 
                  class="action-btn cancel-btn"
                  @click="confirmCancelRequest(index)"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Points Claimed Notification Popup - Updated with new wording -->
    <div class="notification-popup" v-if="showNotification">
      <div class="notification-content">
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
        </div>
        <button class="view-cart-btn" @click="viewPoints">Redeem Voucher</button>
      </div>
    </div>

    <!-- View Details Popup for Pending Items -->
    <div class="notification-popup" v-if="showPendingDetails">
      <div class="notification-content">
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
        </div>
        <button class="view-cart-btn" @click="showPendingDetails = false">Close</button>
      </div>
    </div>

    <!-- View Details Popup for Rejected Items -->
    <div class="notification-popup" v-if="showRejectedDetails">
      <div class="notification-content">
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
        </div>
        <button class="view-cart-btn" @click="showRejectedDetails = false">Close</button>
      </div>
    </div>

    <!-- View Details Popup for Accepted Items -->
    <div class="notification-popup" v-if="showAcceptedDetails">
      <div class="notification-content">
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
        </div>
        <button class="view-cart-btn" @click="showAcceptedDetails = false">Confirm</button>
      </div>
    </div>

    <!-- Cancel Confirmation Popup -->
    <div class="notification-popup" v-if="showCancelConfirmation">
      <div class="notification-content">
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
        </div>
        <div class="confirmation-actions">
          <button class="cancel-confirm-btn" @click="cancelRequest">Yes, Cancel Request</button>
          <button class="cancel-decline-btn" @click="showCancelConfirmation = false">No, Keep Request</button>
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
  CalendarIcon,
  AlertCircleIcon,
  SendIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon
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
  
  // Show notification
  showNotification.value = true;
  
  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 5000);
};

// View points function - Updated to navigate to Sustainability Challenges & Rewards page
const viewPoints = () => {
  showNotification.value = false;
  // Here you would typically navigate to the Sustainability Challenges & Rewards page
  console.log('Navigate to Sustainability Challenges & Rewards page');
  alert('Redirecting to Sustainability Challenges & Rewards page where you can redeem your points for vouchers.');
  // For demo purposes, we'll just close the notification and show an alert
};

// Update the viewDetails function to handle the "Accepted" status
const viewDetails = (item) => {
  if (item.status === 'Pending') {
    showPendingDetails.value = true;
  } else if (item.status === 'Rejected') {
    showRejectedDetails.value = true;
  } else if (item.status === 'Accepted') {
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
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.header {
  background-color: #ffffff;
  padding: 20px 0;
  border-bottom: 1px solid #f9f1e7;
  box-shadow: 0 2px 10px rgba(112, 65, 22, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: #704116;
  font-size: 24px;
  font-weight: 700;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
}

.main-nav a {
  text-decoration: none;
  color: #242424;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover, .main-nav a.active {
  color: #704116;
  font-weight: 600;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #242424;
}

/* Hero Banner - Reverted to original light color */
.hero-banner {
  background-color: #faf3ea;
  background-size: cover;
  background-position: center;
  padding: 80px 0 40px;
  position: relative;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
}

.hero-title {
  color: #242424;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  text-align: center;
}

.breadcrumb {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #242424;
  position: relative;
  z-index: 1;
}

.breadcrumb .separator {
  margin: 0 10px;
}

.breadcrumb .current {
  font-weight: 600;
}

/* Content Styles */
.content-wrapper {
  padding: 40px 0;
  background-color: #ffffff;
}

/* Tabs */
.tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #f9f1e7;
}

.tab-btn {
  padding: 15px 30px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 16px;
  font-weight: 600;
  color: #898989;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #704116;
  border-bottom-color: #704116;
  font-weight: 700;
}

/* Form Styles - Enhanced */
.submission-form {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 6px 24px rgba(112, 65, 22, 0.08);
}

.submission-form h3 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #242424;
}

.submission-form p {
  color: #898989;
  margin-bottom: 30px;
  font-size: 16px;
}

.form-section {
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f9f1e7;
}

.form-section h4 {
  font-size: 20px;
  margin-bottom: 25px;
  color: #704116;
  border-left: 4px solid #8B5A2B;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
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

input, textarea {
  width: 100%;
  padding: 14px 15px 14px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background-color: #fafafa;
}

textarea {
  padding: 14px 15px;
  resize: vertical;
}

input:focus, textarea:focus {
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
  margin-top: 6px;
}

.select-wrapper {
  position: relative;
}

select {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background-color: #fafafa;
  appearance: none;
  cursor: pointer;
}

select:focus {
  border-color: #8B5A2B;
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
  background-color: #ffffff;
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

/* Image Upload - Enhanced */
.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.image-preview {
  width: 140px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-preview .remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.image-preview .remove-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.upload-box {
  width: 140px;
  height: 140px;
  border: 2px dashed #bdbdbd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #898989;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-box:hover {
  border-color: #8B5A2B;
  color: #704116;
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
  background-color: #704116;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  background-color: #8B5A2B;
}

.submit-btn:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}

/* Status Section */
.status-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 6px 24px rgba(112, 65, 22, 0.08);
}

.status-section h3 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #242424;
}

.empty-state {
  text-align: center;
  color: #898989;
  padding: 50px 0;
}

.empty-state p {
  margin-top: 20px;
  font-size: 18px;
}

.action-btn {
  padding: 12px 24px;
  background-color: #f0f0f0;
  color: #242424;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 30px;
}

.action-btn:hover {
  background-color: #e0e0e0;
}

/* Trade-In List */
.trade-in-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.trade-in-card {
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(112, 65, 22, 0.06);
  overflow: hidden;
  transition: transform 0.3s;
}

.trade-in-card:hover {
  transform: translateY(-5px);
}

.card-header {
  background-color: #f9f1e7;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  font-size: 20px;
  color: #242424;
}

.status-badge {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.status-accepted {
  background-color: #4caf50;
}

.status-rejected {
  background-color: #f44336;
}

.status-pending {
  background-color: #ff9800;
}

.status-claimed {
  background-color: #9c27b0;
}

.card-content {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-details {
  flex: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
}

.detail-row .label {
  font-weight: 500;
  color: #704116;
}

.points-row {
  align-items: center;
}

.points-badge {
  background-color: #ffc107;
  color: #242424;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.claimed-row {
  color: #9c27b0;
}

.card-actions {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #f9f1e7;
}

.action-btn.accept-btn {
  background-color: #4caf50;
  color: #fff;
}

.action-btn.accept-btn:hover {
  background-color: #43a047;
}

.action-btn.cancel-btn {
  background-color: #f44336;
  color: #fff;
}

.action-btn.cancel-btn:hover {
  background-color: #d32f2f;
}

.btn-icon {
  margin-right: 6px;
}

/* Notification Popup Styles */
.notification-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.notification-content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
}

.notification-header {
  padding: 20px;
  border-bottom: 1px solid #f9f1e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  font-size: 22px;
  color: #242424;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #898989;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #242424;
}

.notification-body {
  padding: 30px;
  text-align: center;
}

.success-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-icon {
  color: #4caf50;
}

.info-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 152, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.info-icon {
  color: #ff9800;
}

.rejected-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(244, 67, 54, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.rejected-icon {
  color: #f44336;
}

.accepted-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.accepted-icon {
  color: #4caf50;
}

.notification-body p {
  font-size: 16px;
  color: #242424;
  margin-bottom: 15px;
}

.details-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.details-text {
  color: #898989;
  margin-bottom: 20px;
}

.rejection-reason {
  color: #c62828;
  font-weight: 500;
}

.collection-details {
  margin-top: 20px;
  text-align: left;
}

.collection-details p {
  margin-bottom: 10px;
}

.collection-details ul {
  list-style: disc;
  padding-left: 25px;
}

.collection-details li {
  margin-bottom: 5px;
  color: #898989;
}

.view-cart-btn {
  padding: 14px 32px;
  background-color: #704116;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-cart-btn:hover {
  background-color: #8B5A2B;
}

.confirmation-actions {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #f9f1e7;
}

.cancel-confirm-btn {
  padding: 12px 24px;
  background-color: #f44336;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 10px;
}

.cancel-confirm-btn:hover {
  background-color: #d32f2f;
}

.cancel-decline-btn {
  padding: 12px 24px;
  background-color: #e0e0e0;
  color: #242424;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-decline-btn:hover {
  background-color: #bdbdbd;
}
</style>

