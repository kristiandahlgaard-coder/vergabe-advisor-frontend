<template>
  <div class="workflow-wrapper">
    <div class="workflow-header">
      <h1>Freigabe-Workflow</h1>
      <p class="subtitle">Verwaltung von Freigabeanfragen und Genehmigungen</p>
    </div>

    <div class="workflow-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
        <span class="badge">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading">Wird geladen...</div>

    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <p>Keine Freigabeanfragen</p>
    </div>

    <div v-else class="requests-list">
      <div v-for="request in filteredRequests" :key="request.id" class="request-card">
        <div class="card-header">
          <h3>Vergabe #{{ request.vergabe_id }}</h3>
          <span class="status-badge" :class="'status-' + request.status">
            {{ statusLabel(request.status) }}
          </span>
        </div>

        <div class="card-content">
          <div class="field">
            <span class="label">Leistungsart</span>
            <span class="value">{{ request.leistungsart }}</span>
          </div>
          <div class="field">
            <span class="label">Volumen</span>
            <span class="value">{{ formatCurrency(request.volumen) }}</span>
          </div>
          <div class="field">
            <span class="label">Stufe</span>
            <span class="value">{{ request.position }} von X</span>
          </div>
        </div>

        <div v-if="request.status === 'pending'" class="card-actions">
          <button @click="approve(request.id)" class="btn-approve">✓ Genehmigen</button>
          <button @click="reject(request.id)" class="btn-reject">✕ Ablehnen</button>
        </div>

        <div v-else class="card-info">
          {{ request.status === 'approved' ? '✓ Sie haben diese Anfrage genehmigt' : '✕ Sie haben diese Anfrage abgelehnt' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FreigabeWorkflowView',
  data() {
    return {
      activeTab: 'pending',
      requests: [],
      loading: true,
      tabs: [
        { id: 'pending', label: 'Ausstehend', count: 0 },
        { id: 'approved', label: 'Genehmigt', count: 0 },
        { id: 'rejected', label: 'Abgelehnt', count: 0 }
      ]
    };
  },
  computed: {
    filteredRequests() {
      return this.requests.filter(r => r.status === this.activeTab);
    }
  },
  mounted() {
    this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const res = await fetch('https://vergabe-advisor-production.up.railway.app/api/freigabe-anfragen', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          this.requests = data;
          this.updateTabCounts();
        }
      } catch (err) {
        console.error('Fehler:', err);
      } finally {
        this.loading = false;
      }
    },
    updateTabCounts() {
      this.tabs.forEach(tab => {
        tab.count = this.requests.filter(r => r.status === tab.id).length;
      });
    },
    async approve(requestId) {
      try {
        const res = await fetch(`https://vergabe-advisor-production.up.railway.app/api/freigabe-anfragen/${requestId}/approve`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          this.fetchRequests();
        }
      } catch (err) {
        console.error('Fehler:', err);
      }
    },
    async reject(requestId) {
      try {
        const res = await fetch(`https://vergabe-advisor-production.up.railway.app/api/freigabe-anfragen/${requestId}/reject`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          this.fetchRequests();
        }
      } catch (err) {
        console.error('Fehler:', err);
      }
    },
    statusLabel(status) {
      const labels = {
        'pending': 'Ausstehend',
        'approved': 'Genehmigt',
        'rejected': 'Abgelehnt'
      };
      return labels[status] || status;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value || 0);
    }
  }
};
</script>

<style scoped>
.workflow-wrapper {
  padding: 80px 0;
}

.workflow-header {
  margin-bottom: 60px;
}

.workflow-header h1 {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  font-weight: 400;
}

.workflow-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
  border-bottom: 1px solid #e5e5e5;
}

.tab-button {
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  color: #1a1a1a;
}

.tab-button.active {
  color: #1a1a1a;
  border-bottom-color: #1a1a1a;
}

.badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #e5e5e5;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.loading, .empty-state {
  padding: 60px 40px;
  text-align: center;
  color: #666;
}

.requests-list {
  display: grid;
  gap: 24px;
}

.request-card {
  padding: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  background: #f9f9f9;
  transition: all 0.2s;
}

.request-card:hover {
  background: white;
  border-color: #1a1a1a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

.card-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field .label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field .value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-approve, .btn-reject {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #2e7d32;
  color: white;
}

.btn-approve:hover {
  background: #1b5e20;
}

.btn-reject {
  background: #c62828;
  color: white;
}

.btn-reject:hover {
  background: #b71c1c;
}

.card-info {
  padding: 12px 16px;
  background: white;
  border-radius: 2px;
  font-size: 13px;
  color: #666;
  text-align: center;
}

@media (max-width: 1024px) {
  .card-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .workflow-wrapper {
    padding: 40px 0;
  }

  .workflow-header h1 {
    font-size: 28px;
  }

  .workflow-tabs {
    flex-wrap: wrap;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 12px;
  }

  .card-content {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
