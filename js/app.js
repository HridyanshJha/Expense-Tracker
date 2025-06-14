// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.querySelector('i').classList.toggle('fa-bars');
        navToggle.querySelector('i').classList.toggle('fa-times');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.querySelector('i').classList.add('fa-bars');
            navToggle.querySelector('i').classList.remove('fa-times');
        }
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                navMenu.classList.remove('active');
                navToggle.querySelector('i').classList.add('fa-bars');
                navToggle.querySelector('i').classList.remove('fa-times');

                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Highlight active section on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

// Expense Tracker App
const App = (() => {
    // State
    let transactions = [];
    let charts = {
        bar: null,
        pie: null
    };

    // Category Icons
    const categoryIcons = {
        salary: 'fa-money-bill-wave',
        food: 'fa-utensils',
        transport: 'fa-car',
        entertainment: 'fa-film',
        utilities: 'fa-bolt',
        other: 'fa-ellipsis-h'
    };

    // DOM Elements
    const elements = {
        form: document.getElementById('transaction-form'),
        type: document.getElementById('transaction-type'),
        title: document.getElementById('transaction-title'),
        amount: document.getElementById('transaction-amount'),
        date: document.getElementById('transaction-date'),
        category: document.getElementById('transaction-category'),
        tableBody: document.getElementById('transactions-body'),
        totalBalance: document.getElementById('total-balance'),
        totalIncome: document.getElementById('total-income'),
        totalExpense: document.getElementById('total-expense'),
        monthSelect: document.getElementById('month-select'),
        yearSelect: document.getElementById('year-select'),
        monthlyIncome: document.getElementById('monthly-income'),
        monthlyExpense: document.getElementById('monthly-expense'),
        monthlyBalance: document.getElementById('monthly-balance'),
        topCategories: document.getElementById('top-categories-list'),
        resetBtn: document.getElementById('reset-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        barChart: document.getElementById('bar-chart'),
        pieChart: document.getElementById('pie-chart')
    };

    // Initialize the app
    function init() {
        loadTransactions();
        setupEventListeners();
        populateDateSelects();
        updateUI();
    }

    // Load transactions from localStorage
    function loadTransactions() {
        const stored = localStorage.getItem('transactions');
        transactions = stored ? JSON.parse(stored) : [];
    }

    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Setup event listeners
    function setupEventListeners() {
        elements.form.addEventListener('submit', handleFormSubmit);
        elements.resetBtn.addEventListener('click', resetApp);
        elements.themeToggle.addEventListener('click', toggleDarkMode);
        elements.monthSelect.addEventListener('change', updateMonthlySummary);
        elements.yearSelect.addEventListener('change', updateMonthlySummary);
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();

        const transaction = {
            id: Date.now(),
            type: elements.type.value,
            title: elements.title.value,
            amount: parseFloat(elements.amount.value),
            date: elements.date.value,
            category: elements.category.value
        };

        addTransaction(transaction);
        elements.form.reset();
    }

    // Add new transaction
    function addTransaction(transaction) {
        transactions.push(transaction);
        saveTransactions();
        updateUI();
    }

    // Delete transaction
    function deleteTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateUI();
    }

    // Update all UI elements
    function updateUI() {
        renderTransactions();
        updateSummary();
        updateMonthlySummary();
        renderCharts();
    }

    // Render transactions table
    function renderTransactions() {
        elements.tableBody.innerHTML = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((t, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${t.title}</td>
                    <td>
                        <span class="transaction-type ${t.type}">
                            <i class="fas ${t.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            ${t.type}
                        </span>
                    </td>
                    <td class="${t.type === 'income' ? 'income' : 'expense'}">
                        ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                    </td>
                    <td>${formatDate(t.date)}</td>
                    <td>
                        <span class="category-badge">
                            <i class="fas ${categoryIcons[t.category]}"></i>
                            ${t.category}
                        </span>
                    </td>
                    <td>
                        <button onclick="App.deleteTransaction(${t.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // Update summary totals
    function updateSummary() {
        const totals = transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });

        elements.totalIncome.textContent = `$${totals.income.toFixed(2)}`;
        elements.totalExpense.textContent = `$${totals.expense.toFixed(2)}`;
        elements.totalBalance.textContent = `$${(totals.income - totals.expense).toFixed(2)}`;
    }

    // Update monthly summary
    function updateMonthlySummary() {
        const month = elements.monthSelect.value;
        const year = elements.yearSelect.value;

        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === parseInt(month) && 
                   date.getFullYear() === parseInt(year);
        });

        const totals = monthlyTransactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });

        elements.monthlyIncome.textContent = `$${totals.income.toFixed(2)}`;
        elements.monthlyExpense.textContent = `$${totals.expense.toFixed(2)}`;
        elements.monthlyBalance.textContent = `$${(totals.income - totals.expense).toFixed(2)}`;

        // Update top categories
        const categoryTotals = monthlyTransactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
            }
            return acc;
        }, {});

        const topCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        elements.topCategories.innerHTML = topCategories
            .map(([category, amount]) => `
                <li>
                    <i class="fas ${categoryIcons[category]}"></i>
                    ${category}: $${amount.toFixed(2)}
                </li>
            `).join('');
    }

    // Render charts
    function renderCharts() {
        // Destroy existing charts
        if (charts.bar) charts.bar.destroy();
        if (charts.pie) charts.pie.destroy();

        // Prepare data for charts
        const categories = [...new Set(transactions.map(t => t.category))];
        const incomeData = categories.map(cat => 
            transactions
                .filter(t => t.type === 'income' && t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0)
        );
        const expenseData = categories.map(cat => 
            transactions
                .filter(t => t.type === 'expense' && t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0)
        );

        // Bar Chart
        charts.bar = new Chart(elements.barChart, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#22c55e',
                        borderRadius: 5
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: '#ef4444',
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });

        // Pie Chart
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const pieData = categories.map(cat => {
            const amount = transactions
                .filter(t => t.type === 'expense' && t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                category: cat,
                percentage: (amount / totalExpenses) * 100
            };
        }).filter(d => d.percentage > 0);

        charts.pie = new Chart(elements.pieChart, {
            type: 'pie',
            data: {
                labels: pieData.map(d => d.category),
                datasets: [{
                    data: pieData.map(d => d.percentage),
                    backgroundColor: [
                        '#ef4444',
                        '#f97316',
                        '#eab308',
                        '#84cc16',
                        '#06b6d4',
                        '#8b5cf6'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    }

    // Populate month and year selects
    function populateDateSelects() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Populate months
        elements.monthSelect.innerHTML = months
            .map((month, index) => `
                <option value="${index}" ${index === currentMonth ? 'selected' : ''}>
                    ${month}
                </option>
            `).join('');

        // Populate years (current year and 2 years back)
        elements.yearSelect.innerHTML = Array.from({ length: 3 }, (_, i) => {
            const year = currentYear - i;
            return `
                <option value="${year}" ${i === 0 ? 'selected' : ''}>
                    ${year}
                </option>
            `;
        }).join('');
    }

    // Reset app
    function resetApp() {
        if (confirm('Are you sure you want to reset all transactions?')) {
            transactions = [];
            saveTransactions();
            updateUI();
        }
    }

    // Toggle dark mode
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Public API
    return {
        init,
        deleteTransaction
    };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', App.init); 