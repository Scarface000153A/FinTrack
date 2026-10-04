/**
 * FinTrack - Personal Finance & Currency Intelligence
 * Client-Side JavaScript Utilities, Theme Engine, PWA & Chart.js Integrations
 */

// Global chart references for live dynamic theme switching
let chartExpenseInstance = null;
let chartCashFlowInstance = null;
let lastChartData = null;

// ==================== THEME ENGINE (DARK / LIGHT MODE) ==================== //
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("fintrack_theme", nextTheme);

    // Update charts if they are currently loaded
    if (lastChartData) {
        initDashboardCharts(
            lastChartData.totalIncome,
            lastChartData.totalExpense,
            lastChartData.expenseLabels,
            lastChartData.expenseData,
            lastChartData.currencySymbol
        );
    }
}

// ==================== DROPDOWN HELPERS ==================== //
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // Close any other open dropdowns
    document.querySelectorAll(".dropdown-menu.show").forEach((el) => {
        if (el.id !== dropdownId) el.classList.remove("show");
    });

    dropdown.classList.toggle("show");
}

// Close dropdowns on outside click
document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-container")) {
        document.querySelectorAll(".dropdown-menu.show").forEach((el) => {
            el.classList.remove("show");
        });
    }
});

// ==================== FAQ ACCORDION (LANDING PAGE) ==================== //
function toggleFaq(btn) {
    const item = btn.closest(".faq-item");
    if (!item) return;

    const isActive = item.classList.contains("active");

    // Close all other FAQ items for clean accordion UX
    document.querySelectorAll(".faq-item.active").forEach((el) => {
        el.classList.remove("active");
    });

    if (!isActive) {
        item.classList.add("active");
    }
}

// ==================== MODAL HELPERS ==================== //
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function closeModalOnOutsideClick(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// Close modal on Escape key press
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.active").forEach((modal) => {
            closeModal(modal.id);
        });
    }
});

// ==================== PASSWORD VISIBILITY TOGGLE ==================== //
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");
    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// ==================== FORM VALIDATION ==================== //
function validateRegisterForm() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match! Please check and try again.");
        return false;
    }
    return true;
}

// ==================== ANIMATED DASHBOARD CARD (CONCENTRIC SVG DOTS) ==================== //
function initAnimatedDashboardCard() {
    const svgEl = document.getElementById("animated-dots-svg");
    if (!svgEl) return;

    const generateDots = (count, radius, centerX, centerY) => {
        const dots = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const x = Math.round((centerX + radius * Math.cos(angle)) * 1000) / 1000;
            const y = Math.round((centerY + radius * Math.sin(angle)) * 1000) / 1000;
            dots.push({ x, y, delay: i * 0.02 });
        }
        return dots;
    };

    const outerDots = generateDots(48, 185, 203, 200);
    const innerDots = generateDots(36, 155, 203, 200);

    svgEl.innerHTML = "";

    // Outer dots (#5A8CEF)
    outerDots.forEach((dot) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", dot.x);
        circle.setAttribute("cy", dot.y);
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "#5A8CEF");
        circle.classList.add("anim-dot", "dot-outer");
        circle.style.animationDelay = `${dot.delay}s`;
        svgEl.appendChild(circle);
    });

    // Inner dots (#4B7A63)
    innerDots.forEach((dot) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", dot.x);
        circle.setAttribute("cy", dot.y);
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "#4B7A63");
        circle.classList.add("anim-dot", "dot-inner");
        circle.style.animationDelay = `${0.2 + dot.delay}s`;
        svgEl.appendChild(circle);
    });
}

// ==================== DRAGGABLE WIDGET GRID (CUSTOMIZABLE DASHBOARD) ==================== //
function initDraggableWidgetGrid() {
    const grid = document.querySelector(".analytics-grid");
    if (!grid) return;

    const widgets = grid.querySelectorAll(".draggable-widget");
    if (!widgets.length) return;

    // 1. Restore saved order from localStorage if available
    const savedOrder = localStorage.getItem("fintrack_widget_order");
    if (savedOrder) {
        try {
            const orderIds = JSON.parse(savedOrder);
            orderIds.forEach((id) => {
                const widget = grid.querySelector(`[data-widget-id="${id}"]`);
                if (widget) grid.appendChild(widget);
            });
        } catch (e) {
            console.warn("Could not parse saved widget order", e);
        }
    }

    let draggedItem = null;

    widgets.forEach((widget) => {
        widget.setAttribute("draggable", "true");
        widget.classList.add("is-draggable");

        widget.addEventListener("dragstart", (e) => {
            draggedItem = widget;
            widget.classList.add("widget-dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", widget.getAttribute("data-widget-id") || "");
        });

        widget.addEventListener("dragend", () => {
            if (draggedItem) {
                draggedItem.classList.remove("widget-dragging");
                draggedItem = null;
            }
            grid.querySelectorAll(".draggable-widget").forEach((w) => {
                w.classList.remove("widget-drag-over");
            });

            // Save new order to localStorage
            const currentOrder = Array.from(grid.querySelectorAll(".draggable-widget")).map((w) =>
                w.getAttribute("data-widget-id")
            );
            localStorage.setItem("fintrack_widget_order", JSON.stringify(currentOrder));
        });

        widget.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (widget !== draggedItem) {
                widget.classList.add("widget-drag-over");
            }
        });

        widget.addEventListener("dragleave", () => {
            widget.classList.remove("widget-drag-over");
        });

        widget.addEventListener("drop", (e) => {
            e.preventDefault();
            widget.classList.remove("widget-drag-over");

            if (draggedItem && draggedItem !== widget) {
                const children = Array.from(grid.children);
                const draggedIdx = children.indexOf(draggedItem);
                const targetIdx = children.indexOf(widget);

                if (draggedIdx < targetIdx) {
                    widget.after(draggedItem);
                } else {
                    widget.before(draggedItem);
                }
            }
        });
    });
}

function resetWidgetLayout() {
    localStorage.removeItem("fintrack_widget_order");
    window.location.reload();
}

// ==================== DOM READY INITIALIZATION ==================== //
document.addEventListener("DOMContentLoaded", () => {
    // 0. Initialize Animated Concentric Dots Card & Draggable Grid
    initAnimatedDashboardCard();
    initDraggableWidgetGrid();

    // 1. Auto-dismiss flash alerts after 6 seconds
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
        setTimeout(() => {
            alert.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            alert.style.opacity = "0";
            alert.style.transform = "translateY(-10px)";
            setTimeout(() => alert.remove(), 500);
        }, 6000);
    });

    // 2. Animate progress bars cleanly from data-progress attributes
    document.querySelectorAll(".progress-bar-fill[data-progress]").forEach((bar) => {
        const rawProgress = parseFloat(bar.getAttribute("data-progress")) || 0;
        const progress = Math.min(100, Math.max(0, rawProgress));
        bar.style.width = progress + "%";
    });

    // 3. Initialize Dashboard Charts from API (Zero Jinja in JS!)
    const analyticsEl = document.getElementById("dashboard-analytics");
    if (analyticsEl) {
        const totalIncome = parseFloat(analyticsEl.getAttribute("data-income")) || 0;
        const totalExpense = parseFloat(analyticsEl.getAttribute("data-expense")) || 0;
        const currency = analyticsEl.getAttribute("data-currency") || "₹";

        fetch("/api/chart-data")
            .then((res) => res.json())
            .then((data) => {
                const expenseLabels = data.expense.map((item) => item.category);
                const expenseData = data.expense.map((item) => item.total);
                initDashboardCharts(totalIncome, totalExpense, expenseLabels, expenseData, currency);
            })
            .catch((err) => {
                console.error("Error loading chart data:", err);
            });
    }

    // 4. Register Progressive Web App (PWA) Service Worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/static/sw.js")
                .then((registration) => {
                    console.log("FinTrack PWA Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.log("FinTrack Service Worker registration failed:", error);
                });
        });
    }
});

// ==================== DASHBOARD CHARTS (Chart.js) ==================== //
function initDashboardCharts(totalIncome, totalExpense, expenseLabels, expenseData, currencySymbol) {
    // Save state for dynamic theme redraws
    lastChartData = { totalIncome, totalExpense, expenseLabels, expenseData, currencySymbol };

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9";
    const doughnutBorderColor = isDark ? "#1e293b" : "#ffffff";

    // 1. Expense Breakdown Doughnut Chart
    const expenseCanvas = document.getElementById("expenseCategoryChart");
    if (expenseCanvas && expenseLabels.length > 0) {
        if (chartExpenseInstance) {
            chartExpenseInstance.destroy();
        }

        const colorPalette = [
            "#2563eb", "#0284c7", "#0d9488", "#10b981", 
            "#84cc16", "#eab308", "#f97316", "#e11d48", 
            "#475569", "#64748b"
        ];

        chartExpenseInstance = new Chart(expenseCanvas, {
            type: "doughnut",
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseData,
                    backgroundColor: colorPalette.slice(0, expenseLabels.length),
                    borderWidth: 2,
                    borderColor: doughnutBorderColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                            boxWidth: 14,
                            padding: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || "";
                                const value = context.parsed || 0;
                                return ` ${label}: ${currencySymbol}${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    // 2. Cash Flow Comparison Bar Chart
    const cashFlowCanvas = document.getElementById("cashFlowChart");
    if (cashFlowCanvas && (totalIncome > 0 || totalExpense > 0)) {
        if (chartCashFlowInstance) {
            chartCashFlowInstance.destroy();
        }

        chartCashFlowInstance = new Chart(cashFlowCanvas, {
            type: "bar",
            data: {
                labels: ["Income (+)", "Expenses (-)"],
                datasets: [{
                    label: "Total Amount",
                    data: [totalIncome, totalExpense],
                    backgroundColor: [
                        "rgba(16, 185, 129, 0.85)", // Emerald for income
                        "rgba(239, 68, 68, 0.85)"   // Rose for expense
                    ],
                    borderColor: [
                        "#10b981",
                        "#ef4444"
                    ],
                    borderWidth: 1.5,
                    borderRadius: 8,
                    maxBarThickness: 60
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` Total: ${currencySymbol}${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return currencySymbol + value.toLocaleString();
                            },
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 }
                        }
                    }
                }
            }
        });
    }
}