import { Chart } from "@/components/ui/chart"
// Charts functionality for the medical center application
const Charts = {
  // Initialize all charts
  init: function () {
    this.initSpecialtyChart()
    this.initRevenueChart()
    this.initInsuranceChart()
  },

  // Specialty distribution chart
  initSpecialtyChart: () => {
    const ctx = document.getElementById("specialtyChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Cardiologia", "Dermatologia", "Pediatria", "Ortopedia"],
        datasets: [
          {
            data: [35, 25, 20, 20],
            backgroundColor: [
              "#f97316", // Orange
              "#3b82f6", // Blue
              "#22c55e", // Green
              "#8b5cf6", // Purple
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => context.label + ": " + context.parsed + "%",
            },
          },
        },
        cutout: "60%",
      },
    })
  },

  // Revenue chart
  initRevenueChart: () => {
    const ctx = document.getElementById("revenueChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
        datasets: [
          {
            label: "Faturamento",
            data: [4200, 3800, 4500, 5000, 5300, 2500, 1200],
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#f97316",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => "R$ " + context.parsed.y.toLocaleString("pt-BR"),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "R$ " + value.toLocaleString("pt-BR"),
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    })
  },

  // Insurance distribution chart
  initInsuranceChart: () => {
    const ctx = document.getElementById("insuranceChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Unimed", "Amil", "SulAmérica", "Bradesco", "Particular"],
        datasets: [
          {
            label: "Pacientes",
            data: [45, 32, 18, 12, 25],
            backgroundColor: ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#64748b"],
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => context.parsed.y + " pacientes",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    })
  },

  // Update chart data
  updateChart: (chartId, newData) => {
    const chart = Chart.getChart(chartId)
    if (chart) {
      chart.data = newData
      chart.update()
    }
  },

  // Destroy chart
  destroyChart: (chartId) => {
    const chart = Chart.getChart(chartId)
    if (chart) {
      chart.destroy()
    }
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = Charts
}
