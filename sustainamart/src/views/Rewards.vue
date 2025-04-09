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
              <div v-for="mission in currentMissions" :key="mission.mission_id" class="mission-card">
                <div class="mission-header">
                  <span class="points-badge">+{{ mission.reward_points }} points</span>
                  <span class="mission-progress-text">{{ mission.current }} of {{ mission.goal }}</span>
                </div>
                <h4 class="mission-title">{{ mission.name }}</h4>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :class="{ 'animate-progress': !showPopup, 'progress-updated': mission.recentlyUpdated }"
                    :style="{ width: showPopup ? '0%' : `${Math.min((mission.current / mission.goal) * 100, 100)}%` }"
                  ></div>
                </div>
                <p class="mission-instruction">{{ getMissionInstruction(mission.event_type) }}</p>
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
                <h4 class="earn-points-title">{{ mission.name }}</h4>
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
                  <div class="user-name">{{ user.username }} {{ user.isCurrentUser ? '(You)' : '' }}</div>
                </div>
                <div class="user-score" :class="{ 'points-updated': user.isCurrentUser && pointsUpdated }">{{ user.points }}</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="section-title">Redeem Points</h3>
            
            <div v-if="userPoints >= 500" class="redeem-points-grid">
              <div v-for="voucher in filteredAvailableVouchers" :key="voucher.id" class="redeem-card">
                <div class="voucher-amount">{{ voucher.description }}</div>
                <div class="redeem-content">
                  <h4 class="redeem-title">{{ voucher.title }}</h4>
                  <p class="redeem-points">{{ voucher.points }} Points</p>
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
                  <div class="voucher-amount">{{ voucher.description }}</div>
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

    <!-- Purchase Success Notification -->
    <div v-if="showPurchaseSuccess" class="purchase-success" :class="{ 'show': showPurchaseSuccess }">
      <div class="purchase-success-content">
        <check-circle-icon class="purchase-success-icon" />
        <div class="purchase-success-text">
          <span class="purchase-success-title">Purchase Successful!</span>
          <span class="purchase-success-subtitle">Your mission progress has been updated.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue"
import { createClient } from "@supabase/supabase-js"
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
  AlertCircle as AlertCircleIcon,
} from "lucide-vue-next"

// Initialize Supabase client with provided credentials
const supabaseUrl = "https://cvtknyvnrxhaqdvdmlde.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dGtueXZucnhoYXFkdmRtbGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NDgyMzAsImV4cCI6MjA1NzUyNDIzMH0.cwPyRfbk5dwizQslRHTWzPGaRiiiDerVAMv_dwNDbUc"
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
  title: "",
  message: "",
  success: true,
  buttonText: "OK",
  missionId: null,
  isClaimReward: false,
})

// Voucher applied notification
const showVoucherApplied = ref(false)

// Purchase success notification
const showPurchaseSuccess = ref(false)

// Missions data
const allMissions = ref([])
const joinedMissions = ref([])

// Leaderboard data
const leaderboard = reactive([])

// Check if this is a fresh session
let isFirstLoad = ref(true)
const appStartTime = ref(null)

// Store previous mission data to detect changes
const previousMissionData = ref({})

// Track redeemed vouchers
const redeemedVoucherIds = ref([])

// Computed properties for filtered missions
const currentMissions = computed(() => {
  return joinedMissions.value.filter((mission) => !mission.completed)
})

const availableMissions = computed(() => {
  const joinedMissionIds = joinedMissions.value.map((mission) => mission.mission_id)
  return allMissions.value.filter((mission) => !joinedMissionIds.includes(mission.id))
})

// Computed property for sorted leaderboard (descending order by points)
const sortedLeaderboard = computed(() => {
  return [...leaderboard].sort((a, b) => b.points - a.points)
})

// Vouchers data
const availableVouchers = reactive([])
const userVouchers = reactive([])

// Computed property to filter out redeemed vouchers
const filteredAvailableVouchers = computed(() => {
  // Get IDs of vouchers the user already has
  const userVoucherIds = userVouchers.value.map(voucher => voucher.template_id || voucher.id)
  
  // Filter out vouchers that the user has already redeemed
  return availableVouchers.filter(voucher => 
    !userVoucherIds.includes(voucher.id) && 
    !redeemedVoucherIds.value.includes(voucher.id)
  )
})

// Polling intervals
const leaderboardInterval = ref(null)
const walletInterval = ref(null)
const missionCheckInterval = ref(null)

// Function to check if this is a fresh session and clear missions if needed
const checkAndClearSession = () => {
  // Get the app start time from localStorage
  const storedAppStartTime = localStorage.getItem("appStartTime")

  // If this is the first load after starting the app
  if (!storedAppStartTime || isFirstLoad.value) {
    console.log("First load of the application, setting app start time")

    // Only clear joined missions if this is a new app start (npm run dev)
    if (!storedAppStartTime) {
      console.log("New app start detected, clearing joined missions")
      joinedMissions.value = []

      // Set the app start time
      const currentTime = new Date().getTime()
      appStartTime.value = currentTime
      localStorage.setItem("appStartTime", currentTime.toString())
    } else {
      // If there's a stored app start time, use it
      appStartTime.value = parseInt(storedAppStartTime)
    }

    // Mark that we've handled the first load
    isFirstLoad.value = false
    return !storedAppStartTime // Only return true if this is a new app start
  }

  return false
}

// Function to fetch wallet data (user points and vouchers)
const fetchWalletData = async () => {
  try {
    const response = await fetch(`http://localhost:8000/wallet/${userId.value}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet data: ${response.status}`)
    }

    const data = await response.json()

    // Update user points
    userPoints.value = data.points || 0

    // Update user vouchers
    userVouchers.value = data.vouchers || []

    // Update leaderboard with wallet points
    updateLeaderboardWithWalletPoints(userPoints.value)

    console.log("Wallet data fetched successfully:", data)
    return data
  } catch (error) {
    console.error("Error fetching wallet data:", error)
    // Don't set the error state here to avoid blocking the UI
    // if only the wallet fetch fails
    return null
  }
}

// Function to update leaderboard with wallet points
const updateLeaderboardWithWalletPoints = async (points) => {
  try {
    // Call the leaderboard update API
    const response = await fetch("http://localhost:8000/leaderboard/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.value,
        total_points: points
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update leaderboard: ${response.status}`)
    }

    console.log("Leaderboard updated with wallet points:", points)
    
    // Refresh leaderboard data after update
    await fetchLeaderboardData()
  } catch (error) {
    console.error("Error updating leaderboard with wallet points:", error)
  }
}

// Function to fetch leaderboard data
const fetchLeaderboardData = async () => {
  try {
    const response = await fetch("http://localhost:8000/leaderboard/top")

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.status}`)
    }

    const data = await response.json()

    // Clear existing leaderboard
    leaderboard.splice(0, leaderboard.length)

    // Add new leaderboard data
    let currentUserFound = false
    
    data.forEach((user) => {
      const isCurrentUser = user.user_id === userId.value
      if (isCurrentUser) {
        currentUserFound = true
      }
      
      leaderboard.push({
        id: user.user_id,
        username: user.username,
        points: user.total_points || 0,
        isCurrentUser: isCurrentUser,
      })
    })
    
    // If the current user is not in the top leaderboard, add them
    if (!currentUserFound) {
      leaderboard.push({
        id: userId.value,
        username: "user200", // Changed from "You" to "user200"
        points: userPoints.value,
        isCurrentUser: true,
      })
    }

    console.log("Leaderboard data fetched successfully:", data)
    return data
  } catch (error) {
    console.error("Error fetching leaderboard data:", error)
    return null
  }
}

// Function to fetch available voucher templates
const fetchAvailableVouchers = async () => {
  try {
    const response = await fetch("http://localhost:8000/voucher/templates")

    if (!response.ok) {
      throw new Error(`Failed to fetch voucher data: ${response.status}`)
    }

    const data = await response.json()

    // Clear available vouchers
    availableVouchers.length = 0

    // Add new voucher data
    data.forEach((item) => {
      availableVouchers.push({
        id: item.id,
        title: item.name,
        points: item.points_cost,
        amount: item.value,
        description: item.description,
      })
    })

    console.log("Voucher templates fetched successfully:", data)
    return data
  } catch (error) {
    console.error("Error fetching voucher templates:", error)
    return null
  }
}

// Function to fetch joined missions
const fetchJoinedMissions = async () => {
  try {
    const response = await fetch(`http://localhost:8000/mission/status/${userId.value}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch joined missions: ${response.status}`)
    }

    const data = await response.json()
    
    // Store current mission data to detect changes on next update
    const currentMissionData = {}
    joinedMissions.value.forEach(mission => {
      currentMissionData[mission.mission_id] = {
        progress: mission.current,
        completed: mission.completed
      }
    })
    
    // Update joined missions with new data
    joinedMissions.value = data.map((mission) => {
      // Check if this mission was in the previous data
      const prevMission = currentMissionData[mission.mission_id]
      
      // Determine if this mission was updated (progress increased)
      const wasUpdated = prevMission && 
                         (mission.progress > prevMission.progress || 
                          mission.completed && !prevMission.completed)
      
      return {
        ...mission,
        current: mission.progress || 0, // Use progress from backend
        goal: mission.goal || 1,
        inProgress: (mission.progress || 0) < mission.goal,
        completed: mission.completed || false,
        event_type: mission.event_type || "default",
        recentlyUpdated: wasUpdated // Flag to highlight updated missions
      }
    })
    
    // Check if any mission was updated
    const updatedMissions = joinedMissions.value.filter(m => m.recentlyUpdated)
    if (updatedMissions.length > 0) {
      // Show purchase success notification if we detected an update
      if (!showPurchaseSuccess.value) {
        showPurchaseSuccess.value = true
        setTimeout(() => {
          showPurchaseSuccess.value = false
        }, 5000)
      }
      
      // Clear the recently updated flag after animation
      setTimeout(() => {
        joinedMissions.value = joinedMissions.value.map(mission => ({
          ...mission,
          recentlyUpdated: false
        }))
      }, 3000)
    }
    
    // Check if any mission was just completed
    const justCompletedMissions = joinedMissions.value.filter(m => {
      const prevMission = previousMissionData.value[m.mission_id]
      return prevMission && 
             !prevMission.completed && 
             m.completed
    })

    if (justCompletedMissions.length > 0) {
      // Show mission completed popup for the first completed mission
      const completedMission = justCompletedMissions[0]
      showMissionCompletedPopup(completedMission)
    }
    
    // Save current mission data for next comparison
    previousMissionData.value = {}
    joinedMissions.value.forEach(mission => {
      previousMissionData.value[mission.mission_id] = {
        progress: mission.current,
        completed: mission.completed
      }
    })

    console.log("Joined missions fetched successfully:", joinedMissions.value)
    return joinedMissions.value
  } catch (error) {
    console.error("Error fetching joined missions:", error)
    return []
  }
}

// Function to show mission completed popup
const showMissionCompletedPopup = (mission) => {
  // Check if we've already shown a popup for this mission in this session
  const missionPopupShown = sessionStorage.getItem(`mission_popup_${mission.mission_id}`)
  if (missionPopupShown) {
    console.log(`Popup for mission ${mission.mission_id} already shown, not showing again`)
    return
  }
  
  // Mark this mission popup as shown in this session
  sessionStorage.setItem(`mission_popup_${mission.mission_id}`, 'true')
  
  // Set popup data
  popupData.title = "Mission Completed!"
  popupData.message = `Congratulations! You've completed the "${mission.name}" mission and earned ${mission.reward_points} points!`
  popupData.success = true
  popupData.buttonText = "OK" // Changed from "Claim Reward" to "OK"
  popupData.missionId = mission.mission_id
  popupData.isClaimReward = false // Changed to false to prevent double crediting
  showPopup.value = true
  
  // Update last points awarded for toast notification
  lastPointsAwarded.value = mission.reward_points
  
  // Show points toast immediately since points are already awarded by the backend
  showPointsToast.value = true
  setTimeout(() => {
    showPointsToast.value = false
  }, 3000)
}

// Function to fetch available missions from Supabase
const fetchAvailableMissions = async () => {
  try {
    // First try to fetch from the mission microservice
    try {
      const response = await fetch("http://localhost:8000/mission/all")
      
      if (response.ok) {
        const data = await response.json()
        
        // Clear and populate using ref
        allMissions.value = data.map((mission) => ({
          id: mission.id,
          name: mission.name,
          description: mission.description,
          reward_points: mission.reward_points || 100,
          goal: mission.goal || 1,
          event_type: mission.event_type || null,
        }))
        
        console.log("Available missions fetched from microservice:", data)
        return data
      }
    } catch (err) {
      console.warn("Could not fetch missions from microservice, falling back to Supabase")
    }
    
    // Fallback to Supabase if microservice is not available
    const { data, error: supabaseError } = await supabase.from("mission").select("*")

    if (supabaseError) {
      throw new Error(supabaseError.message)
    }

    // Clear and populate using ref
    allMissions.value = data.map((mission) => ({
      id: mission.id,
      name: mission.name,
      description: mission.description,
      reward_points: mission.reward_points || 100,
      goal: mission.goal || 1,
      event_type: mission.event_type || null,
    }))

    console.log("Available missions fetched from Supabase:", data)
    return data
  } catch (error) {
    console.error("Error fetching available missions:", error)
    return null
  }
}

// Function to check for mission updates by comparing with previous data
const checkForMissionUpdates = async () => {
  try {
    // Fetch the latest mission data
    const response = await fetch(`http://localhost:8000/mission/status/${userId.value}`)
    
    if (!response.ok) {
      return
    }
    
    const data = await response.json()
    
    // Check if any mission has been updated
    let hasUpdates = false
    
    data.forEach(mission => {
      const prevMission = previousMissionData.value[mission.mission_id]
      
      if (prevMission) {
        // Check if progress increased or mission completed
        if (mission.progress > prevMission.progress || 
            (mission.completed && !prevMission.completed)) {
          hasUpdates = true
        }
      }
    })
    
    if (hasUpdates) {
      // Update the missions with the new data
      await fetchJoinedMissions()
      
      // Show purchase success notification
      showPurchaseSuccess.value = true
      setTimeout(() => {
        showPurchaseSuccess.value = false
      }, 5000)
      
      // Refresh wallet data to get updated points
      await fetchWalletData()
    }
    
    // Check if any mission was just completed
    let justCompleted = false
    let completedMission = null

    data.forEach(mission => {
      const prevMission = previousMissionData.value[mission.mission_id]
      
      if (prevMission && !prevMission.completed && mission.completed) {
        justCompleted = true
        completedMission = mission
      }
    })

    if (justCompleted && completedMission) {
      // Show mission completed popup
      showMissionCompletedPopup(completedMission)
    }
  } catch (error) {
    console.error('Error checking for mission updates:', error)
  }
}

// Replace the triggerMissionUpdate function with this updated version
// that has better protection against duplicate calls

const triggerMissionUpdate = async (eventType = "ECO_PURCHASE") => {
  try {
    // Check if we already have a mission update in progress to prevent double calls
    if (window.missionUpdateInProgress) {
      console.log("Mission update already in progress, skipping duplicate call")
      return
    }
    
    // Set flag to prevent concurrent updates
    window.missionUpdateInProgress = true
    console.log("Setting mission update in progress flag")
    
    // Add a timestamp to track when this update started
    const updateStartTime = Date.now()
    window.lastMissionUpdateTime = updateStartTime
    
    // Log the event type being processed
    console.log(`Processing mission update for event type: ${eventType}`)
    
    const response = await fetch(`http://localhost:8000/mission/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.value,
        event_type: eventType
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update mission: ${response.status}`)
    }
    
    // Get the response data
    const result = await response.json()
    console.log("Mission update result:", result)
    
    // Only proceed if this is still the most recent update
    if (window.lastMissionUpdateTime !== updateStartTime) {
      console.log("A newer mission update has been initiated, abandoning this one")
      return
    }
    
    // Refresh mission data
    await fetchJoinedMissions()
    
    // Refresh wallet data
    await fetchWalletData()
    
    // Check if a mission was completed
    if (result.mission_completed) {
      console.log("Mission completed:", result.mission_id)
      
      // Check if we've already shown a popup for this mission recently
      const recentlyCompletedMissions = JSON.parse(localStorage.getItem('recentlyCompletedMissions') || '[]')
      const missionAlreadyCompleted = recentlyCompletedMissions.includes(result.mission_id)
      
      if (!missionAlreadyCompleted) {
        // Add this mission to recently completed list
        recentlyCompletedMissions.push(result.mission_id)
        localStorage.setItem('recentlyCompletedMissions', JSON.stringify(recentlyCompletedMissions))
        
        // Fetch the completed mission details
        const missionResponse = await fetch(`http://localhost:8000/mission/status/${userId.value}`)
        if (missionResponse.ok) {
          const missions = await missionResponse.json()
          const completedMission = missions.find(m => m.mission_id === result.mission_id)
          
          if (completedMission) {
            // Show mission completed popup
            showMissionCompletedPopup(completedMission)
          }
        }
        
        // Clear the recently completed missions after 5 minutes
        setTimeout(() => {
          localStorage.setItem('recentlyCompletedMissions', JSON.stringify([]))
        }, 5 * 60 * 1000)
      } else {
        console.log("Mission already marked as completed recently, not showing popup again")
      }
    }
    
    console.log("Mission update triggered successfully")
    
    // Clear the flag after a delay to prevent rapid consecutive calls
    setTimeout(() => {
      if (window.lastMissionUpdateTime === updateStartTime) {
        console.log("Clearing mission update in progress flag")
        window.missionUpdateInProgress = false
      }
    }, 5000) // Increased to 5 seconds for better protection
  } catch (error) {
    console.error("Error triggering mission update:", error)
    // Clear the flag in case of error
    window.missionUpdateInProgress = false
  }
}

// Function to join a mission
const joinMission = async (mission) => {
  try {
    // Call the API to join the mission
    const response = await fetch("http://localhost:8000/mission/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.value,
        mission_id: mission.id,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to join mission: ${response.status}`)
    }

    // Add the mission to joined missions immediately for better UX
    const newMission = {
      mission_id: mission.id,
      name: mission.name,
      description: mission.description,
      reward_points: mission.reward_points,
      goal: mission.goal || 1,
      current: 0,
      progress: 0,
      inProgress: true,
      completed: false,
      event_type: mission.event_type,
    }

    joinedMissions.value.push(newMission)

    // Show popup with specific instructions
    popupData.title = "Mission Joined"
    popupData.message = `You've joined the "${mission.name}" mission. ${getMissionInstruction(mission.event_type)}`
    popupData.success = true
    popupData.buttonText = "Got it!"
    showPopup.value = true
  } catch (error) {
    console.error("Error joining mission:", error)

    // Show error popup
    popupData.title = "Error"
    popupData.message = "Failed to join mission. Please try again later."
    popupData.success = false
    popupData.buttonText = "OK"
    showPopup.value = true
  }
}

// Modify the redeemVoucher function to store the voucher in localStorage
const redeemVoucher = async (voucher) => {
  try {
    // Check if user has enough points
    if (userPoints.value < voucher.points) {
      // Show error popup
      popupData.title = "Insufficient Points"
      popupData.message = `You need ${voucher.points} points to redeem this voucher. You currently have ${userPoints.value} points.`
      popupData.success = false
      popupData.buttonText = "OK"
      showPopup.value = true
      return
    }

    // Call the API to redeem the voucher
    const response = await fetch(`http://localhost:8000/voucher/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.value,
        voucher_id: voucher.id,
        points: voucher.points,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to redeem voucher: ${response.status}`)
    }

    // Get the response data to get the voucher details
    const responseData = await response.json()
    console.log("Voucher redemption response:", responseData)

    // Add to redeemed vouchers list to hide it immediately
    redeemedVoucherIds.value.push(voucher.id)

    // Store the voucher in localStorage for cart page to access
    const voucherForCart = {
      id: responseData.voucher_id || voucher.id,
      title: voucher.title,
      description: voucher.description,
      amount: voucher.amount,
      code: responseData.code || `VOUCHER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      expiryDate: responseData.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    // Store the active voucher in localStorage
    localStorage.setItem('activeVoucher', JSON.stringify(voucherForCart))
    
    // Dispatch a custom event for other components to listen for
    window.dispatchEvent(new CustomEvent('voucher-redeemed', { 
      detail: voucherForCart 
    }))

    // Refresh wallet data to get updated points and vouchers
    await fetchWalletData()

    // Show success popup
    popupData.title = "Voucher Redeemed"
    popupData.message = `You've successfully redeemed a $${voucher.amount} voucher! It has been added to your vouchers and is available in your cart.`
    popupData.success = true
    popupData.buttonText = "OK"
    showPopup.value = true
  } catch (error) {
    console.error("Error redeeming voucher:", error)

    // Show error popup
    popupData.title = "Error"
    popupData.message = "Failed to redeem voucher. Please try again later."
    popupData.success = false
    popupData.buttonText = "OK"
    showPopup.value = true
  }
}

// Modify the useVoucher function to update localStorage
const useVoucher = async (voucher) => {
  try {
    // Call the API to use the voucher
    const response = await fetch(`http://localhost:8000/wallet/use-voucher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId.value,
        voucher_id: voucher.id,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to use voucher: ${response.status}`)
    }

    // Store the voucher in localStorage for cart page to access
    const voucherForCart = {
      id: voucher.id,
      title: voucher.title,
      description: voucher.description || voucher.amount,
      amount: voucher.amount || parseFloat(voucher.description.replace(/[^0-9.]/g, '')),
      code: voucher.code || `VOUCHER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      expiryDate: voucher.expiryDate
    }
    
    // Store the active voucher in localStorage
    localStorage.setItem('activeVoucher', JSON.stringify(voucherForCart))
    
    // Dispatch a custom event for other components to listen for
    window.dispatchEvent(new CustomEvent('voucher-redeemed', { 
      detail: voucherForCart 
    }))

    // Show voucher applied notification
    showVoucherApplied.value = true
    setTimeout(() => {
      showVoucherApplied.value = false

      // Refresh wallet data to get updated vouchers
      fetchWalletData()

      // Redirect to cart page
      window.location.href = "/cart"
    }, 2000)
  } catch (error) {
    console.error("Error using voucher:", error)

    // Show error popup
    popupData.title = "Error"
    popupData.message = "Failed to use voucher. Please try again later."
    popupData.success = false
    popupData.buttonText = "OK"
    showPopup.value = true
  }
}

// Function to close popup
const closePopup = () => {
  // No need to claim reward here - points are already awarded by the backend
  showPopup.value = false

  // Force a repaint to ensure the progress bars animate properly
  setTimeout(() => {
    const progressBars = document.querySelectorAll(".progress-fill")
    progressBars.forEach((bar) => {
      bar.style.transition = "none"
      bar.offsetHeight // Force repaint
      bar.style.transition = "width 2s ease-out"
    })
  }, 50)
}

// Function to get mission instruction based on event type
const getMissionInstruction = (eventType) => {
  switch (eventType) {
    case "ECO_PURCHASE":
      return "Make an eco-friendly purchase to complete this mission."
    case "RECYCLE":
      return "Recycle items to complete this mission."
    case "REDUCE_WASTE":
      return "Reduce waste to complete this mission."
    default:
      return "Complete the required action to finish this mission."
  }
}

// Function to fetch all data
const fetchAllData = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Check if this is a fresh session and clear missions if needed
    const isNewAppStart = checkAndClearSession()

    // Fetch all data in parallel
    await Promise.all([
      fetchAvailableMissions(),
      fetchJoinedMissions(),
      fetchLeaderboardData(),
      fetchWalletData(),
      fetchAvailableVouchers(),
    ])

    console.log("All data fetched successfully")
  } catch (err) {
    error.value = err.message || "Failed to fetch data"
    console.error("Error fetching data:", err)
  } finally {
    isLoading.value = false
  }
}

// Set up polling for leaderboard, wallet data, and mission updates
const setupPolling = () => {
  // Poll leaderboard every 30 seconds
  leaderboardInterval.value = setInterval(fetchLeaderboardData, 30000)

  // Poll wallet data every 60 seconds
  walletInterval.value = setInterval(fetchWalletData, 60000)
  
  // Poll for mission updates every 10 seconds
  missionCheckInterval.value = setInterval(checkForMissionUpdates, 10000)
}

// Clean up polling intervals
const cleanupPolling = () => {
  if (leaderboardInterval.value) {
    clearInterval(leaderboardInterval.value)
  }

  if (walletInterval.value) {
    clearInterval(walletInterval.value)
  }

  if (missionCheckInterval.value) {
    clearInterval(missionCheckInterval.value)
  }
}

const checkUrlForMissionCompletion = () => {
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search)

  // Check if the 'mission_completed' parameter exists
  if (urlParams.has('mission_completed')) {
    // Get the mission ID from the parameter
    const missionId = urlParams.get('mission_completed')

    // Log the mission ID
    console.log(`Mission completed: ${missionId}`)

    // Remove the 'mission_completed' parameter from the URL
    urlParams.delete('mission_completed')

    // Replace the current URL with the updated URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// Initialize component
onMounted(() => {
  // Check for URL parameters indicating mission completion
  checkUrlForMissionCompletion()

  // Fetch all data
  fetchAllData()

  // Set up polling
  setupPolling()
  
  // Also update the storage event listener in the onMounted function
  // Replace the existing storage event listener with this one
  window.addEventListener('storage', (event) => {
  if (event.key === 'purchase_completed') {
    console.log("Purchase completed event detected")
    
    // Prevent duplicate processing
    const purchaseId = event.newValue ? JSON.parse(event.newValue).purchaseId : null
    const processedPurchases = JSON.parse(localStorage.getItem('processedPurchases') || '[]')
    
    if (purchaseId && processedPurchases.includes(purchaseId)) {
      console.log(`Purchase ${purchaseId} already processed, skipping`)
      return
    }
    
    // Add to processed purchases
    if (purchaseId) {
      processedPurchases.push(purchaseId)
      localStorage.setItem('processedPurchases', JSON.stringify(processedPurchases))
    }
    
    // Get the event data
    let eventData = { event_type: 'ECO_PURCHASE' }
    try {
      if (event.newValue) {
        eventData = JSON.parse(event.newValue)
      }
    } catch (e) {
      console.error("Error parsing purchase event data:", e)
    }
    
    // Trigger mission update for purchase event
    triggerMissionUpdate(eventData.event_type || 'ECO_PURCHASE')
    
    // Clear the storage item
    localStorage.removeItem('purchase_completed')
  }
})
})

// Clean up when component is unmounted
onUnmounted(() => {
  cleanupPolling()
  
  // Remove event listeners
  window.removeEventListener('storage', () => {})
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

/* Add animation class for progress bar */
.animate-progress {
  transition: width 2s ease-out;
}

/* Add highlight for recently updated progress bars */
.progress-updated {
  background-color: #704116;
  animation: pulse-progress 2s ease-in-out;
}

@keyframes pulse-progress {
  0% { background-color: #bb9d78; }
  50% { background-color: #704116; }
  100% { background-color: #bb9d78; }
}

.mission-date {
  font-size: 0.75rem;
  color: #777;
  margin-top: 0.5rem;
}

.mission-instruction {
  font-size: 0.75rem;
  color: #704116;
  margin-top: 0.5rem;
  font-style: italic;
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

/* Purchase Success Notification */
.purchase-success {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background-color: #2e7d32;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 100;
}

.purchase-success.show {
  transform: translateX(0);
  opacity: 1;
}

.purchase-success-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.purchase-success-icon {
  color: white;
  width: 2rem;
  height: 2rem;
}

.purchase-success-text {
  display: flex;
  flex-direction: column;
}

.purchase-success-title {
  font-weight: 600;
  font-size: 1rem;
}

.purchase-success-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>