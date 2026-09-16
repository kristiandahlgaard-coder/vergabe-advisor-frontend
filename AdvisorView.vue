<template>
  <div class="advisor-container">
    <h1>📋 Vergabe-Advisor Formular</h1>
    <p class="subtitle">Schritt-für-Schritt Assistent zur Verfahrensart-Bestimmung</p>

    <form @submit.prevent="handleSubmit" class="advisor-form">
      <!-- Kerninfo -->
      <div class="form-section">
        <h3>Kerninfo</h3>

        <div class="form-group">
          <label>Auftraggeber-Typ</label>
          <div class="radio-group">
            <label>
              <input v-model="form.auftraggeber_typ" type="radio" value="klassisch" />
              Klassisch
            </label>
            <label>
              <input v-model="form.auftraggeber_typ" type="radio" value="98_gwb" />
              §98 GWB
            </label>
            <label>
              <input v-model="form.auftraggeber_typ" type="radio" value="sektoren" />
              Sektoren
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Leistungsbeschreibung</label>
          <textarea
            v-model="form.leistungsbeschreibung"
            placeholder="Kurze Beschreibung der Leistung..."
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Leistungsart</label>
          <div class="radio-group">
            <label>
              <input v-model="form.leistungsart" type="radio" value="bau" />
              Bauleistungen (€5.404.000)
            </label>
            <label>
              <input v-model="form.leistungsart" type="radio" value="liefer" />
              Lieferleistungen (€216.000)
            </label>
            <label>
              <input v-model="form.leistungsart" type="radio" value="dienst" />
              Dienstleistungen (€216.000)
            </label>
            <label>
              <input v-model="form.leistungsart" type="radio" value="fachlich" />
              Fachliche Planung (€216.000)
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Volumen (€)</label>
          <input
            v-model.number="form.volumen"
            type="number"
            step="0.01"
            placeholder="z.B. 50000"
            required
          />
        </div>

        <div class="form-group">
          <label>Struktur</label>
          <div class="radio-group">
            <label>
              <input v-model="form.struktur" type="radio" value="einzeln" />
              Einzelvergabe
            </label>
            <label>
              <input v-model="form.struktur" type="radio" value="rahmen" />
              Rahmenvereinbarung
            </label>
            <label>
              <input v-model="form.struktur" type="radio" value="dps" />
              Dynamisches System
            </label>
          </div>
        </div>
      </div>

      <!-- Anfordernde Stelle -->
      <div class="form-section">
        <h3>Anfordernde Stelle</h3>

        <div class="form-group">
          <label>Stelle</label>
          <input
            v-model="form.anfordernde_stelle"
            type="text"
            placeholder="z.B. Hochbauamt"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Ansprechpartner Name</label>
            <input
              v-model="form.ansprechpartner_name"
              type="text"
              placeholder="Name"
            />
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input
              v-model="form.ansprechpartner_telefon"
              type="tel"
              placeholder="+49..."
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="form.ansprechpartner_email"
              type="email"
              placeholder="name@..."
            />
          </div>
        </div>
      </div>

      <!-- Dokumentation -->
      <div class="form-section">
        <h3>Dokumentation & Risiko</h3>

        <div class="form-group">
          <label>Begründung</label>
          <textarea
            v-model="form.begruendung"
            placeholder="Warum diese Vergabe? Hintergrund?"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Besonderheiten</label>
          <textarea
            v-model="form.besonderheiten"
            placeholder="Spezielle Anforderungen, Einschränkungen..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Risikoklasse</label>
          <div class="radio-group">
            <label>
              <input v-model="form.risikoklasse" type="radio" value="gering" />
              Gering
            </label>
            <label>
              <input v-model="form.risikoklasse" type="radio" value="mittel" />
              Mittel
            </label>
            <label>
              <input v-model="form.risikoklasse" type="radio" value="hoch" />
              Hoch
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Projektbezeichnung</label>
          <input
            v-model="form.projektbezeichnung"
            type="text"
            placeholder="z.B. Projekt XY 2024"
          />
        </div>
      </div>

      <!-- Info-Zusammenfassung -->
      <div class="info-box" v-if="form.volumen && form.leistungsart">
        <h4>📊 Verfahrensart-Bestimmung</h4>
        <p><strong>Leistungsart:</strong> {{ leistungsartLabel }}</p>
        <p><strong>EU-Schwellenwert:</strong> {{ euSchwellenwert }}€</p>
        <p>
          <strong>Status:</strong>
          {{ form.volumen > euSchwellenwert ? '🔴 ÜBER EU-Schwelle' : '🟢 UNTER EU-Schwelle' }}
        </p>
        <p v-if="form.struktur === 'rahmen'">
          <strong>⚠️ Hinweis:</strong> Rahmenvereinbarungen benötigen zusätzliche Freigeben
        </p>
      </div>

      <!-- Buttons -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="resetForm">
          Zurücksetzen
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Wird gespeichert...' : 'Speichern & Einreichen' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        ✅ Vergabe erfolgreich erstellt! ID: {{ successId }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { vergabenService } from '../api.service'

const form = ref({
  auftraggeber_typ: 'klassisch',
  leistungsbeschreibung: '',
  leistungsart: '',
  volumen: null,
  struktur: 'einzeln',
  erfuellungszeitraum: '',
  anfordernde_stelle: '',
  ansprechpartner_name: '',
  ansprechpartner_telefon: '',
  ansprechpartner_email: '',
  begruendung: '',
  besonderheiten: '',
  risikoklasse: 'mittel',
  projektbezeichnung: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const successId = ref('')

const leistungsartLabel = computed(() => {
  const mapping = {
    bau: 'Bauleistungen',
    liefer: 'Lieferleistungen',
    dienst: 'Dienstleistungen',
    fachlich: 'Fachliche Planung'
  }
  return mapping[form.value.leistungsart] || ''
})

const euSchwellenwert = computed(() => {
  const schwellen = {
    bau: 5404000,
    liefer: 216000,
    dienst: 216000,
    fachlich: 216000
  }
  return schwellen[form.value.leistungsart] || 0
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await vergabenService.create({
      ...form.value,
      status: 'entwurf'
    })

    success.value = true
    successId.value = response.data.id
    
    // Formular zurücksetzen nach kurzer Zeit
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Fehler beim Speichern'
    console.error('Submit error:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    auftraggeber_typ: 'klassisch',
    leistungsbeschreibung: '',
    leistungsart: '',
    volumen: null,
    struktur: 'einzeln',
    erfuellungszeitraum: '',
    anfordernde_stelle: '',
    ansprechpartner_name: '',
    ansprechpartner_telefon: '',
    ansprechpartner_email: '',
    begruendung: '',
    besonderheiten: '',
    risikoklasse: 'mittel',
    projektbezeichnung: ''
  }
  success.value = false
  error.value = ''
}
</script>

<style scoped>
.advisor-container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #06b6d4;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.advisor-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #06b6d4;
}

.form-section h3 {
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.125rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-weight: 400;
}

.radio-group input[type="radio"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.info-box {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #06b6d4;
}

.info-box h4 {
  margin-bottom: 1rem;
  color: #0c4a6e;
}

.info-box p {
  margin-bottom: 0.5rem;
  color: #0c4a6e;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #06b6d4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0891b2;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.success-message {
  background: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
