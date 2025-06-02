// Agenda functionality
const Agenda = {
  currentDate: new Date(),
  selectedDoctor: "all",

  // Initialize agenda
  init: function () {
    this.updateDateDisplay()
    this.renderSpecialtyGrid()
    this.renderScheduleGrid()
    this.bindEvents()
  },

  // Bind agenda events
  bindEvents: function () {
    // Date navigation
    document.getElementById("prevDay").addEventListener("click", () => {
      this.navigateDate(-1)
    })

    document.getElementById("nextDay").addEventListener("click", () => {
      this.navigateDate(1)
    })

    // Doctor filter
    document.getElementById("doctorFilter").addEventListener("change", (e) => {
      this.selectedDoctor = e.target.value
      this.renderScheduleGrid()
    })

    // New appointment button
    document.getElementById("newAppointmentBtn").addEventListener("click", () => {
      Modals.openAppointmentModal()
    })
  },

  // Navigate date
  navigateDate: function (direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction)
    this.updateDateDisplay()
    this.renderSpecialtyGrid()
    this.renderScheduleGrid()
  },

  // Update date display
  updateDateDisplay: function () {
    const dateDisplay = document.getElementById("currentDate")
    if (dateDisplay) {
      dateDisplay.textContent = Utils.formatDate(this.currentDate)
    }
  },

  // Render specialty summary grid
  renderSpecialtyGrid: function () {
    const specialtyGrid = document.getElementById("specialtyGrid")
    if (!specialtyGrid) return

    const currentDateStr = this.currentDate.toISOString().split("T")[0]
    const dayAppointments = MedicalData.appointments.filter(
      (app) => app.date === currentDateStr && app.status !== "cancelado",
    )

    const specialtyCounts = {
      cardiologia: dayAppointments.filter((a) => a.service === "cardiologia").length,
      dermatologia: dayAppointments.filter((a) => a.service === "dermatologia").length,
      pediatria: dayAppointments.filter((a) => a.service === "pediatria").length,
      ortopedia: dayAppointments.filter((a) => a.service === "ortopedia").length,
    }

    specialtyGrid.innerHTML = ""

    Object.entries(specialtyCounts).forEach(([specialty, count]) => {
      const card = document.createElement("div")
      card.className = "specialty-card"
      card.innerHTML = `
                <div class="specialty-count">${count}</div>
                <div class="specialty-name">${specialty}</div>
            `
      specialtyGrid.appendChild(card)
    })
  },

  // Render schedule grid
  renderScheduleGrid: function () {
    const scheduleGrid = document.getElementById("scheduleGrid")
    if (!scheduleGrid) return

    const doctors = MedicalData.doctors
    const currentDateStr = this.currentDate.toISOString().split("T")[0]
    const dayAppointments = MedicalData.appointments.filter(
      (app) => app.date === currentDateStr && (this.selectedDoctor === "all" || app.doctor === this.selectedDoctor),
    )

    // Clear grid
    scheduleGrid.innerHTML = ""

    // Create header
    const headerTime = document.createElement("div")
    headerTime.className = "schedule-header"
    headerTime.textContent = "Horário"
    scheduleGrid.appendChild(headerTime)

    doctors.forEach((doctor) => {
      if (this.selectedDoctor === "all" || this.selectedDoctor === `dr_${doctor.name.toLowerCase().split(" ")[1]}`) {
        const headerDoctor = document.createElement("div")
        headerDoctor.className = "schedule-header"
        headerDoctor.innerHTML = `
                    <div>${doctor.name}</div>
                    <div style="font-size: 12px; font-weight: normal; opacity: 0.7;">${doctor.specialty}</div>
                `
        scheduleGrid.appendChild(headerDoctor)
      }
    })

    // Create time slots
    MedicalData.timeSlots.forEach((time) => {
      // Time column
      const timeSlot = document.createElement("div")
      timeSlot.className = "time-slot"
      timeSlot.textContent = time
      scheduleGrid.appendChild(timeSlot)

      // Doctor columns
      doctors.forEach((doctor) => {
        const doctorId = `dr_${doctor.name.toLowerCase().split(" ")[1]}`

        if (this.selectedDoctor === "all" || this.selectedDoctor === doctorId) {
          const appointmentSlot = document.createElement("div")
          appointmentSlot.className = "appointment-slot"
          appointmentSlot.dataset.time = time
          appointmentSlot.dataset.doctor = doctorId

          // Find appointment for this slot
          const appointment = dayAppointments.find((app) => app.doctor === doctorId && app.time === time)

          if (appointment) {
            appointmentSlot.classList.add("has-appointment")
            appointmentSlot.innerHTML = `
                            <div class="appointment ${appointment.status}" data-id="${appointment.id}">
                                <div class="appointment-name">${appointment.patientName}</div>
                                <div class="appointment-service">${appointment.service}</div>
                            </div>
                        `

            // Add click event to appointment
            appointmentSlot.querySelector(".appointment").addEventListener("click", (e) => {
              e.stopPropagation()
              Modals.openAppointmentModal(appointment.id)
            })
          } else {
            // Empty slot - allow creating new appointment
            appointmentSlot.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--slate-400); cursor: pointer;">
                                <i class="fas fa-plus"></i>
                            </div>
                        `

            appointmentSlot.addEventListener("click", () => {
              Modals.openAppointmentModal(null, doctorId, time)
            })
          }

          scheduleGrid.appendChild(appointmentSlot)
        }
      })
    })

    // Update grid columns based on visible doctors
    const visibleDoctors = this.selectedDoctor === "all" ? doctors.length : 1
    scheduleGrid.style.gridTemplateColumns = `80px repeat(${visibleDoctors}, 1fr)`
  },

  // Get appointments for date
  getAppointmentsForDate: (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return MedicalData.appointments.filter((app) => app.date === dateStr)
  },

  // Add new appointment
  addAppointment: function (appointmentData) {
    const newAppointment = {
      id: Math.max(0, ...MedicalData.appointments.map((a) => a.id)) + 1,
      ...appointmentData,
      date: this.currentDate.toISOString().split("T")[0],
    }

    MedicalData.appointments.push(newAppointment)
    this.renderSpecialtyGrid()
    this.renderScheduleGrid()

    Dashboard.addActivity(
      "Nova consulta agendada",
      `${appointmentData.patientName} - ${appointmentData.service}`,
      "appointment",
    )

    Utils.showNotification("Consulta agendada com sucesso!", "success")
  },

  // Update appointment
  updateAppointment: function (id, appointmentData) {
    const index = MedicalData.appointments.findIndex((a) => a.id === id)
    if (index !== -1) {
      MedicalData.appointments[index] = { ...MedicalData.appointments[index], ...appointmentData }
      this.renderSpecialtyGrid()
      this.renderScheduleGrid()

      Dashboard.addActivity(
        "Consulta atualizada",
        `${appointmentData.patientName} - ${appointmentData.service}`,
        "appointment",
      )

      Utils.showNotification("Consulta atualizada com sucesso!", "success")
    }
  },

  // Delete appointment
  deleteAppointment: function (id) {
    const appointment = MedicalData.appointments.find((a) => a.id === id)
    if (appointment) {
      MedicalData.appointments = MedicalData.appointments.filter((a) => a.id !== id)
      this.renderSpecialtyGrid()
      this.renderScheduleGrid()

      Dashboard.addActivity("Consulta cancelada", `${appointment.patientName} - ${appointment.service}`, "appointment")

      Utils.showNotification("Consulta cancelada com sucesso!", "success")
    }
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Agenda
}

// Mock Modals, Utils, MedicalData, and Dashboard for testing purposes
const Modals = {
  openAppointmentModal: (appointmentId, doctorId, time) => {
    console.log("Modals.openAppointmentModal called with:", appointmentId, doctorId, time)
  },
}

const Utils = {
  formatDate: (date) => date.toLocaleDateString(),
  showNotification: (message, type) => {
    console.log("Utils.showNotification called with:", message, type)
  },
}

const MedicalData = {
  appointments: [],
  doctors: [],
  timeSlots: [],
}

const Dashboard = {
  addActivity: (activity, details, type) => {
    console.log("Dashboard.addActivity called with:", activity, details, type)
  },
}
