// Modals functionality
const Modals = {
    currentTags: [],

    // Initialize modals
    init: function() {
        this.bindEvents();
    },

    // Bind modal events
    bindEvents: function() {
        // Close modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Close modal on overlay click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Form submissions
        this.bindFormEvents();
    },

    // Bind form events
    bindFormEvents: function() {
        // Appointment form
        const appointmentForm = document.getElementById('appointmentForm');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAppointmentSubmit();
            });
        }

        // Patient form
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePatientSubmit();
            });
        }

        // Tag input
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(e.target.value.trim());
                    e.target.value = '';
                }
            });
        }

        // Cancel buttons
        document.getElementById('cancelAppointment')?.addEventListener('click', () => {
            this.closeModal(document.getElementById('appointmentModal'));
        });

        document.getElementById('cancelPatient')?.addEventListener('click', () => {
            this.closeModal(document.getElementById('patientModal'));
        });
    },

    // Open appointment modal
    openAppointmentModal: function(appointmentId = null, doctorId = null, time = null) {
        const modal = document.getElementById('appointmentModal');
        const form = document.getElementById('appointmentForm');
        const title = document.getElementById('appointmentModalTitle');

        // Reset form
        form.reset();
        this.populateTimeSlots();

        if (appointmentId) {
            // Edit mode
            const appointment = MedicalData.appointments.find(a => a.id === appointmentId);
            if\
