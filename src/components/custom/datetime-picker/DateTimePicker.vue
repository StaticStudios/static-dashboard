<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {CalendarIcon, ChevronLeft, ChevronRight} from 'lucide-vue-next'
import {cn} from '@/lib/utils'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const open = ref(false)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function fromModel() {
  return props.modelValue ? new Date(props.modelValue) : null
}

const viewDate = ref(fromModel() ?? new Date())
const selectedDay = ref<Date | null>(fromModel())
const timeHours = ref(fromModel() ? String(fromModel()!.getHours()).padStart(2, '0') : '00')
const timeMinutes = ref(fromModel() ? String(fromModel()!.getMinutes()).padStart(2, '0') : '00')

watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val)
    selectedDay.value = d
    viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
    timeHours.value = String(d.getHours()).padStart(2, '0')
    timeMinutes.value = String(d.getMinutes()).padStart(2, '0')
  } else {
    selectedDay.value = null
  }
})

const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const days: Array<{ date: Date; current: boolean }> = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({date: new Date(year, month - 1, daysInPrev - i), current: false})
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({date: new Date(year, month, i), current: true})
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({date: new Date(year, month + 1, i), current: false})
  }
  return days
})

function prevMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

function nextMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isToday(d: Date) {
  return isSameDay(d, new Date())
}

function buildEpoch(): number | null {
  if (!selectedDay.value) return null
  const d = new Date(selectedDay.value)
  const h = Math.min(23, Math.max(0, parseInt(timeHours.value) || 0))
  const m = Math.min(59, Math.max(0, parseInt(timeMinutes.value) || 0))
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

function selectDay(day: Date) {
  selectedDay.value = day
  emit('update:modelValue', buildEpoch())
}

function onTimeChange() {
  emit('update:modelValue', buildEpoch())
}

function clear() {
  selectedDay.value = null
  timeHours.value = '00'
  timeMinutes.value = '00'
  emit('update:modelValue', null)
  open.value = false
}

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder ?? 'Pick date & time'
  return new Date(props.modelValue).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
          variant="outline"
          :class="cn('w-full justify-start text-left font-normal h-8 text-xs px-2', !modelValue && 'text-muted-foreground')"
      >
        <CalendarIcon class="mr-1.5 size-3 shrink-0"/>
        {{ displayValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <div class="p-3 space-y-3">

        <!-- Month navigation -->
        <div class="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" class="size-7" @click="prevMonth">
            <ChevronLeft class="size-3.5"/>
          </Button>
          <span class="text-sm font-medium">{{ MONTHS[viewMonth] }} {{ viewYear }}</span>
          <Button variant="outline" size="icon" class="size-7" @click="nextMonth">
            <ChevronRight class="size-3.5"/>
          </Button>
        </div>

        <!-- Day-of-week headers -->
        <div class="grid grid-cols-7">
          <div
              v-for="d in DAY_HEADERS"
              :key="d"
              class="flex items-center justify-center size-8 text-xs text-muted-foreground font-medium"
          >
            {{ d }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7">
          <button
              v-for="(day, i) in calendarDays"
              :key="i"
              class="flex items-center justify-center size-8 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :class="[
                !day.current && 'text-muted-foreground opacity-40',
                selectedDay && isSameDay(day.date, selectedDay)
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : isToday(day.date) && !selectedDay
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
              ]"
              @click="selectDay(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>

        <!-- Time picker -->
        <div class="border-t pt-3 flex items-center gap-2">
          <span class="text-xs text-muted-foreground w-8 shrink-0">Time</span>
          <input
              v-model="timeHours"
              type="number"
              min="0" max="23"
              class="border-input bg-transparent border rounded-md h-7 w-12 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @change="onTimeChange"
          />
          <span class="text-sm font-semibold text-muted-foreground">:</span>
          <input
              v-model="timeMinutes"
              type="number"
              min="0" max="59"
              class="border-input bg-transparent border rounded-md h-7 w-12 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @change="onTimeChange"
          />
        </div>

        <!-- Clear -->
        <div v-if="modelValue" class="border-t pt-2">
          <Button variant="ghost" size="sm" class="w-full h-7 text-xs" @click="clear">
            Clear
          </Button>
        </div>

      </div>
    </PopoverContent>
  </Popover>
</template>
