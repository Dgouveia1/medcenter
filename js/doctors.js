// Import necessary modules (assuming these are defined elsewhere)
import { Modals } from "./modals.js"
import { MedicalData } from "./medical-data.js"
import { Utils } from "./utils.js"
import { App } from "./app.js"
import { Agenda } from "./agenda.js"
import { Dashboard } from "./dashboard.js"

// Doctors functionality
const Doctors = {
  // Initialize doctors section
  init: function () {
    this.updateStats()
    this.renderDoctorsGrid()
    this.bindEvents()
  },

  // Bind doctors events
  bindEvents: () => {
    // New doctor button
    document.getElementById("newDoctorBtn").addEventListener("click", () => {
      Modals.openDoctorModal()
    })
  },

  // Update statistics
  updateStats: () => {
    const totalDoctors = MedicalData.doctors.length
    const totalSpecialties = new Set(MedicalData.doctors.map((d) => d.specialty)).size
    const totalOffices = new Set(MedicalData.doctors.map((d) => d.office)).size

    const totalDoctorsEl = document.getElementById("totalDoctors")
    const totalSpecialtiesEl = document.getElementById("totalSpecialties")
    const totalOfficesEl = document.getElementById("totalOffices")

    if (totalDoctorsEl) totalDoctorsEl.textContent = totalDoctors
    if (totalSpecialtiesEl) totalSpecialtiesEl.textContent = totalSpecialties
    if (totalOfficesEl) totalOfficesEl.textContent = totalOffices
  },

  // Render doctors grid
  renderDoctorsGrid: function () {
    const doctorsGrid = document.getElementById("doctorsGrid")
    if (!doctorsGrid) return

    doctorsGrid.innerHTML = ""

    MedicalData.doctors.forEach((doctor) => {
      const doctorCard = this.createDoctorCard(doctor)
      doctorsGrid.appendChild(doctorCard)
    })
  },

  // Create doctor card
  createDoctorCard: (doctor) => {
    const card = document.createElement("div")
    card.className = "doctor-card"

    const specialtyColors = {
      Cardiologia: "background-color: #fee2e2; color: #991b1b;",
      Dermatologia: "background-color: #dbeafe; color: #1e40af;",
      Pediatria: "background-color: #dcfce7; color: #166534;",
      Ortopedia: "background-color: #f3e8ff; color: #7c3aed;",
      "Clínico Geral": "background-color: #f1f5f9; color: #475569;",
      Ginecologia: "background-color: #fce7f3; color: #be185d;",
    }

    card.innerHTML = `
            <div class="doctor-header">
                <div class="doctor-avatar">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <span class="doctor-specialty" style="${specialtyColors[doctor.specialty] || ""}">
                        ${doctor.specialty}
                    </span>
                </div>
            </div>

            <div class="doctor-details">
                <div class="doctor-detail">
                    <i class="fas fa-id-card"></i>
                    <strong>CRM:</strong> ${doctor.crm}
                </div>
                ${
                  doctor.phone
                    ? `
                    <div class="doctor-detail">
                        <i class="fas fa-phone"></i>
                        ${doctor.phone}
                    </div>
                `
                    : ""
                }
                ${
                  doctor.email
                    ? `
                    <div class="doctor-detail">
                        <i class="fas fa-envelope"></i>
                        ${doctor.email}
                    </div>
                `
                    : ""
                }
                <div class="doctor-detail">
                    <i class="fas fa-building"></i>
                    ${doctor.office}
                </div>
                <div class="doctor-detail">
                    <i class="fas fa-clock"></i>
                    <strong>Horário:</strong><br>
                    ${doctor.schedule}
                </div>
                ${
                  doctor.consultationPrice
                    ? `
                    <div class="doctor-detail" style="background-color: var(--slate-50); padding: 12px; border-radius: 8px; margin-top: 8px;">
                        <i class="fas fa-dollar-sign"></i>
                        <strong>Consulta:</strong> ${Utils.formatCurrency(doctor.consultationPrice)}
                    </div>
                `
                    : ""
                }
            </div>

            <div class="doctor-actions">
                <button class="btn btn-outline btn-sm" onclick="Doctors.editDoctor(${doctor.id})">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-primary btn-sm" onclick="Doctors.viewDoctorSchedule(${doctor.id})">
                    <i class="fas fa-calendar"></i>
                    Ver Agenda
                </button>
            </div>
        `

    return card
  },

  // Edit doctor
  editDoctor: (doctorId) => {
    const doctor = MedicalData.doctors.find((d) => d.id === doctorId)
    if (doctor) {
      Modals.openDoctorModal(doctor)
    }
  },

  // View doctor schedule
  viewDoctorSchedule: (doctorId) => {
    const doctor = MedicalData.doctors.find((d) => d.id === doctorId)
    if (doctor) {
      // Switch to agenda section and filter by doctor
      App.showSection("agenda")

      // Set doctor filter
      const doctorFilter = document.getElementById("doctorFilter")
      const doctorKey = `dr_${doctor.name.toLowerCase().split(" ")[1]}`
      if (doctorFilter) {
        doctorFilter.value = doctorKey
        Agenda.selectedDoctor = doctorKey
        Agenda.renderScheduleGrid()
      }

      Utils.showNotification(`Mostrando agenda de ${doctor.name}`, "info")
    }
  },

  // Add new doctor
  addDoctor: function (doctorData) {
    const newDoctor = {
      id: Math.max(0, ...MedicalData.doctors.map((d) => d.id)) + 1,
      ...doctorData,
    }

    MedicalData.doctors.push(newDoctor)
    this.updateStats()
    this.renderDoctorsGrid()

    Dashboard.addActivity("Novo médico cadastrado", newDoctor.name, "doctor")

    Utils.showNotification("Médico cadastrado com sucesso!", "success")
  },

  // Update doctor
  updateDoctor: function (id, doctorData) {
    const index = MedicalData.doctors.findIndex((d) => d.id === id)
    if (index !== -1) {
      MedicalData.doctors[index] = { ...MedicalData.doctors[index], ...doctorData }
      this.updateStats()
      this.renderDoctorsGrid()

      Dashboard.addActivity("Médico atualizado", doctorData.name, "doctor")

      Utils.showNotification("Médico atualizado com sucesso!", "success")
    }
  },

  // Delete doctor
  deleteDoctor: function (id) {
    const doctor = MedicalData.doctors.find((d) => d.id === id)
    if (doctor && confirm(`Tem certeza que deseja excluir o médico ${doctor.name}?`)) {
      MedicalData.doctors = MedicalData.doctors.filter((d) => d.id !== id)

      // Also remove related appointments
      const doctorKey = `dr_${doctor.name.toLowerCase().split(" ")[1]}`
      MedicalData.appointments = MedicalData.appointments.filter((a) => a.doctor !== doctorKey)

      this.updateStats()
      this.renderDoctorsGrid()

      Dashboard.addActivity("Médico removido", doctor.name, "doctor")

      Utils.showNotification("Médico removido com sucesso!", "success")
    }
  },

  // Get doctor appointments
  getDoctorAppointments: (doctorId) => {
    const doctor = MedicalData.doctors.find((d) => d.id === doctorId)
    if (!doctor) return []

    const doctorKey = `dr_${doctor.name.toLowerCase().split(" ")[1]}`
    return MedicalData.appointments
      .filter((app) => app.doctor === doctorKey)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Doctors
}
