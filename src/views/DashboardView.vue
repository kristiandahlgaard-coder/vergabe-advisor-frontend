<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Übersicht aller Vergaben und deren Status</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Vergaben</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatCurrency(stats.totalVolume) }}</div>
        <div class="stat-label">Gesamtvolumen</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">In Bearbeitung</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.approved }}</div>
        <div class="stat-label">Genehmigt</div>
      </div>
    </div>

    <div class="list-section">
      <h2>Aktuelle Vergaben</h2>
      
      <div v-if="loading" class="loading">Wird geladen...</div>
      
      <div v-else-if="vergaben.length === 0" class="empty-state">
        <p>Keine Vergaben vorhanden</p>
        <router-link to="/create" class="btn-primary">Erste Vergabe erstellen</router-link>
      </div>

      <div v-else class="vergaben-table">
        <div class="table-header">
          <div class="col-id">ID</div>
          <div class="col-leistungsart">Leistungsart</div>
          <div class="col-volumen">Volumen</div>
          <div class="col-status">Status</div>
          <div class="col-action"></div>
        </div>

        <div v-for="vergabe in vergaben" :key="vergabe.id" class="table-row">
          <div class="col-id">#{{ vergabe.id }}</div>
          <div class="col-leistungsart">{{ vergabe.leistungsart }}</div>
          <div class="col-volumen">{{ formatCurrency(vergabe.volumen) }}</div>
          <div class="col-status">
            <span class="status-badge" :class="'status-' + vergabe.status">
              {{ statusLabel(vergabe.status) }}
            </span>
          </div>
          <div class="col-action">
            <router-link :to="`/vergabe/${vergabe.id}`" class="link-detail">Ansehen</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      vergaben: [],
      loading: true,
      stats: {
        total: 0,
        totalVolume: 0,
        pending: 0,
        approved: 0
      }
    };
  },
  mounted() {
    this.fetchVergaben();
  },
  methods: {
    async fetchVergaben() {
      try {
        const res = await fetch('https://vergabe-advisor-production.up.railway.app/api/vergaben', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          this.vergaben = data;
          this.calculateStats();
        }
      } catch (err) {
        console.error('Fehler beim Laden:', err);
      } finally {
        this.loading = false;
      }
    },
    calculateStats() {
      this.stats.total = this.vergaben.length;
      this.stats.totalVolume = this.vergaben.reduce((sum, v) => sum + (v.volumen || 0), 0);
      this.stats.pending = this.vergaben.filter(v => v.status === 'entwurf' || v.status === 'in_bearbeitung').length;
      this.stats.approved = this.vergaben.filter(v => v.status === 'genehmigt').length;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value || 0);
    },
    statusLabel(status) {
      const labels = {
        'entwurf': 'Entwurf',
        'in_bearbeitung': 'In Bearbeitung',
        'genehmigt': 'Genehmigt',
        'abgelehnt': 'Abgelehnt'
      };
      return labels[status] || status;
    }
  }
};
</script>

<style scoped>
.dashboard-wrapper {
  padding: 80px 0;
}

.dashboard-header {
  margin-bottom: 60px;
}

.dashboard-header h1 {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 80px;
}

.stat-card {
  padding: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  background: #f9f9f9;
  text-align: center;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #1a1a1a;
  background: white;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a1a;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.list-section {
  margin-bottom: 60px;
}

.list-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  letter-spacing: -0.5px;
}

.loading, .empty-state {
  padding: 60px 40px;
  text-align: center;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  background: #f9f9f9;
}

.btn-primary {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 2px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #333;
}

.vergaben-table {
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 200px 150px 120px 80px;
  gap: 20px;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 200px 150px 120px 80px;
  gap: 20px;
  padding: 16px 20px;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f9f9f9;
}

.col-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1a1a1a;
}

.col-leistungsart {
  font-size: 14px;
  color: #1a1a1a;
}

.col-volumen {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 500;
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

.status-entwurf {
  background: #e3f2fd;
  color: #1976d2;
}

.status-in_bearbeitung {
  background: #fff3e0;
  color: #f57c00;
}

.status-genehmigt {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-abgelehnt {
  background: #ffebee;
  color: #c62828;
}

.link-detail {
  color: #1a1a1a;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
  border-bottom: 1px solid transparent;
}

.link-detail:hover {
  color: #666;
  border-bottom-color: #666;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header, .table-row {
    grid-template-columns: 70px 150px 120px 100px 60px;
    gap: 12px;
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 40px 0;
  }

  .dashboard-header h1 {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 24px;
  }

  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }

  .col-id::before {
    content: 'ID: ';
    font-weight: 600;
    color: #666;
  }

  .col-leistungsart::before {
    content: 'Leistungsart: ';
    font-weight: 600;
    color: #666;
  }

  .col-volumen::before {
    content: 'Volumen: ';
    font-weight: 600;
    color: #666;
  }

  .col-status::before {
    content: 'Status: ';
    font-weight: 600;
    color: #666;
  }
}
</style>
