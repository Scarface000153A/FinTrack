// Dashboard Vue.js Application
// Mounted on #app in dashboard.html

const { createApp } = Vue;

createApp({
  data() {
    return {
      user: { username: '', email: '' },
      stats: {
        total_income: 0,
        total_expenses: 0,
        balance: 0,
        transaction_count: 0,
      },
      transactions: [],
      categories: [],
      loading: true,
      saving: false,
      showAddModal: false,
      showEditModal: false,
      errorMessage: '',
      filterType: '',
      filterCategory: '',
      transactionForm: {
        transaction_type: 'income',
        amount: '',
        category: '',
        description: '',
        transaction_date: '',
      },
      editId: null,
    };
  },

  async mounted() {
    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const me = await window.API.authFetch('/api/auth/me');
      if (!me.ok) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }
      this.user = await me.json();
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    await this.loadAll();
  },

  methods: {
    async loadAll() {
      this.loading = true;
      try {
        const [statsRes, txRes, catsRes] = await Promise.all([
          window.API.getSummaryStats(),
          window.API.getTransactions({ type: this.filterType, category: this.filterCategory }),
          window.API.getCategories(),
        ]);
        this.stats = statsRes;
        this.transactions = txRes;
        this.categories = catsRes;
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        this.errorMessage = 'Failed to load dashboard data.';
      } finally {
        this.loading = false;
      }
    },

    async addTransaction() {
      this.saving = true;
      this.errorMessage = '';
      try {
        await window.API.createTransaction({
          ...this.transactionForm,
          amount: parseFloat(this.transactionForm.amount),
          transaction_date: this.transactionForm.transaction_date || new Date().toISOString(),
        });
        this.showAddModal = false;
        this.resetForm();
        await this.loadAll();
      } catch (err) {
        console.error('Failed to add transaction:', err);
        this.errorMessage = 'Failed to add transaction.';
      } finally {
        this.saving = false;
      }
    },

    editTransaction(tx) {
      this.editId = tx.id;
      this.transactionForm = {
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description || '',
        transaction_date: tx.transaction_date ? tx.transaction_date.slice(0, 16) : '',
      };
      this.showEditModal = true;
    },

    async updateTransaction() {
      this.saving = true;
      this.errorMessage = '';
      try {
        await window.API.updateTransaction(this.editId, {
          ...this.transactionForm,
          amount: parseFloat(this.transactionForm.amount),
        });
        this.showEditModal = false;
        this.resetForm();
        await this.loadAll();
      } catch (err) {
        console.error('Failed to update transaction:', err);
        this.errorMessage = 'Failed to update transaction.';
      } finally {
        this.saving = false;
      }
    },

    async deleteTransaction(id) {
      if (!confirm('Are you sure you want to delete this transaction?')) return;
      try {
        await window.API.deleteTransaction(id);
        await this.loadAll();
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        this.errorMessage = 'Failed to delete transaction.';
      }
    },

    logout() {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    },

    formatDate(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    resetForm() {
      this.transactionForm = {
        transaction_type: 'income',
        amount: '',
        category: '',
        description: '',
        transaction_date: '',
      };
      this.editId = null;
    },

    closeModals() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.resetForm();
      this.errorMessage = '';
    },
  },
}).mount('#app');