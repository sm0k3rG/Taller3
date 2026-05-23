<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  actualizarCapacidadMaxima,
  conectarCatalogo,
  conectarPersonalizado,
  desconectarDispositivo,
  obtenerCatalogo,
  obtenerEstado,
} from '@/services/gestorRedService'
import type { DispositivoCatalogo, EstadoDomicilio } from '@/types/gestorRed'
import { iconoDispositivo } from '@/utils/dispositivoIcono'

const catalogo = ref<DispositivoCatalogo[]>([])
const estado = ref<EstadoDomicilio | null>(null)
const cargando = ref(true)
const accionando = ref(false)
const error = ref<string | null>(null)
const aviso = ref<string | null>(null)

const nombrePersonalizado = ref('')
const consumoPersonalizado = ref('')
const editandoCapacidad = ref(false)
const capacidadEdit = ref('10')

const sobrecarga = computed(() => estado.value?.resultado === 'Denegado')
const barraPorcentaje = computed(() => {
  if (!estado.value) return 0
  const max = estado.value.capacidadMaxKw
  if (max <= 0) return 0
  return Math.min(100, (estado.value.consumoActualKw / max) * 100)
})

const porcentajeTexto = computed(() => estado.value?.porcentajeUso ?? 0)

async function cargarDatos() {
  cargando.value = true
  error.value = null
  try {
    const [lista, estadoActual] = await Promise.all([obtenerCatalogo(), obtenerEstado()])
    catalogo.value = lista
    estado.value = estadoActual
    capacidadEdit.value = String(estadoActual.capacidadMaxKw)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar el domicilio.'
  } finally {
    cargando.value = false
  }
}

async function onConectarPreset(dispositivo: DispositivoCatalogo) {
  accionando.value = true
  aviso.value = null
  error.value = null
  try {
    const resp = await conectarCatalogo(dispositivo.id)
    estado.value = resp
    aviso.value =
      resp.resultado === 'Denegado'
        ? `${dispositivo.nombre} conectado — sobrecarga: estado DENEGADO.`
        : `${dispositivo.nombre} conectado correctamente.`
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al conectar.'
  } finally {
    accionando.value = false
  }
}

async function onConectarPersonalizado() {
  accionando.value = true
  aviso.value = null
  error.value = null
  try {
    const resp = await conectarPersonalizado(
      nombrePersonalizado.value,
      Number(consumoPersonalizado.value),
    )
    estado.value = resp
    nombrePersonalizado.value = ''
    consumoPersonalizado.value = ''
    aviso.value =
      resp.resultado === 'Denegado'
        ? 'Dispositivo añadido — la red superó el límite (DENEGADO).'
        : 'Dispositivo personalizado conectado.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al añadir dispositivo.'
  } finally {
    accionando.value = false
  }
}

async function onDesconectar(instanceId: string) {
  accionando.value = true
  aviso.value = null
  error.value = null
  try {
    estado.value = await desconectarDispositivo(instanceId)
    aviso.value = 'Dispositivo desconectado.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al desconectar.'
  } finally {
    accionando.value = false
  }
}

async function guardarCapacidad() {
  const valor = Number(capacidadEdit.value)
  if (!Number.isFinite(valor) || valor <= 0) {
    error.value = 'Ingrese una capacidad válida en kW.'
    return
  }
  accionando.value = true
  error.value = null
  try {
    estado.value = await actualizarCapacidadMaxima(valor)
    editandoCapacidad.value = false
    aviso.value = 'Capacidad máxima actualizada.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo actualizar la capacidad.'
  } finally {
    accionando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div class="dashboard">
    <header class="dashboard__top">
      <div>
        <h1>Gestor de Red Eléctrica</h1>
        <p>Simulador de Carga Residencial · Domicilio único (taller)</p>
      </div>
      <div
        v-if="estado"
        class="dashboard__badge"
        :class="sobrecarga ? 'dashboard__badge--denegado' : 'dashboard__badge--ok'"
      >
        {{
          sobrecarga
            ? 'DENEGADO — ¡Sobrecarga de Red Detectada!'
            : 'PERMITIDO — Red dentro del límite'
        }}
      </div>
    </header>

    <section class="dashboard__capacidad card">
      <div class="dashboard__capacidad-row">
        <span>Capacidad Máxima del Domicilio:</span>
        <template v-if="editandoCapacidad">
          <input
            v-model="capacidadEdit"
            class="dashboard__input-inline"
            type="number"
            min="0.1"
            step="0.1"
          />
          <span>kW</span>
          <button class="btn btn--small" type="button" @click="guardarCapacidad">Guardar</button>
        </template>
        <template v-else>
          <strong>{{ estado?.capacidadMaxKw ?? '—' }} kW</strong>
          <button
            class="btn-icon"
            type="button"
            title="Editar capacidad"
            @click="editandoCapacidad = true"
          >
            ✎
          </button>
        </template>
      </div>
    </section>

    <p v-if="error" class="dashboard__error" role="alert">{{ error }}</p>
    <p v-if="aviso" class="dashboard__aviso" role="status">{{ aviso }}</p>

    <div v-if="cargando" class="dashboard__loading">Cargando domicilio…</div>

    <div v-else class="dashboard__grid">
      <section class="card">
        <h2>Conectar Electrodomésticos</h2>
        <p class="card__hint">Catálogo desde la base de datos del taller</p>

        <div class="preset-grid">
          <button
            v-for="item in catalogo"
            :key="item.id"
            class="preset"
            type="button"
            :disabled="accionando"
            @click="onConectarPreset(item)"
          >
            <span class="preset__icon">{{ iconoDispositivo(item.nombre) }}</span>
            <span class="preset__name">{{ item.nombre }}</span>
            <span class="preset__kw">{{ item.consumoKw }} kW</span>
          </button>
        </div>

        <div class="custom">
          <h3>+ Añadir Personalizado</h3>
          <div class="custom__row">
            <input
              v-model="nombrePersonalizado"
              type="text"
              placeholder="Nombre del aparato"
              :disabled="accionando"
            />
            <input
              v-model="consumoPersonalizado"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Consumo (kW)"
              :disabled="accionando"
            />
            <button
              class="btn btn--add"
              type="button"
              :disabled="accionando"
              @click="onConectarPersonalizado"
            >
              + Añadir
            </button>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Monitoreo de Carga en Tiempo Real</h2>

        <div class="monitor">
          <p class="monitor__valor" :class="{ 'monitor__valor--alert': sobrecarga }">
            {{ estado?.consumoActualKw ?? 0 }} kW
          </p>
          <p class="monitor__sub">de {{ estado?.capacidadMaxKw ?? 0 }} kW disponibles</p>

          <div class="monitor__bar">
            <div
              class="monitor__fill"
              :class="{ 'monitor__fill--alert': sobrecarga }"
              :style="{ width: `${barraPorcentaje}%` }"
            />
          </div>
          <div class="monitor__labels">
            <span>0 kW</span>
            <span>{{ porcentajeTexto }}%</span>
            <span>{{ estado?.capacidadMaxKw ?? 0 }} kW</span>
          </div>

          <div v-if="sobrecarga" class="monitor__denegado">
            <strong>CONEXIÓN DENEGADA</strong>
            <p>
              El consumo actual excede el límite seguro. Desconecte un dispositivo para
              restablecer el disyuntor.
            </p>
          </div>
          <div v-else class="monitor__ok">
            <strong>RED ESTABLE</strong>
            <p>El domicilio opera dentro de la capacidad contratada.</p>
          </div>
        </div>
      </section>
    </div>

    <section v-if="!cargando" class="card dashboard__lista">
      <div class="dashboard__lista-head">
        <h2>Dispositivos Actualmente Conectados</h2>
        <span>{{ estado?.cantidadActivos ?? 0 }} dispositivos activos</span>
      </div>

      <p v-if="!estado?.dispositivosConectados.length" class="dashboard__empty">
        No hay dispositivos conectados. Seleccione uno del catálogo.
      </p>

      <ul v-else class="conectados">
        <li v-for="item in estado.dispositivosConectados" :key="item.instanceId">
          <div class="conectados__info">
            <span class="conectados__icon">{{ iconoDispositivo(item.nombre) }}</span>
            <div>
              <strong>{{ item.nombre }}</strong>
              <small>{{ item.consumoKw }} kW</small>
            </div>
          </div>
          <button
            class="btn btn--ghost"
            type="button"
            :disabled="accionando"
            @click="onDesconectar(item.instanceId)"
          >
            🗑 Desconectar
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 1.25rem;
  color: #e5e7eb;
}

.dashboard__top {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.dashboard h1 {
  margin: 0;
  font-size: 1.85rem;
  color: #f9fafb;
}

.dashboard__top p {
  margin: 0.35rem 0 0;
  color: #9ca3af;
}

.dashboard__badge {
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.dashboard__badge--ok {
  background: #064e3b;
  color: #6ee7b7;
  border: 1px solid #10b981;
}

.dashboard__badge--denegado {
  background: #450a0a;
  color: #fca5a5;
  border: 1px solid #ef4444;
}

.card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
}

.dashboard__capacidad {
  margin-bottom: 1rem;
}

.dashboard__capacidad-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
}

.dashboard__capacidad-row strong {
  color: #fbbf24;
  font-size: 1.2rem;
}

.dashboard__input-inline {
  width: 5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #4b5563;
  background: #111827;
  color: #f9fafb;
}

.btn-icon {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 900px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

.card h2 {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: #f3f4f6;
}

.card__hint {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (max-width: 700px) {
  .preset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.preset {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #374151;
  background: #111827;
  color: #e5e7eb;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.preset:hover:not(:disabled) {
  border-color: #22c55e;
  background: #0f172a;
}

.preset:disabled {
  opacity: 0.6;
  cursor: wait;
}

.preset__icon {
  font-size: 1.35rem;
}

.preset__name {
  font-size: 0.82rem;
  font-weight: 600;
}

.preset__kw {
  font-size: 0.75rem;
  color: #9ca3af;
}

.custom {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.custom h3 {
  margin: 0 0 0.65rem;
  font-size: 0.9rem;
  color: #d1d5db;
}

.custom__row {
  display: grid;
  grid-template-columns: 1fr 0.7fr auto;
  gap: 0.5rem;
}

@media (max-width: 700px) {
  .custom__row {
    grid-template-columns: 1fr;
  }
}

.custom input {
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #4b5563;
  background: #111827;
  color: #f9fafb;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn--add {
  background: #16a34a;
  color: #fff;
}

.btn--add:hover:not(:disabled) {
  background: #15803d;
}

.btn--small {
  background: #2563eb;
  color: #fff;
  font-size: 0.8rem;
}

.btn--ghost {
  background: transparent;
  border: 1px solid #4b5563;
  color: #fca5a5;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.monitor__valor {
  margin: 0.5rem 0 0;
  font-size: 2.4rem;
  font-weight: 800;
  color: #34d399;
}

.monitor__valor--alert {
  color: #f87171;
}

.monitor__sub {
  margin: 0 0 1rem;
  color: #9ca3af;
}

.monitor__bar {
  height: 12px;
  border-radius: 999px;
  background: #111827;
  overflow: hidden;
}

.monitor__fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  transition: width 0.25s ease;
}

.monitor__fill--alert {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.monitor__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.monitor__denegado,
.monitor__ok {
  margin-top: 1rem;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.monitor__denegado {
  background: #450a0a;
  border: 1px solid #ef4444;
  color: #fecaca;
}

.monitor__ok {
  background: #064e3b;
  border: 1px solid #10b981;
  color: #a7f3d0;
}

.monitor__denegado p,
.monitor__ok p {
  margin: 0.35rem 0 0;
}

.dashboard__lista {
  margin-top: 1rem;
}

.dashboard__lista-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.dashboard__lista-head span {
  font-size: 0.85rem;
  color: #9ca3af;
}

.conectados {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.conectados li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: #111827;
  border: 1px solid #374151;
}

.conectados__info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.conectados__icon {
  font-size: 1.4rem;
}

.conectados__info small {
  display: block;
  color: #9ca3af;
  margin-top: 0.15rem;
}

.dashboard__empty {
  color: #9ca3af;
  font-size: 0.9rem;
}

.dashboard__error {
  padding: 0.75rem;
  border-radius: 8px;
  background: #450a0a;
  color: #fecaca;
  border: 1px solid #ef4444;
}

.dashboard__aviso {
  padding: 0.65rem;
  border-radius: 8px;
  background: #1e3a5f;
  color: #bfdbfe;
  border: 1px solid #3b82f6;
  margin-bottom: 0.75rem;
}

.dashboard__loading {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}
</style>
