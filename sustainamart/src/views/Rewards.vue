<template>
  <div class="app-container">
    <!-- Updated hero section with blurred background -->
    <div class="hero-section">
      <div class="hero-blur-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Sustainability Challenges & Rewards</h1>
        <div class="breadcrumb">
          <a href="/" class="breadcrumb-link">Home</a>
          <chevron-right-icon class="breadcrumb-icon" />
          <span class="breadcrumb-current">Sustainability Challenges & Rewards</span>
        </div>
      </div>
    </div>

    <main class="main-content container">
      <div class="two-column-grid">
        <div class="column">
          <div class="card">
            <h2 class="points-title">
              You have <span class="points-highlight">{{ userPoints }}</span> Points! 
              <span class="points-history">Point history</span>
            </h2>
            
            <div class="section-header">
              <h3 class="section-title">Current Missions ({{ currentMissions.length }})</h3>
              <button class="history-button">History</button>
            </div>
            
            <div v-if="currentMissions.length > 0" class="missions-list">
              <div v-for="mission in currentMissions" :key="mission.id" class="mission-card">
                <div class="mission-header">
                  <span class="points-badge">+{{ mission.points }} points</span>
                  <span class="mission-progress-text">{{ mission.current }} of {{ mission.total }}</span>
                </div>
                <h4 class="mission-title">{{ mission.title }}</h4>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${(mission.current / mission.total) * 100}%` }"></div>
                </div>
                <p class="mission-date">{{ mission.inProgress ? 'In progress' : `Completed before ${mission.completionDate}` }}</p>
                <button 
                  v-if="mission.inProgress" 
                  @click="completeMission(mission)" 
                  class="complete-button"
                >
                  Complete Mission
                </button>
              </div>
            </div>
            <div v-else class="empty-missions">
              <p>No current missions. Join a mission to get started!</p>
            </div>
          </div>
          
          <div class="card">
            <h3 class="section-title">Earn Points</h3>
            
            <div class="earn-points-grid">
              <div v-for="mission in availableMissions" :key="mission.id" class="earn-points-card">
                <span class="points-badge">Get +{{ mission.points }} points</span>
                <h4 class="earn-points-title">{{ mission.title }}</h4>
                <button @click="joinMission(mission)" class="join-button">Join Mission</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column">
          <div class="card">
            <h3 class="section-title">Leaderboard</h3>
            
            <div class="leaderboard-list">
              <div 
                v-for="(user, index) in leaderboard" 
                :key="user.id"
                class="leaderboard-item"
                :class="{ 'current-user': user.isCurrentUser, 'top-three': index < 3 }"
              >
                <div class="leaderboard-rank" :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }">
                  {{ index + 1 }}
                </div>
                <div class="leaderboard-user">
                  <div class="user-name">{{ user.username }} {{ user.isCurrentUser ? '(You)' : '' }}</div>
                </div>
                <div class="user-score" :class="{ 'points-updated': user.isCurrentUser && pointsUpdated }">{{ user.points }}</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="section-title">Redeem Points</h3>
            
            <div v-if="userPoints >= 500" class="redeem-points-grid">
              <div v-for="voucher in vouchers" :key="voucher.id" class="redeem-card">
                <div class="voucher-amount">{{ voucher.amount }}</div>
                <div class="redeem-content">
                  <h4 class="redeem-title">{{ voucher.title }}</h4>
                  <p class="redeem-points">{{ voucher.points.toLocaleString() }} Points</p>
                  <button 
                    @click="redeemVoucher(voucher)" 
                    class="redeem-button" 
                    :disabled="userPoints < voucher.points"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="insufficient-points">
              <alert-circle-icon class="insufficient-icon" />
              <p>You need at least 500 points to redeem vouchers.</p>
              <p>Complete missions to earn more points!</p>
            </div>
            
            <div v-if="userVouchers.length > 0" class="user-vouchers">
              <h4 class="vouchers-title">Your Vouchers</h4>
              <div class="user-vouchers-list">
                <div v-for="voucher in userVouchers" :key="voucher.id" class="user-voucher-card">
                  <div class="voucher-amount">{{ voucher.amount }}</div>
                  <div class="voucher-details">
                    <h5 class="voucher-title">{{ voucher.title }}</h5>
                    <p class="voucher-expiry">Expires: {{ voucher.expiryDate }}</p>
                  </div>
                  <button @click="useVoucher(voucher)" class="use-voucher-button">Use</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="features-section">
        <div class="feature">
          <div class="feature-icon">
            <trophy-icon />
          </div>
          <h3 class="feature-title">High Quality</h3>
          <p class="feature-description">crafted from top materials</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">
            <shield-check-icon />
          </div>
          <h3 class="feature-title">Warranty Protection</h3>
          <p class="feature-description">Over 2 years</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">
            <truck-icon />
          </div>
          <h3 class="feature-title">Free Shipping</h3>
          <p class="feature-description">Order over 150 $</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">
            <headphones-icon />
          </div>
          <h3 class="feature-title">24 / 7 Support</h3>
          <p class="feature-description">Dedicated support</p>
        </div>
      </div>
    </main>
    
    <!-- Toast notification for points -->
    <div v-if="showPointsToast" class="points-toast" :class="{ 'show': showPointsToast }">
      <div class="toast-content">
        <plus-icon class="toast-icon" />
        <span>{{ lastPointsAwarded }} points added!</span>
      </div>
    </div>

    <!-- Success/Failure Popup -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-container">
        <div class="popup-header">
          <h3 class="popup-title">{{ popupData.title }}</h3>
          <button @click="closePopup" class="close-popup">
            <x-icon />
          </button>
        </div>
        <div class="popup-content">
          <div class="popup-icon" :class="{ 'success': popupData.success, 'failure': !popupData.success }">
            <check-icon v-if="popupData.success" />
            <x-circle-icon v-else />
          </div>
          <p class="popup-message">{{ popupData.message }}</p>
        </div>
        <div class="popup-actions">
          <button @click="closePopup" class="popup-button">{{ popupData.buttonText }}</button>
        </div>
      </div>
    </div>

    <!-- Voucher Applied Notification -->
    <div v-if="showVoucherApplied" class="voucher-applied" :class="{ 'show': showVoucherApplied }">
      <div class="voucher-applied-content">
        <check-circle-icon class="voucher-applied-icon" />
        <span>Voucher applied to your cart!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { 
  User as UserIcon, 
  Search as SearchIcon, 
  Heart as HeartIcon, 
  ShoppingCart as ShoppingCartIcon,
  ChevronRight as ChevronRightIcon,
  Trophy as TrophyIcon,
  ShieldCheck as ShieldCheckIcon,
  Truck as TruckIcon,
  Headphones as HeadphonesIcon,
  Plus as PlusIcon,
  X as XIcon,
  XCircle as XCircleIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next'

// User points state
const userPoints = ref(0)
const pointsUpdated = ref(false)
const showPointsToast = ref(false)
const lastPointsAwarded = ref(0)

// Popup state
const showPopup = ref(false)
const popupData = reactive({
  title: '',
  message: '',
  success: true,
  buttonText: 'OK'
})

// Voucher applied notification
const showVoucherApplied = ref(false)

// Missions data
const allMissions = reactive([
  { 
    id: 1, 
    title: 'Buy 1 sustainable product', 
    points: 500, 
    current: 0, 
    total: 1, 
    completionDate: '',
    isActive: false,
    isCompleted: false,
    inProgress: false
  },
  { 
    id: 2, 
    title: 'Weekly loyalty streak', 
    points: 200, 
    current: 0, 
    total: 2, 
    completionDate: '',
    isActive: false,
    isCompleted: false,
    inProgress: false
  },
  { 
    id: 3, 
    title: 'Refer 1 friend', 
    points: 100, 
    current: 0, 
    total: 1, 
    completionDate: '',
    isActive: false,
    isCompleted: false,
    inProgress: false
  },
  { 
    id: 4, 
    title: 'Customer satisfaction survey', 
    points: 200, 
    current: 0, 
    total: 2, 
    completionDate: '',
    isActive: false,
    isCompleted: false,
    inProgress: false
  },
  { 
    id: 5, 
    title: 'Social Media Engagement', 
    points: 100, 
    current: 0, 
    total: 1, 
    isActive: false,
    isCompleted: false,
    inProgress: false
  },
  { 
    id: 6, 
    title: 'Daily Streak Bonus', 
    points: 100, 
    current: 0, 
    total: 1, 
    isActive: false,
    isCompleted: false,
    inProgress: false
  }
])

// Computed properties for filtered missions
const currentMissions = computed(() => {
  return allMissions.filter(mission => mission.isActive && !mission.isCompleted)
})

const availableMissions = computed(() => {
  return allMissions.filter(mission => !mission.isActive)
})

// Leaderboard data
const leaderboard = reactive([
  { id: 1, username: '@johndoe123', points: 850, isCurrentUser: false },
  { id: 2, username: '@sarahsmith', points: 720, isCurrentUser: false },
  { id: 3, username: '@mikebrown', points: 615, isCurrentUser: false },
  { id: 4, username: '@sri1809', points: 400, isCurrentUser: false },
  { id: 5, username: '@ayushi23', points: 367, isCurrentUser: false },
  { id: 6, username: '@ruchi4567', points: 340, isCurrentUser: false },
  { id: 7, username: '@frenny56789', points: 320, isCurrentUser: false },
  { id: 8, username: '@chicken345', points: 0, isCurrentUser: true },
  { id: 9, username: '@brinda670988', points: 310, isCurrentUser: false }
])

// Vouchers data
const vouchers = reactive([
  { id: 1, amount: '$5', title: '$5 Discount Voucher', points: 500 },
  { id: 2, amount: '$10', title: '$10 Discount Voucher', points: 1000 },
  { id: 3, amount: '$5', title: '$5 Discount Voucher', points: 500 },
  { id: 4, amount: '$10', title: '$10 Discount Voucher', points: 1000 }
])

// User's redeemed vouchers
const userVouchers = reactive([])

// Function to join a mission
const joinMission = async (mission) => {
  try {
    // Simulate API call to join mission
    // In a real app, you would make an actual API call here
    // const response = await fetch('/api/missions/join', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ missionId: mission.id })
    // })
    // const data = await response.json()
    
    // Simulate successful response
    const missionToUpdate = allMissions.find(m => m.id === mission.id)
    
    if (missionToUpdate) {
      // Update mission status
      missionToUpdate.isActive = true
      missionToUpdate.inProgress = true
      missionToUpdate.current = 0
      
      // Show popup
      popupData.title = 'Mission Joined'
      popupData.message = `You've joined the "${mission.title}" mission. Complete it to earn ${mission.points} points!`
      popupData.success = true
      popupData.buttonText = 'Start Mission'
      showPopup.value = true
    }
  } catch (error) {
    console.error('Error joining mission:', error)
    
    // Show error popup
    popupData.title = 'Error'
    popupData.message = 'Failed to join mission. Please try again later.'
    popupData.success = false
    popupData.buttonText = 'OK'
    showPopup.value = true
  }
}

// Function to complete a mission
const completeMission = async (mission) => {
  try {
    // Simulate API call to complete mission
    // In a real app, you would make an actual API call here
    // const response = await fetch('/api/missions/complete', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ missionId: mission.id })
    // })
    // const data = await response.json()
    
    // Simulate successful response
    const missionToUpdate = allMissions.find(m => m.id === mission.id)
    
    if (missionToUpdate) {
      // Update mission status
      missionToUpdate.current = missionToUpdate.total
      missionToUpdate.isCompleted = true
      missionToUpdate.inProgress = false
      
      // Set completion date
      const today = new Date()
      missionToUpdate.completionDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear().toString().substr(-2)}`
      
      // Award points
      userPoints.value += missionToUpdate.points
      lastPointsAwarded.value = missionToUpdate.points
      
      // Update leaderboard
      const currentUser = leaderboard.find(user => user.isCurrentUser)
      if (currentUser) {
        currentUser.points += missionToUpdate.points
        
        // Sort leaderboard by points
        leaderboard.sort((a, b) => b.points - a.points)
      }
      
      // Show points updated animation
      pointsUpdated.value = true
      setTimeout(() => {
        pointsUpdated.value = false
      }, 2000)
      
      // Show toast notification
      showPointsToast.value = true
      setTimeout(() => {
        showPointsToast.value = false
      }, 3000)
      
      // Show success popup
      popupData.title = 'Mission Completed'
      popupData.message = `Congratulations! You've completed the "${mission.title}" mission and earned ${mission.points} points!`
      popupData.success = true
      popupData.buttonText = 'Claim Reward'
      showPopup.value = true
    }
  } catch (error) {
    console.error('Error completing mission:', error)
    
    // Show error popup
    popupData.title = 'Error'
    popupData.message = 'Failed to complete mission. Please try again later.'
    popupData.success = false
    popupData.buttonText = 'OK'
    showPopup.value = true
  }
}

// Function to redeem a voucher
const redeemVoucher = async (voucher) => {
  try {
    // Check if user has enough points
    if (userPoints.value < voucher.points) {
      // Show error popup
      popupData.title = 'Insufficient Points'
      popupData.message = `You need ${voucher.points} points to redeem this voucher. You currently have ${userPoints.value} points.`
      popupData.success = false
      popupData.buttonText = 'OK'
      showPopup.value = true
      return
    }
    
    // Simulate API call to validate points and redeem voucher
    // In a real app, you would make an actual API call here
    // const response = await fetch('/api/vouchers/redeem', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ voucherId: voucher.id })
    // })
    // const data = await response.json()
    
    // Simulate successful response
    // Deduct points
    userPoints.value -= voucher.points
    
    // Update leaderboard
    const currentUser = leaderboard.find(user => user.isCurrentUser)
    if (currentUser) {
      currentUser.points -= voucher.points
      
      // Sort leaderboard by points
      leaderboard.sort((a, b) => b.points - a.points)
    }
    
    // Add voucher to user's vouchers
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 3)
    const formattedExpiryDate = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`
    
    userVouchers.push({
      id: Date.now(), // Generate a unique ID
      amount: voucher.amount,
      title: voucher.title,
      expiryDate: formattedExpiryDate
    })
    
    // Show success popup
    popupData.title = 'Voucher Redeemed'
    popupData.message = `You've successfully redeemed a ${voucher.amount} voucher! It has been added to your vouchers.`
    popupData.success = true
    popupData.buttonText = 'OK'
    showPopup.value = true
  } catch (error) {
    console.error('Error redeeming voucher:', error)
    
    // Show error popup
    popupData.title = 'Error'
    popupData.message = 'Failed to redeem voucher. Please try again later.'
    popupData.success = false
    popupData.buttonText = 'OK'
    showPopup.value = true
  }
}

// Function to use a voucher
const useVoucher = (voucher) => {
  // Simulate applying voucher to cart
  // In a real app, you would make an API call or update the cart state
  
  // Show voucher applied notification
  showVoucherApplied.value = true
  setTimeout(() => {
    showVoucherApplied.value = false
    
    // Remove the voucher from user's vouchers
    const index = userVouchers.findIndex(v => v.id === voucher.id)
    if (index !== -1) {
      userVouchers.splice(index, 1)
    }
  }, 3000)
}

// Function to close popup
const closePopup = () => {
  showPopup.value = false
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: #333;
  background-color: #faf3ea;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

/* Header Styles */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #704116;
}

.main-nav {
  display: none;
}

@media (min-width: 768px) {
  .main-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-link.active {
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.icon-button:hover {
  background-color: #f5f5f5;
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

/* Main Content */
.main-content {
  padding: 2rem 1rem;
}

.two-column-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .two-column-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

/* Points Section */
.points-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.points-highlight {
  color: #704116;
  transition: color 0.3s ease;
}

.points-history {
  font-size: 0.875rem;
  font-weight: normal;
  color: #777;
  text-decoration: underline;
  cursor: pointer;
  margin-left: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 0.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.history-button {
  font-size: 0.875rem;
  color: #777;
}

/* Empty Missions */
.empty-missions {
  padding: 2rem;
  text-align: center;
  color: #777;
  border: 1px dashed #ddd;
  border-radius: 0.5rem;
}

/* Missions */
.missions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mission-card {
  border: 1px solid #eee;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.mission-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.points-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #704116;
  background-color: #f8ead7;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.mission-progress-text {
  font-size: 0.75rem;
  color: #777;
}

.mission-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 0.5rem;
  background-color: #eee;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #bb9d78;
  transition: width 0.5s ease-out;
}

.mission-date {
  font-size: 0.75rem;
  color: #777;
  margin-top: 0.5rem;
}

.complete-button {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  background-color: #704116;
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.complete-button:hover {
  background-color: #5a3412;
}

.complete-button:active {
  transform: scale(0.98);
}

/* Earn Points */
.earn-points-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .earn-points-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.earn-points-card {
  border: 1px solid #eee;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.earn-points-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.earn-points-title {
  font-weight: 500;
  margin: 0.5rem 0;
}

.join-button {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #704116;
  border-radius: 0.25rem;
  color: #704116;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.join-button:hover {
  background-color: #f8ead7;
}

.join-button:active {
  transform: scale(0.98);
}

/* Leaderboard */
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8ead7;
  border-radius: 0.5rem;
  transition: transform 0.3s ease;
}

.leaderboard-item.top-three {
  background-color: #f0e6d2;
  border: 1px solid #bb9d78;
}

.leaderboard-item.current-user {
  border: 2px solid #bb9d78;
}

.leaderboard-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  font-size: 0.875rem;
  font-weight: bold;
  color: white;
  background-color: #bb9d78;
  border-radius: 50%;
}

.leaderboard-rank.rank-1 {
  background-color: #ffd700; /* Gold */
  color: #704116;
  font-size: 1rem;
}

.leaderboard-rank.rank-2 {
  background-color: #c0c0c0; /* Silver */
  color: #704116;
  font-size: 1rem;
}

.leaderboard-rank.rank-3 {
  background-color: #cd7f32; /* Bronze */
  color: #704116;
  font-size: 1rem;
}

.leaderboard-user {
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 0.5rem;
}

.user-name {
  font-weight: 500;
}

.user-score {
  font-weight: 600;
  transition: color 0.3s ease, transform 0.3s ease;
}

.points-updated {
  color: #704116;
  transform: scale(1.2);
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Redeem Points */
.redeem-points-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .redeem-points-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.redeem-card {
  border: 1px solid #eee;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.redeem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.voucher-amount {
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-size: 3rem;
  font-weight: 700;
  background-color: #704116;
  color: white;
}

.redeem-content {
  padding: 1rem;
}

.redeem-title {
  font-weight: 500;
}

.redeem-points {
  font-size: 0.875rem;
  color: #777;
  margin-top: 0.25rem;
}

.redeem-button {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  border: 1px solid #704116;
  border-radius: 0.25rem;
  color: #704116;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.redeem-button:hover {
  background-color: #f8ead7;
}

.redeem-button:active {
  transform: scale(0.98);
}

.redeem-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Insufficient Points */
.insufficient-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #777;
  border: 1px dashed #ddd;
  border-radius: 0.5rem;
}

.insufficient-icon {
  color: #704116;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

/* User Vouchers */
.user-vouchers {
  margin-top: 2rem;
}

.vouchers-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.user-vouchers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-voucher-card {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  overflow: hidden;
}

.voucher-details {
  flex: 1;
  padding: 0.75rem;
}

.voucher-title {
  font-weight: 500;
  font-size: 0.875rem;
}

.voucher-expiry {
  font-size: 0.75rem;
  color: #777;
  margin-top: 0.25rem;
}

.use-voucher-button {
  padding: 0.5rem 1rem;
  height: 100%;
  background-color: #704116;
  color: white;
  font-weight: 500;
  transition: background-color 0.2s;
}

.use-voucher-button:hover {
  background-color: #5a3412;
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
}

@media (min-width: 768px) {
  .features-section {
    grid-template-columns: repeat(4, 1fr);
  }
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  background-color: #f8ead7;
  border-radius: 50%;
  color: #704116;
}

.feature-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.feature-description {
  font-size: 0.875rem;
  color: #777;
}

/* Toast notification */
.points-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #704116;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 100;
}

.points-toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast-icon {
  color: #fbc15a;
}

/* Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.popup-container {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8ead7;
}

.popup-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #704116;
}

.close-popup {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #704116;
}

.close-popup:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.popup-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.popup-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.popup-icon.success {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.popup-icon.failure {
  background-color: #fdecea;
  color: #d32f2f;
}

.popup-message {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.popup-actions {
  padding: 1rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid #eee;
}

.popup-button {
  padding: 0.75rem 2rem;
  background-color: #704116;
  color: white;
  font-weight: 500;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.popup-button:hover {
  background-color: #5a3412;
}

/* Voucher Applied Notification */
.voucher-applied {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #2e7d32;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 100;
}

.voucher-applied.show {
  transform: translateY(0);
  opacity: 1;
}

.voucher-applied-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.voucher-applied-icon {
  color: white;
}
</style>