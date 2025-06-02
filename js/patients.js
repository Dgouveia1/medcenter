// Patients functionality
import { MedicalData } from "./medical-data.js"
import { Utils } from "./utils.js"
import { Modals } from "./modals.js"
import { Dashboard } from "./dashboard.js"

const Patients = {
  filteredPatients: [],
  currentFilter: "all",
  searchTerm: "",

  // Initialize patients section
  init: function () {
    this.filteredPatients = [...MedicalData.patients]
    this.renderFilterTags()
    this.renderPatientsGrid()
    this.bindEvents()
  },

  // Bind patients events
  bindEvents: function () {
    // Search input
    const searchInput = document.getElementById("patientSearch")
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce((e) => {
          this.searchTerm = e.target.value.toLowerCase()
          this.filterPatients()
        }, 300),
      )
    }

    // New patient button
    document.getElementById("newPatientBtn").addEventListener("click", () => {
      Modals.openPatientModal()
    })
  },

  // Render filter tags
  renderFilterTags: function () {
    const filtersContainer = document.getElementById("patientFilters")
    if (!filtersContainer) return

    // Get all unique tags
    const allTags = new Set()
    MedicalData.patients.forEach((patient) => {
      patient.tags.forEach((tag) => allTags.add(tag))
    })

    filtersContainer.innerHTML = ""

    // Add "All" filter
    const allFilter = document.createElement("div")
    allFilter.className = "filter-tag active"
    allFilter.textContent = "Todos"
    allFilter.dataset.tag = "all"
    allFilter.addEventListener("click", () => this.setFilter("all"))
    filtersContainer.appendChild(allFilter)

    // Add tag filters
    Array.from(allTags)
      .sort()
      .forEach((tag) => {
        const filterTag = document.createElement("div")
        filterTag.className = "filter-tag"
        filterTag.textContent = tag
        filterTag.dataset.tag = tag
        filterTag.addEventListener("click", () => this.setFilter(tag))
        filtersContainer.appendChild(filterTag)
      })
  },

  // Set filter
  setFilter: function (filter) {
    this.currentFilter = filter

    // Update filter tag appearance
    document.querySelectorAll(".filter-tag").forEach((tag) => {
      tag.classList.toggle("active", tag.dataset.tag === filter)
    })

    this.filterPatients()
  },

  // Filter patients
  filterPatients: function () {
    this.filteredPatients = MedicalData.patients.filter((patient) => {
      const matchesSearch =
        !this.searchTerm ||
        patient.name.toLowerCase().includes(this.searchTerm) ||
        patient.phone.includes(this.searchTerm)

      const matchesFilter = this.currentFilter === "all" || patient.tags.includes(this.currentFilter)

      return matchesSearch && matchesFilter
    })

    this.renderPatientsGrid()
  },

  // Render patients grid
  renderPatientsGrid: function () {
    const patientsGrid = document.getElementById("patientsGrid")
    if (!patientsGrid) return

    patientsGrid.innerHTML = ""

    if (this.filteredPatients.length === 0) {
      patientsGrid.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: var(--slate-300); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--slate-600); margin-bottom: 8px;">Nenhum paciente encontrado</h3>
                    <p style="color: var(--slate-500);">Tente ajustar os filtros ou adicionar um novo paciente.</p>
                </div>
            `
      return
    }

    this.filteredPatients.forEach((patient) => {
      const patientCard = this.createPatientCard(patient)
      patientsGrid.appendChild(patientCard)
    })
  },

  // Create patient card
  createPatientCard: (patient) => {
    const card = document.createElement("div")
    card.className = "patient-card"

    const age = Utils.calculateAge(patient.birthDate)
    const experience = Utils.calculateExperience(patient.firstExperience)

    card.innerHTML = `
            <div class="patient-header">
                <div class="patient-avatar">
                    ${Utils.getInitials(patient.name)}
                </div>
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>${patient.insurance || "Particular"}</p>
                </div>
            </div>

            <div class="patient-details">
                <div class="patient-detail">
                    <i class="fas fa-phone"></i>
                    <span>${patient.phone}</span>
                </div>
                ${
                  patient.email
                    ? `
                    <div class="patient-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${patient.email}</span>
                    </div>
                `
                    : ""
                }
                <div class="patient-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${patient.city}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${age} anos</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Paciente há ${experience}</span>
                </div>
            </div>

            ${
              patient.tags.length > 0
                ? `
                <div class="patient-tags">
                    ${patient.tags.map((tag) => `<span class="patient-tag">${tag}</span>`).join("")}
                </div>
            `
                : ""
            }

            <div class="patient-actions">
                <button class="btn btn-outline btn-sm" onclick="Patients.viewPatientDetails(${patient.id})">
                    <i class="fas fa-eye"></i>
                    Detalhes
                </button>
                <button class="btn btn-primary btn-sm" onclick="Patients.editPatient(${patient.id})">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
            </div>
        `

    return card
  },

  // View patient details
  viewPatientDetails: (patientId) => {
    const patient = MedicalData.patients.find((p) => p.id === patientId)
    if (patient) {
      Modals.openPatientDetailsModal(patient)
    }
  },

  // Edit patient
  editPatient: (patientId) => {
    const patient = MedicalData.patients.find((p) => p.id === patientId)
    if (patient) {
      Modals.openPatientModal(patient)
    }
  },

  // Add new patient
  addPatient: function (patientData) {
    const newPatient = {
      id: Math.max(0, ...MedicalData.patients.map((p) => p.id)) + 1,
      ...patientData,
    }

    MedicalData.patients.push(newPatient)
    this.renderFilterTags()
    this.filterPatients()

    Dashboard.addActivity("Novo paciente cadastrado", newPatient.name, "patient")

    Utils.showNotification("Paciente cadastrado com sucesso!", "success")
  },

  // Update patient
  updatePatient: function (id, patientData) {
    const index = MedicalData.patients.findIndex((p) => p.id === id)
    if (index !== -1) {
      MedicalData.patients[index] = { ...MedicalData.patients[index], ...patientData }
      this.renderFilterTags()
      this.filterPatients()

      Dashboard.addActivity("Paciente atualizado", patientData.name, "patient")

      Utils.showNotification("Paciente atualizado com sucesso!", "success")
    }
  },

  // Delete patient
  deletePatient: function (id) {
    const patient = MedicalData.patients.find((p) => p.id === id)
    if (patient && confirm(`Tem certeza que deseja excluir o paciente ${patient.name}?`)) {
      MedicalData.patients = MedicalData.patients.filter((p) => p.id !== id)

      // Also remove related appointments
      MedicalData.appointments = MedicalData.appointments.filter((a) => a.patientId !== id)

      this.renderFilterTags()
      this.filterPatients()

      Dashboard.addActivity("Paciente removido", patient.name, "patient")

      Utils.showNotification("Paciente removido com sucesso!", "success")
    }
  },

  // Get patient appointments
  getPatientAppointments: (patientId) =>
    MedicalData.appointments
      .filter((app) => app.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Patients
}
