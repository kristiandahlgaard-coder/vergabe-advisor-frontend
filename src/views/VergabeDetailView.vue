<template>
  <div class="detail-wrapper">
    <div v-if="loading" class="loading">Wird geladen...</div>

    <div v-else-if="vergabe" class="detail-content">
      <div class="detail-header">
        <router-link to="/dashboard" class="link-back">← Zurück</router-link>
        <h1>Vergabe #{{ vergabe.id }}</h1>
        <p class="subtitle">{{ vergabe.leistungsart }}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-section">
          <h2>Grunddaten</h2>
          <div class="detail-field">
            <span class="label">Leistungsart</span>
            <span class="value">{{ vergabe.leistungsart }}</span>
          </div>
          <div class="detail-field">
            <span class="label">Volumen</span>
            <span class="value font-mono">{{ formatCurrency(vergabe.volumen) }}</span>
          </div>
          <div class="detail-field">
            <span class="label">Status</span>
            <span class="value">
              <span class="status-badge" :class="'status-' + vergabe.status">
                {{ statusLabel(vergabe.status) }}
              </span>
            </span>
          </div>
          <div class="detail-field">
            <span class="label">Erstellt am</span>
            <span class="value">{{ formatDate(vergabe.created_at) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h2>Beschreibung</h2>
          <p class="description">{{ vergabe.beschreibung }}</p>
        </div>

        <div class="detail-section">
          <h2>Freigabe-Workflow</h2>
          <div v-if="freigabenkette.length === 0" class="empty">
            Keine Freigaben eingerichtet
          </div>
          <div v-else class="workflow-chain">
            <div v-for="(step, idx) in freigabenkette" :key="idx" class="workflow-step">
              <div class="step-number">{{ idx + 1 }}</div>
              <div class="step-content">
                <div class="step-title">Freigabe Stufe {{ idx + 1 }}</div>
                <div class="step-status" :class="'status-' + step.status">
                  {{ step.status === 'approved' ? '✓ Genehmigt' : '○ Ausstehend' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <button @click="editVergabe" class="btn-edit">Bearbeiten</button>
          <button @click="requestApproval" class="btn-request">Zur Freigabe einreichen</button>
        </div>
      </div>
    </div>

    <div v-else class="error">
      Vergabe nicht gefunden
    </div>
  </div>
</template>

<script>
export default {
  name: 'VergabeDetailView',
  data() {
    return {
      vergabe: null,
      freigabenkette: [],
      loading: true
    };
  },
  mounted() {
    this.fetchVergabe();
  },
  methods: {
    async fetchVergabe() {
      try {
        const id = this.$route.params.id;
        const res = await fetch(`https://vergabe-advisor-production.up.railway.app/api/vergaben/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          this.vergabe = data;
          this.freigabenkette = data.freigabenkette || [];
        }
      } catch (err) {
        console.error('Fehler:', err);
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value || 0);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    statusLabel(status) {
      const labels = {
        'entwurf': 'Entwurf',
        'in_bearbeitung': 'In Bearbeitung',
        'genehmigt': 'Genehmigt',
        'abgelehnt': 'Abgelehnt'
      };
      return labels[status] || status;
    },
    editVergabe() {
      alert('Bearbeitung kommt noch');
    },
    requestApproval() {
      alert('Freigabe-Anfrage kommt noch');
    }
  }
};
</script>

<style scoped>
.detail-wrapper {
  padding: 80px 0;
}

.loading, .error {
  padding: 60px 40px;
  text-align: center;
  color: #666;
}

.detail-header {
  margin-bottom: 60px;
}

.link-back {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  display: inline-block;
  transition: color 0.2s;
}

.link-back:hover {
  color: #1a1a1a;
}

.detail-header h1 {
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

.detail-grid {
  display: grid;
  gap: 60px;
}

.detail-section {
  padding: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  background: #f9f9f9;
}

.detail-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-field {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}

.detail-field:last-child {
  border-bottom: none;
}

.detail-field .label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-field .value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.detail-field .value.font-mono {
  font-family: 'Courier New', monospace;
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

.description {
  line-height: 1.8;
  color: #333;
}

.empty {
  color: #999;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.workflow-chain {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workflow-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #1a1a1a;
  color: white;
  font-weight: 600;
  border-radius: 2px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding: 12px 0;
}

.step-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.step-status {
  font-size: 13px;
  font-weight: 500;
}

.step-status.status-approved {
  color: #2e7d32;
}

.step-status.status-pending {
  color: #f57c00;
}

.detail-actions {
  display: flex;
  gap: 16px;
  padding-top: 32px;
  border-top: 1px solid #e5e5e5;
}

.btn-edit, .btn-request {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #ddd;
}

.btn-edit:hover {
  background: white;
  border-color: #1a1a1a;
}

.btn-request {
  background: #1a1a1a;
  color: white;
}

.btn-request:hover {
  background: #333;
}

@media (max-width: 768px) {
  .detail-wrapper {
    padding: 40px 0;
  }

  .detail-header h1 {
    font-size: 28px;
  }

  .detail-field {
    flex-direction: column;
    gap: 8px;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
