<template>
  <div class="create-wrapper">
    <div class="create-header">
      <h1>Neue Vergabe</h1>
      <p class="subtitle">Erstellen Sie eine neue Vergabeprozedur</p>
    </div>

    <form @submit.prevent="submitForm" class="create-form">
      <div class="form-section">
        <h2>Grunddaten</h2>

        <div class="form-group">
          <label>Leistungsart *</label>
          <select v-model="form.leistungsart" required>
            <option value="">Bitte wählen...</option>
            <option value="Bauleistungen">Bauleistungen</option>
            <option value="Liefer- und Dienstleistungen">Liefer- und Dienstleistungen</option>
            <option value="Freiberuflich/Planung">Freiberuflich/Planung</option>
            <option value="Konzessionen">Konzessionen</option>
          </select>
        </div>

        <div class="form-group">
          <label>Beschreibung *</label>
          <textarea v-model="form.beschreibung" required placeholder="Beschreiben Sie die Vergabe..."></textarea>
        </div>

        <div class="form-group">
          <label>Auftragsvolumen (€) *</label>
          <input v-model.number="form.volumen" type="number" required placeholder="z.B. 500000" />
        </div>

        <div class="form-group">
          <label>Auftraggeber (Organizational ID) *</label>
          <input v-model.number="form.auftraggeber_id" type="number" required placeholder="z.B. 1" />
        </div>
      </div>

      <div class="form-section">
        <h2>Status</h2>
        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status">
            <option value="entwurf">Entwurf</option>
            <option value="in_bearbeitung">In Bearbeitung</option>
            <option value="genehmigt">Genehmigt</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">Vergabe erstellen</button>
        <router-link to="/dashboard" class="btn-cancel">Abbrechen</router-link>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">✓ Vergabe erfolgreich erstellt</div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CreateVergabeView',
  data() {
    return {
      form: {
        leistungsart: '',
        beschreibung: '',
        volumen: null,
        auftraggeber_id: null,
        status: 'entwurf'
      },
      error: '',
      success: false
    };
  },
  methods: {
    async submitForm() {
      this.error = '';
      this.success = false;

      try {
        const res = await fetch('https://vergabe-advisor-production.up.railway.app/api/vergaben', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.form)
        });

        const data = await res.json();

        if (res.ok) {
          this.success = true;
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 1000);
        } else {
          this.error = data.error || 'Fehler beim Erstellen der Vergabe';
        }
      } catch (err) {
        this.error = 'Verbindungsfehler';
      }
    }
  }
};
</script>

<style scoped>
.create-wrapper {
  padding: 80px 0;
}

.create-header {
  margin-bottom: 60px;
}

.create-header h1 {
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

.create-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 60px;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  color: #1a1a1a;
}

input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 14px;
  font-family: inherit;
  transition: border 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #1a1a1a;
}

textarea {
  resize: vertical;
  min-height: 120px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e5e5e5;
}

.btn-submit {
  flex: 1;
  padding: 16px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: #333;
}

.btn-cancel {
  flex: 1;
  padding: 16px;
  background: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: white;
  border-color: #1a1a1a;
}

.error-message {
  margin-top: 20px;
  padding: 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 2px;
  font-size: 14px;
}

.success-message {
  margin-top: 20px;
  padding: 16px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .create-wrapper {
    padding: 40px 0;
  }

  .create-header h1 {
    font-size: 28px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
