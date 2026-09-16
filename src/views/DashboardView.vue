<template>
  <div class="dashboard-container">
    <h1>📊 Freigabe-Dashboard</h1>
    <p class="subtitle">Übersicht aller Vergaben und deren Freigabe-Status</p>

    <!-- Filter -->
    <div class="filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Suche nach Projektbezeichnung..."
        class="search-input"
      />
      <select v-model="statusFilter" class="status-filter">
        <option value="">Alle Status</option>
        <option value="entwurf">Entwurf</option>
        <option value="in_freigabe">In Freigabe</option>
        <option value="genehmigt">Genehmigt</option>
        <option value="abgelehnt">Abgelehnt</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Laden...</div>

    <!-- Vergaben List -->
    <div v-else-if="filteredVergaben.length > 0" class="vergaben-list">
      <div v-for="vergabe in filteredVergaben" :key="vergabe.id" class="vergabe-card">
        <div class="card-header">
          <h3>{{ vergabe.projektbezeichnung || 'Ohne Projektname' }}</h3>
          <span :class="['status-badge', `status-${vergabe.status}`]">
            {{ formatStatus(vergabe.status) }}
          </span>
        </div>

        <div class="card-body">
          <p><strong>Leistung:</strong> {{ vergabe.leistungsbeschreibung }}</p>
          <p><strong>Volumen:</strong> €{{ formatPrice(vergabe.volumen) }}</p>
          <p><strong>Risikoklasse:</strong> {{ vergabe.risikoklasse }}</p>
          <p><strong>Erstellt:</strong> {{ formatDate(vergabe.erstellt_am) }}</p>
        </div>

        <div v-if="vergabe.freigabenkette && vergabe.freigabenkette.length > 0" class="freigabenkette">
          <h4>Freigabe-Schritte:</h4>
          <div class="steps">
            <div
              v-for="(step, idx) in vergabe.freigabenkette"
              :key="step.id"
              :class="['step', `step-${step.status}`]"
            >
              <div class="step-number">{{ idx + 1 }}</div>
              <div class="step-info">
                <p class="step-freigeber">{{ step.freigeber?.vorname }} {{ step.freigeber?.nachname }}</p>
                <p class="step-status">{{ formatStatus(step.status) }}</p>
                <p v-if="step.kommentar" class="step-comment">{{ step.kommentar }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="vergabe.status === 'in_freigabe'" class="card-actions">
          <button @click="approveVergabe(vergabe.id)" class="btn-approve">
            ✅ Genehmigen
          </button>
          <button @click="rejectVergabe(vergabe.id)" class="btn-reject">
            ❌ Ablehnen
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Keine Vergaben gefunden</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { vergabenService } from '../api.service'

const vergaben = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')

const filteredVergaben = computed(() => {
  return vergaben.value.filter((v) => {
    const matchesSearch = !searchQuery.value ||
      v.projektbezeichnung?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || v.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const loadVergaben = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await vergabenService.getList()
    vergaben.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Fehler beim Laden der Vergaben'
    console.error('Load error:', err)
  } finally {
    loading.value = false
  }
}

const approveVergabe = async (vergabeId) => {
  if (!confirm('Wirklich genehmigen?')) return

  try {
    // userId müsste aus dem aktuellen User kommen
    const user = JSON.parse(localStorage.getItem('user'))
    await vergabenService.approve(vergabeId, user.id)
    await loadVergaben()
  } catch (err) {
    error.value = 'Fehler beim Genehmigen'
  }
}

const rejectVergabe = async (vergabeId) => {
  const grund = prompt('Grund für Ablehnung:')
  if (!grund) return

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await vergabenService.reject(vergabeId, user.id, grund)
    await loadVergaben()
  } catch (err) {
    error.value = 'Fehler beim Ablehnen'
  }
}

const formatStatus = (status) => {
  const mapping = {
    entwurf: 'Entwurf',
    in_freigabe: 'In Freigabe',
    genehmigt: 'Genehmigt',
    abgelehnt: 'Abgelehnt',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt'
  }
  return mapping[status] || status
}

const formatPrice = (value) => {
  return new Intl.NumberFormat('de-DE').format(value)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE')
}

onMounted(() => {
  loadVergaben()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #06b6d4;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input,
.status-filter {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.search-input:focus,
.status-filter:focus {
  outline: none;
  border-color: #06b6d4;
}

.vergaben-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.vergabe-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #06b6d4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-entwurf {
  background: #f3f4f6;
  color: #6b7280;
}

.status-in_freigabe {
  background: #fef3c7;
  color: #92400e;
}

.status-genehmigt {
  background: #dcfce7;
  color: #166534;
}

.status-abgelehnt {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  margin-bottom: 1rem;
}

.card-body p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.freigabenkette {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.freigabenkette h4 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border-left: 3px solid #d1d5db;
}

.step-pending {
  border-left-color: #fbbf24;
}

.step-approved {
  border-left-color: #10b981;
}

.step-rejected {
  border-left-color: #ef4444;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #e5e7eb;
  border-radius: 50%;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
}

.step-freigeber {
  margin: 0;
  font-weight: 500;
  color: #1f2937;
}

.step-status {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.step-comment {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  font-style: italic;
  color: #4b5563;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover {
  background: #dc2626;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
