// Utility functions for the medical center application
const Utils = {
  // Date formatting functions
  formatDate: (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return date.toLocaleDateString("pt-BR", options)
  },

  formatDateShort: (date) => date.toLocaleDateString("pt-BR"),

  formatTime: (date) =>
    date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),

  formatDateTime: (date) => date.toLocaleString("pt-BR"),

  // Calculate age from birth date
  calculateAge: (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  },

  // Calculate experience time
  calculateExperience: (firstDate) => {
    const today = new Date()
    const first = new Date(firstDate)
    const diffTime = Math.abs(today - first)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} dias`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? "mês" : "meses"}`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} ${years === 1 ? "ano" : "anos"}`
    }
  },

  // Format currency
  formatCurrency: (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value),

  // Format phone number
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  },

  // Generate random ID
  generateId: () => Date.now() + Math.random().toString(36).substr(2, 9),

  // Get initials from name
  getInitials: (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join(""),

  // Debounce function
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Show notification
  showNotification: function (message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `

    // Add to page
    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)

    // Close button functionality
    notification.querySelector(".notification-close").addEventListener("click", () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    })
  },

  getNotificationIcon: (type) => {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  // Validate phone
  validatePhone: (phone) => {
    const cleaned = phone.replace(/\D/g, "")
    return cleaned.length >= 10 && cleaned.length <= 11
  },

  // Validate CPF
  validateCPF: (cpf) => {
    cpf = cpf.replace(/\D/g, "")

    if (cpf.length !== 11) return false

    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(cpf)) return false

    // Validate check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cpf.charAt(10))) return false

    return true
  },

  // Format CPF
  formatCPF: (cpf) => {
    const cleaned = cpf.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
    }
    return cpf
  },

  // Get relative time
  getRelativeTime: function (date) {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "agora"
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return this.formatDateShort(date)
  },

  // Storage helpers
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (e) {
        console.error("Error saving to localStorage:", e)
      }
    },

    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch (e) {
        console.error("Error reading from localStorage:", e)
        return defaultValue
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error("Error removing from localStorage:", e)
      }
    },
  },

  // Animation helpers
  fadeIn: (element, duration = 300) => {
    element.style.opacity = 0
    element.style.display = "block"

    const start = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)

      element.style.opacity = progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  },

  fadeOut: (element, duration = 300) => {
    const start = performance.now()
    const startOpacity = Number.parseFloat(getComputedStyle(element).opacity)

    function animate(currentTime) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)

      element.style.opacity = startOpacity * (1 - progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.style.display = "none"
      }
    }

    requestAnimationFrame(animate)
  },

  // DOM helpers
  createElement: (tag, className, innerHTML) => {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (innerHTML) element.innerHTML = innerHTML
    return element
  },

  // Event helpers
  on: (element, event, handler) => {
    element.addEventListener(event, handler)
  },

  off: (element, event, handler) => {
    element.removeEventListener(event, handler)
  },

  // Query helpers
  $: (selector) => document.querySelector(selector),

  $$: (selector) => document.querySelectorAll(selector),
}

// Add notification styles if not already present
if (!document.querySelector("#notification-styles")) {
  const style = document.createElement("style")
  style.id = "notification-styles"
  style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .notification-success {
            border-left: 4px solid var(--green-500);
        }

        .notification-error {
            border-left: 4px solid var(--red-500);
        }

        .notification-warning {
            border-left: 4px solid var(--yellow-500);
        }

        .notification-info {
            border-left: 4px solid var(--blue-500);
        }

        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--slate-400);
            padding: 4px;
        }

        .notification-close:hover {
            color: var(--slate-600);
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `
  document.head.appendChild(style)
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Utils
}
