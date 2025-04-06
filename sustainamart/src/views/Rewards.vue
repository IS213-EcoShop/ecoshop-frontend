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
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <alert-circle-icon size="48" class="error-icon" />
        <h3>Error Loading Data</h3>
        <p>{{ error }}</p>
        <button @click="fetchAllData" class="retry-button">Retry</button>
      </div>
      
      <div v-else class="two-column-grid">
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
                  <span class="points-badge">+{{ mission.reward_points }} points</span>
                  <span class="mission-progress-text">{{ mission.current }} of {{ mission.goal }}</span>
                </div>
                <h4 class="mission-title">{{ mission.name }}</h4>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${Math.min((mission.current / mission.goal) * 100, 100)}%` }"></div>
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
            
            <div v-if="availableMissions.length > 0" class="earn-points-grid">
              <div v-for="mission in availableMissions" :key="mission.id" class="earn-points-card">
                <span class="points-badge">Get +{{ mission.reward_points }} points</span>
                <h4 class="earn-points-title">{{ mission.description }}</h4>
                <button @click="joinMission(mission)" class="join-button">Join Mission</button>
              </div>
            </div>

            <div v-else class="empty-missions">
              <p>No available missions at the moment. Check back later!</p>
            </div>
          </div>
        </div>

  
        
        <div class="column">
          <div class="card">
            <h3 class="section-title">Leaderboard</h3>
            
            <div class="leaderboard-list">
              <div 
                v-for="(user, index) in sortedLeaderboard" 
                :key="user.id"
                class="leaderboard-item"
                :class="{ 'current-user': user.isCurrentUser, 'top-three': index < 3 }"
              >
                <div class="leaderboard-rank" :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }">
                  {{ index + 1 }}
                </div>
                <div class="leaderboard-user">
                  <div class="user-name">{{ user.id }} {{ user.isCurrentUser ? '(You)' : '' }}</div>
                </div>
                <div class="user-score" :class="{ 'points-updated': user.isCurrentUser && pointsUpdated }">{{ user.total_points }}</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="section-title">Redeem Points</h3>
            
            <div v-if="userPoints >= 500" class="redeem-points-grid">
              <div v-for="voucher in availableVouchers" :key="voucher.id" class="redeem-card">
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
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

// Replace the Supabase initialization section with:

// Initialize Supabase client with provided credentials
const supabaseUrl = 'https://cvtknyvnrxhaqdvdmlde.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dGtueXZucnhoYXFkdmRtbGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NDgyMzAsImV4cCI6MjA1NzUyNDIzMH0.cwPyRfbk5dwizQslRHTWzPGaRiiiDerVAMv_dwNDbUc'
const supabase = createClient(supabaseUrl, supabaseKey)

// User ID - In a real app, this would come from authentication
const userId = ref(200)

// Loading and error states
const isLoading = ref(false)
const error = ref(null)

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
const allMissions = reactive([])
const joinedMissions = ref([])

// Leaderboard data
const leaderboard = reactive([])

// Computed properties for filtered missions
const currentMissions = computed(() => {
  return joinedMissions.value.filter(mission => !mission.isCompleted)
})

const availableMissions = computed(() => {
  // Filter out missions that are already joined
  const joinedMissionIds = joinedMissions.value.map(mission => mission.id)
  return allMissions.filter(mission => !joinedMissionIds.includes(mission.id))
})

// Computed property for sorted leaderboard (descending order by points)
const sortedLeaderboard = computed(() => {
  return [...leaderboard].sort((a, b) => b.points - a.points)
})

// Vouchers data
const availableVouchers = ref([])
const userVouchers = ref([])

// Polling intervals
const leaderboardInterval = ref(null)
const walletInterval = ref(null)

// Function to fetch wallet data (user points and vouchers)
const fetchWalletData = async () => {
  try {
    const response = await fetch(`http://localhost:5402/wallet/${userId.value}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wallet data: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Update user points
    userPoints.value = data.points || 0
    
    // Update user vouchers
    userVouchers.value = data.vouchers || []
    
    console.log('Wallet data fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    // Don't set the error state here to avoid blocking the UI
    // if only the wallet fetch fails
    return null
  }
}

// Function to fetch leaderboard data
const fetchLeaderboardData = async () => {
  try {
    const response = await fetch('http://localhost:5404/leaderboard/top')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Clear existing leaderboard
    leaderboard.splice(0, leaderboard.length)
    
    // Add new leaderboard data
    data.forEach(user => {
      leaderboard.push({
        id: user.id,
        username: user.username,
        points: user.total_points,
        isCurrentUser: user.id === userId.value
      })
    })
    
    console.log('Leaderboard data fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    // Don't set the error state here to avoid blocking the UI
    // if only the leaderboard fetch fails
    return null
  }
}

// Function to fetch available voucher templates
const fetchAvailableVouchers = async () => {
  try {
    const response = await fetch('http://localhost:5406/voucher/templates')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voucher templates: ${response.status}`)
    }
    
    const data = await response.json()
    availableVouchers.value = data
    
    console.log('Voucher templates fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching voucher templates:', error)
    // Don't set the error state here to avoid blocking the UI
    // if only the vouchers fetch fails
    return null
  }
}

// Function to fetch joined missions
const fetchJoinedMissions = async () => {
  try {
    const response = await fetch(`http://localhost:5403/mission/status/200`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch joined missions: ${response.status}`)
    }
    
    const data = await response.json()

    // Map the missions to ensure they have the correct properties
    joinedMissions.value = data.map(mission => ({
      ...mission,
      // If these properties don't exist in your API response, add them
      current: mission.current || 0, // Set current progress to 0 if not provided
      goal: mission.goal || 1,       // Set goal to 1 if not provided
      inProgress: mission.current < mission.goal // Add inProgress flag
    }))
    
    console.log('Joined missions fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching joined missions:', error)
    // Don't set the error state here to avoid blocking the UI
    // if only the missions fetch fails
    return null
  }
}

// Function to fetch available missions from Supabase
const fetchAvailableMissions = async () => {
  try {
    const { data, error: supabaseError } = await supabase
      .from('mission')
      .select('*')
    
    if (supabaseError) {
      throw new Error(supabaseError.message)
    }
    
    // Clear existing missions
    allMissions.splice(0, allMissions.length)
    
    // Add new missions
    if (data && data.length > 0) {
      data.forEach(mission => {
        allMissions.push({
          id: mission.id,
          name: mission.name,
          description: mission.description || mission.name,
          reward_points: mission.reward_points || 100,
          goal: mission.goal || 1
        })
      })
    }
    
    console.log('Available missions fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching available missions:', error)
    // Don't set the error state here to avoid blocking the UI
    // if only the available missions fetch fails
    return null
  }
}

// Function to fetch all data
const fetchAllData = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Fetch all data in parallel
    const results = await Promise.all([
      fetchWalletData(),
      fetchLeaderboardData(),
      fetchAvailableVouchers(),
      fetchJoinedMissions(),
      fetchAvailableMissions()
    ])
    
    // Check if any of the fetches failed
    const anyFailed = results.some(result => result === null)
    
    if (anyFailed) {
      console.warn('Some data fetches failed, but continuing with available data')
    }
    
  } catch (err) {
    error.value = err.message || 'Failed to load data'
    console.error('Error fetching all data:', err)
  } finally {
    isLoading.value = false
  }
}

// Function to join a mission
const joinMission = async (mission) => {
  try {
    // Call the API to join the mission
    const response = await fetch('http://localhost:5403/mission/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        mission_id: mission.id
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to join mission: ${response.status}`)
    }
    
    // Refresh joined missions
    await fetchJoinedMissions()
    
    // Show popup
    popupData.title = 'Mission Joined'
    popupData.message = `You've joined the "${mission.name}" mission. Complete it to earn ${mission.reward_points} points!`
    popupData.success = true
    popupData.buttonText = 'Start Mission'
    showPopup.value = true
    
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
    // Call the API to complete the mission
    const response = await fetch(`http://localhost:5403/mission/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        mission_id: mission.id
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to complete mission: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Update points awarded
    lastPointsAwarded.value = mission.reward_points
    
    // Refresh wallet data to get updated points
    await fetchWalletData()
    
    // Refresh joined missions
    await fetchJoinedMissions()
    
    // Refresh leaderboard
    await fetchLeaderboardData()
    
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
    popupData.message = `Congratulations! You've completed the "${mission.name}" mission and earned ${mission.reward_points} points!`
    popupData.success = true
    popupData.buttonText = 'Claim Reward'
    showPopup.value = true
    
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
    
    // Call the API to redeem the voucher
    const response = await fetch(`http://localhost:5402/wallet/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        voucher_id: voucher.id,
        points: voucher.points
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to redeem voucher: ${response.status}`)
    }
    
    // Refresh wallet data to get updated points and vouchers
    await fetchWalletData()
    
    // Refresh leaderboard
    await fetchLeaderboardData()
    
    // Show success popup
    popupData.title = 'Voucher Redeemed'
    popupData.message = `You've successfully redeemed a ${voucher.amount} voucher! It has been added to your vouchers and is available in your cart.`
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
const useVoucher = async (voucher) => {
  try {
    // Call the API to use the voucher
    const response = await fetch(`http://localhost:5402/wallet/use-voucher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        voucher_id: voucher.id
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to use voucher: ${response.status}`)
    }
    
    // Show voucher applied notification
    showVoucherApplied.value = true
    setTimeout(() => {
      showVoucherApplied.value = false
      
      // Refresh wallet data to get updated vouchers
      fetchWalletData()
      
      // Redirect to cart page
      window.location.href = '/cart'
    }, 2000)
    
  } catch (error) {
    console.error('Error using voucher:', error)
    
    // Show error popup
    popupData.title = 'Error'
    popupData.message = 'Failed to use voucher. Please try again later.'
    popupData.success = false
    popupData.buttonText = 'OK'
    showPopup.value = true
  }
}

// Function to close popup
const closePopup = () => {
  showPopup.value = false
}

// Set up polling for leaderboard and wallet data
const setupPolling = () => {
  // Poll leaderboard every 30 seconds
  leaderboardInterval.value = setInterval(fetchLeaderboardData, 30000)
  
  // Poll wallet data every 60 seconds
  walletInterval.value = setInterval(fetchWalletData, 60000)
}

// Clean up polling intervals
const cleanupPolling = () => {
  if (leaderboardInterval.value) {
    clearInterval(leaderboardInterval.value)
  }
  
  if (walletInterval.value) {
    clearInterval(walletInterval.value)
  }
}

// Initialize component
onMounted(() => {
  // Fetch all data
  fetchAllData()
  
  // Set up polling
  setupPolling()
})

// Clean up when component is unmounted
onUnmounted(() => {
  cleanupPolling()
})
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