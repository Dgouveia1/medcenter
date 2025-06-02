// Dashboard functionality
const Dashboard = {
  // Initialize dashboard
  init: function () {
    this.updateMetrics()
    this.updateActivityList()
    this.bindEvents()
  },

  // Update dashboard metrics
  updateMetrics: function () {
    const metrics = this.calculateMetrics()

    // Update metric values
    document.getElementById("todayAppointments").textContent = metrics.todayAppointments
    document.getElementById("weekAppointments").textContent = metrics.weekAppointments
    document.getElementById("occupancyRate").textContent = metrics.occupancyRate + "%"
    document.getElementById("newPatients").textContent = metrics.newPatients
    document.getElementById("revenue").textContent = Utils.formatCurrency(metrics.revenue)
    document.getElementById("pendingAppointments").textContent = metrics.pendingAppointments
  },

  // Calculate metrics from data
  calculateMetrics: () => {
    const today = new Date().toISOString().split("T")[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Today's appointments
    const todayAppointments = MedicalData.appointments.filter(
      (app) => app.date === today && app.status !== "cancelado",
    ).length

    // Week's appointments
    const weekAppointments = MedicalData.appointments.filter((app) => {
      const appDate = new Date(app.date)
      return appDate >= weekStart && appDate <= weekEnd && app.status !== "cancelado"
    }).length

    // Occupancy rate (assuming 20 slots per day, 5 days a week)
    const totalSlots = 20 * 5
    const occupiedSlots = weekAppointments
    const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100)

    // New patients this month
    const monthStart = new Date()
    monthStart.setDate(1)
    const newPatients = MedicalData.patients.filter((patient) => {
      const firstDate = new Date(patient.firstExperience)
      return firstDate >= monthStart
    }).length

    // Revenue (completed appointments)
    const revenue = MedicalData.appointments
      .filter((app) => app.status === "concluido" && app.price)
      .reduce((sum, app) => sum + app.price, 0)

    // Pending appointments
    const pendingAppointments = MedicalData.appointments.filter((app) => app.status === "pendente").length

    return {
      todayAppointments,
      weekAppointments,
      occupancyRate,
      newPatients,
      revenue,
      pendingAppointments,
    }
  },

  // Update activity list
  updateActivityList: () => {
    const activityList = document.getElementById("activityList")
    if (!activityList) return

    activityList.innerHTML = ""

    MedicalData.activities.forEach((activity) => {
      const activityItem = document.createElement("div")
      activityItem.className = "activity-item"
      activityItem.innerHTML = `
                <div class="activity-icon"></div>
                <div class="activity-content">
                    <div class="activity-title">${activity.action}</div>
                    <div class="activity-description">
                        ${activity.description} • ${Utils.getRelativeTime(activity.timestamp)}
                    </div>
                </div>
            `
      activityList.appendChild(activityItem)
    })
  },

  // Bind dashboard events
  bindEvents: function () {
    const refreshBtn = document.getElementById("refreshDashboard")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.refresh()
      })
    }
  },

  // Refresh dashboard data
  refresh: function () {
    Utils.showNotification("Atualizando dados...", "info")

    // Simulate API call delay
    setTimeout(() => {
      this.updateMetrics()
      this.updateActivityList()
      Charts.init() // Reinitialize charts
      Utils.showNotification("Dados atualizados com sucesso!", "success")
    }, 1000)
  },

  // Add new activity
  addActivity: function (action, description, type = "info") {
    const newActivity = {
      id: Utils.generateId(),
      action: action,
      description: description,
      timestamp: new Date(),
      type: type,
    }

    MedicalData.activities.unshift(newActivity)

    // Keep only last 10 activities
    if (MedicalData.activities.length > 10) {
      MedicalData.activities = MedicalData.activities.slice(0, 10)
    }

    this.updateActivityList()
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Dashboard
}
