<template>
  <div class="trade-in-page">
    <!-- Hero section with blurred background -->
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
            @click="loadTradeInHistory(); activeTab = 'status';"
          >
            <ClipboardListIcon size="18" class="tab-icon" />
            Trade-In Status
          </button>
        </div>

        <!--!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
        
        <!--!-- Error State -->
        <div v-else-if="error" class="error-container">
          <alert-circle-icon size="48" class="error-icon" />
          <h3>Error Loading Data</h3>
          <p>{{ error }}</p>
          <button @click="loadTradeInHistory" class="retry-button">Retry</button>
        </div>

        <!-- Submission Form - Enhanced styling -->
        <div v-else-if="activeTab === 'submission'" class="submission-form">
          <h3 class="brown-title">Submit Your Item for Trade-In</h3>
          <p>Fill in the details below and upload clear photos of your item for quality assessment.</p>
          
          <form @submit.prevent="submitTradeIn">
            <!-- Form content remains the same -->
            <!-- Personal Information section -->
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

            <!-- Product Information section -->
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
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                    <ChevronDownIcon size="18" class="select-icon" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Images section -->
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
              <button type="submit" class="submit-btn" :disabled="imagePreviewUrls.length < 1 || isSubmitting">
                <SendIcon size="18" />
                {{ isSubmitting ? 'Submitting...' : 'Submit Trade-In Request' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Status Section - Enhanced card design -->
        <div v-else-if="activeTab === 'status' && !isLoading && !error" class="status-section">
          <h3 class="brown-title">Your Trade-In History</h3>
          
          <div v-if="tradeIns.length === 0" class="empty-state">
            <PackageIcon size="48" />
            <p>You don't have any trade-in requests yet.</p>
            <button class="action-btn primary-btn" @click="activeTab = 'submission'">Submit Your First Trade-In</button>
          </div>
          
          <div v-else class="trade-in-list">
            <div v-for="(item, index) in tradeIns" :key="item.id" class="trade-in-card">
              <div class="card-header">
                <h4>{{ item.product_name }}</h4>
                <div class="status-badge" :class="getStatusClass(item.status)">
                  <span v-if="item.status?.toLowerCase().includes('pend')" class="status-icon"><ClockIcon size="14" /></span>
                  <span v-else-if="item.status?.toLowerCase().includes('accept')" class="status-icon"><CheckIcon size="14" /></span>
                  <span v-else-if="item.status?.toLowerCase().includes('reject')" class="status-icon"><XIcon size="14" /></span>
                  <span v-else-if="item.status?.toLowerCase().includes('claim')" class="status-icon"><TrophyIcon size="14" /></span>
                  {{ item.status }}
                </div>
              </div>
              
              <div class="card-content">
                <div class="product-image">
                  <img :src="item.image_url" alt="Product image">
                </div>
                <div class="product-details">
                  <div class="detail-row">
                    <span class="label">Submitted:</span>
                    <span class="value">{{ formatDate(item.created_at) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Condition:</span>
                    <span class="value">{{ item.condition }}</span>
                  </div>
    
                  <div v-if="item.status === 'Accepted' || item.status === 'accepted'" class="detail-row points-row">
                    <span class="label">Reward:</span>
                    <span class="points-badge beige-box value">
                      <TrophyIcon size="16" />
                      20 Points
                    </span>
                  </div>
                  <div v-if="item.status === 'Claimed'" class="detail-row claimed-row">
                    <span class="label">Claimed:</span>
                    <span class="value">{{ formatDate(item.claimed_at || item.created_at) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn" @click="viewDetails(item)">
                  <EyeIcon size="16" class="btn-icon" />
                  View Details
                </button>
                
                <button 
                  v-if="item.status === 'Accepted' || item.status === 'accepted'"
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
            <p class="rejection-reason">{{ selectedItem ? selectedItem.rejection_reason || 'The item shows significant wear and damage beyond what can be refurbished according to our sustainability standards.' : 'The item shows significant wear and damage beyond what can be refurbished according to our sustainability standards.' }}</p>
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
            <div class="collection-details">
              <p><strong>Collection Process:</strong></p>
              <ul>
                <li>Our team will contact you within 2 business days to schedule a pickup.</li>
                <li>Please ensure the item is ready for collection and matches the description provided.</li>
              </ul>
            </div>
          </div>
          
          <div class="centered-button">
            <button class="view-cart-btn" @click="showAcceptedDetails = false">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <!-- New View Details Popup for Claimed Items -->
    <div class="notification-popup" v-if="showClaimedDetails">
      <div class="notification-content new-style">
        <div class="notification-header">
          <h3>Request Status</h3>
          <button class="close-btn" @click="showClaimedDetails = false">
            <XIcon size="20" />
          </button>
        </div>
        <div class="notification-body">
          <div class="success-icon-wrapper">
            <TrophyIcon size="32" class="success-icon" />
          </div>
          <div>
            <p class="details-title">Your reward points have been claimed!</p>
            <p class="details-text">Thank you for participating in our sustainability program. Your trade-in has been completed and the points have been added to your account.</p>
            <div class="points-summary">
              <div class="points-detail">
                <span>Points Earned:</span>
                <span class="points-value">20 Points</span>
              </div>
              <div class="points-detail">
                <span>Claimed Date:</span>
                <span class="date-value">{{ selectedItem ? formatDate(selectedItem.claimed_at || selectedItem.created_at) : formatDate(new Date()) }}</span>
              </div>
            </div>
          </div>
          
          <div class="centered-button">
            <button class="view-cart-btn" @click="showClaimedDetails = false">Close</button>
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
            <button class="cancel-confirm-btn" @click="showCancelConfirmation = false">Yes, Cancel Request</button>
            <button class="cancel-decline-btn" @click="showCancelConfirmation = false">No, Keep Request</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  UserIcon, 
  HeartIcon, 
  ShoppingCart as ShoppingCartIcon, 
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

// User ID - In a real app, this would come from authentication
const userId = ref(200);

// Active tab state
const activeTab = ref('submission');

// Loading and error states
const isLoading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);

// Form data with autofilled personal information
const form = reactive({
  fullName: 'Venice Hoe',
  email: 'venicee04@gmail.com',
  phone: '94843940',
  address: 'Toh Guan Rd Blk 394 #05-12',
  productName: 'Shirt',
  description: 'Pantagonia Shirt',
  condition: 'Good'
});

// Image upload handling
const fileInput = ref(null);
const imagePreviewUrls = ref([]);
const uploadedFiles = ref([]);

// Notification states
const showNotification = ref(false);
const showPendingDetails = ref(false);
const showRejectedDetails = ref(false);
const showAcceptedDetails = ref(false);
const showClaimedDetails = ref(false);
const showCancelConfirmation = ref(false);
const itemToCancel = ref(null);
const selectedItem = ref(null);

// Form validation
const phoneError = ref(false);

// Trade-in history data
const tradeIns = ref([]);

const validatePhoneNumber = () => {
  // Remove any non-numeric characters
  form.phone = form.phone.replace(/\D/g, '');
  
  // Check if the phone number is valid (8 digits)
  phoneError.value = form.phone.length > 0 && form.phone.length !== 8
}

const triggerFileInput = () => {
  fileInput.value.click()
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
  imagePreviewUrls.value.splice(index, 1)
  uploadedFiles.value.splice(index, 1)
}

// Function to load trade-in history
const loadTradeInHistory = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Call the API to get trade-in history
    const response = await fetch(`http://localhost:5400/trade-in/${userId.value}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load trade-in history: ${response.status}`);
    }
    
    const data = await response.json();
    tradeIns.value = data;
    console.log('Trade-in history loaded:', tradeIns.value);
  } catch (err) {
    error.value = err.message || 'Failed to load trade-in history';
    console.error('Error loading trade-in history:', err);
  } finally {
    isLoading.value = false;
  }
};

// Form submission
const submitTradeIn = async () => {
  // Validate phone number before submission
  validatePhoneNumber();
  
  if (phoneError.value) {
    alert('Please correct the errors in the form before submitting');
    return;
  }
  
  if (imagePreviewUrls.value.length < 1) {
    alert('Please upload at least one image of your item');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const formData = new FormData()

    // Add form fields required by the microservice
    formData.append("user_id", userId.value)
    formData.append("product_name", form.productName)
    formData.append("condition", form.condition)  // Add this line to include the condition

    // Add the first image (the microservice only accepts one image)
    if (uploadedFiles.value.length > 0) {
      formData.append("image", uploadedFiles.value[0])
    }
    
    // Submit the form data to the trade-in microservice
    const response = await fetch("http://localhost:5400/trade-in/request", {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Failed to submit trade-in request: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Trade-in submitted successfully:', data);
    
    // Reset form
    Object.keys(form).forEach((key) => {
      if (key !== 'fullName' && key !== 'email' && key !== 'phone' && key !== 'address') {
        form[key] = "";
      }
    });
    imagePreviewUrls.value = []
    uploadedFiles.value = []
    
    // Show success message
    alert("Trade-in request submitted successfully!")
    
    // Switch to status tab and load all trade-in history
    activeTab.value = 'status';
    await loadTradeInHistory(); // Load all trade-in requests from the database
    
  } catch (error) {
    console.error('Error submitting trade-in:', error);
    alert(`Failed to submit trade-in request: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const claimRewardPoints = async (item, index) => {
  try {
    // Call the API to claim reward points
    const response = await fetch(`http://localhost:5402/wallet/credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        points: 20,
        source: 'trade-in',
        trade_in_id: item.id
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to claim reward points: ${response.status}`);
    }
    
    // Get the response data to get the updated total points
    const walletData = await response.json();
    console.log('Wallet updated successfully:', walletData);
    
    // Update the leaderboard with the total points
    const leaderboardResponse = await fetch(`http://localhost:5404/leaderboard/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        total_points: walletData.total_points || walletData.balance
      })
    });
    
    if (!leaderboardResponse.ok) {
      console.error('Failed to update leaderboard, but points were credited');
    } else {
      console.log('Leaderboard updated successfully');
    }
    
    // Update the trade-in status
    try {
      const updateResponse = await fetch(`http://localhost:5400/trade-in/status/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trade_in_id: item.id,
          status: 'Claimed'
        })
      });
      
      if (!updateResponse.ok) {
        console.warn(`Failed to update trade-in status in backend, but points were credited: ${updateResponse.status}`);
      }
    } catch (statusError) {
      console.warn('Error updating trade-in status, but points were credited:', statusError);
    }
    
    // Update the local state to reflect the claimed status
    tradeIns.value[index].status = "Claimed";
    tradeIns.value[index].claimed_at = new Date().toISOString();
    console.log('Updated trade-in status in UI:', tradeIns.value[index]);
    
    // Show notification
    showNotification.value = true;
    
  } catch (error) {
    console.error('Error claiming reward points:', error);
    alert(`Failed to claim reward points: ${error.message}`);
  }
};

// Enhanced viewDetails function to handle all statuses and store the selected item
const viewDetails = (item) => {
  selectedItem.value = item;
  
  // Reset all popup states first
  showPendingDetails.value = false;
  showRejectedDetails.value = false;
  showAcceptedDetails.value = false;
  showClaimedDetails.value = false;
  
  // Show the appropriate popup based on status
  const status = item.status?.toLowerCase() || '';
  
  if (status.includes('pend')) {
    showPendingDetails.value = true;
  } else if (status.includes('reject')) {
    showRejectedDetails.value = true;
  } else if (status.includes('accept')) {
    showAcceptedDetails.value = true;
  } else if (status.includes('claim')) {
    showClaimedDetails.value = true;
  }
}

const confirmCancelRequest = (index) => {
  itemToCancel.value = index;
  showCancelConfirmation.value = true;
};

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status) => {
  // Convert to lowercase for case-insensitive comparison
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('accept')) return 'status-accepted';
  if (statusLower.includes('reject')) return 'status-rejected';
  if (statusLower.includes('pend')) return 'status-pending';
  if (statusLower.includes('claim')) return 'status-claimed';
  return '';
};

// Initialize component
onMounted(() => {
  // Load trade-in history if the status tab is active
  if (activeTab.value === 'status') {
    loadTradeInHistory();
  }
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

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #704116;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #d32f2f;
}

.error-icon {
  color: #d32f2f;
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #704116;
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #5a3412;
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
  font-family: 'Inter', sans-serif;
  font-weight: normal;
  transition: all 0.3s ease;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

textarea {
  padding: 14px 15px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;
  font-weight: normal;
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

/* Fixed status badge styles */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-icon {
  margin-right: 6px;
  display: flex;
  align-items: center;
}

/* Status-specific colors with !important to override any other styles */
.status-badge.status-pending {
  background: #fff !important;
  border: 2px solid #ff9800 !important;
  color: #ff9800 !important;
}

.status-badge.status-accepted {
  background: #fff !important;
  border: 2px solid #4caf50 !important;
  color: #4caf50 !important;
}

.status-badge.status-rejected {
  background: #fff !important;
  border: 2px solid #f44336 !important;
  color: #f44336 !important;
}

.status-badge.status-claimed {
  background: #fff !important;
  border: 2px solid #9c27b0 !important;
  color: #9c27b0 !important;
}

/* Status icon colors */
.status-badge.status-pending .status-icon {
  color: #ff9800 !important;
}

.status-badge.status-accepted .status-icon {
  color: #4caf50 !important;
}

.status-badge.status-rejected .status-icon {
  color: #f44336 !important;
}

.status-badge.status-claimed .status-icon {
  color: #9c27b0 !important;
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
  /* justify-self: end; */
}

.points-row{
  margin-top: 8px;
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

/* New styles for the claimed status popup */
.points-summary {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
}

.points-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e0e0e0;
}

.points-detail:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.points-value {
  font-weight: 600;
  color: #5D3A1A;
  display: flex;
  align-items: center;
}

.date-value {
  font-weight: 500;
}
</style>