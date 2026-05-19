import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Clock, FileText, Check, Trash2, Edit2, Calendar as CalendarIcon
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = 'scheduled' | 'daddy' | 'competition'

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: EventType
  dayOfWeek: number    // 0=Sun, 1=Mon ... 6=Sat
  date?: string        // YYYY-MM-DD for one-time events
  notes?: string
  recurring: boolean
}

interface DailyHabit {
  id: string
  title: string
  lastDone: string | null  // YYYY-MM-DD
}

interface HabitCheckoffs {
  [dateKey: string]: string[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENTS_KEY = 'kyler_schedule_events'
const HABITS_KEY = 'kyler_daily_habits'
const CHECKOFFS_KEY = 'kyler_habit_checkoffs'
const PRIORITY_KEY = 'kyler_priority_practice'
const API_BASE = 'https://api.kreativeland.com'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_SHORT_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Basketball', time: '6:30pm', type: 'scheduled', dayOfWeek: 2, recurring: true },
  { id: '2', title: '街舞Breaking', time: '6pm', type: 'scheduled', dayOfWeek: 3, recurring: true },
  { id: '3', title: '珠心算 Abacus', time: '5pm', type: 'scheduled', dayOfWeek: 4, recurring: true },
  { id: '4', title: '编程课', time: '4:30pm', type: 'scheduled', dayOfWeek: 5, recurring: true },
  { id: '5', title: 'Singing @Roland', time: '11am', type: 'scheduled', dayOfWeek: 6, recurring: true },
  { id: '6', title: '少年宫Singing', time: '3:10pm', type: 'scheduled', dayOfWeek: 6, recurring: true },
  { id: '7', title: 'Yamaha', time: '6:35pm', type: 'scheduled', dayOfWeek: 0, recurring: true },
]

const INITIAL_HABITS: DailyHabit[] = [
  { id: 'h1', title: 'Read together (10 min)', lastDone: null },
  { id: 'h2', title: 'Practice phonics', lastDone: null },
  { id: 'h3', title: 'Sing a song', lastDone: null },
  { id: 'h4', title: 'English conversation', lastDone: null },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayDayOfWeek(): number {
  return new Date().getDay()
}

function daysBetween(dateStr: string, todayStr: string): number {
  const a = new Date(dateStr)
  const b = new Date(todayStr)
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

function getWeekStart(offset: number = 0): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDayOfWeek(d: Date): number {
  return d.getDay()
}

function isToday(d: Date): boolean {
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function isPast(d: Date): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const test = new Date(d)
  test.setHours(0, 0, 0, 0)
  return test < now
}

// ─── Storage ─────────────────────────────────────────────────────────────────

function loadEvents(): CalendarEvent[] {
  try {
    const data = localStorage.getItem(EVENTS_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return [...INITIAL_EVENTS]
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  fetch(`${API_BASE}/api/kaley/notes/${EVENTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: EVENTS_KEY, value: JSON.stringify(events) }),
  }).catch(() => {})
}

function loadHabits(): DailyHabit[] {
  try {
    const data = localStorage.getItem(HABITS_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return [...INITIAL_HABITS]
}

function saveHabits(habits: DailyHabit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
  fetch(`${API_BASE}/api/kaley/notes/${HABITS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: HABITS_KEY, value: JSON.stringify(habits) }),
  }).catch(() => {})
}

function loadCheckoffs(): HabitCheckoffs {
  try {
    const data = localStorage.getItem(CHECKOFFS_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return {}
}

function saveCheckoffs(checkoffs: HabitCheckoffs) {
  localStorage.setItem(CHECKOFFS_KEY, JSON.stringify(checkoffs))
  fetch(`${API_BASE}/api/kaley/notes/${CHECKOFFS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: CHECKOFFS_KEY, value: JSON.stringify(checkoffs) }),
  }).catch(() => {})
}

function loadPriorityItems(): string[] {
  try {
    const data = localStorage.getItem(PRIORITY_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

function savePriorityItems(items: string[]) {
  localStorage.setItem(PRIORITY_KEY, JSON.stringify(items))
  fetch(`${API_BASE}/api/kaley/notes/${PRIORITY_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: PRIORITY_KEY, value: JSON.stringify(items) }),
  }).catch(() => {})
}

// ─── Event Modal Component ──────────────────────────────────────────────────

function EventModal({
  event,
  defaultDayOfWeek,
  defaultDate,
  defaultType,
  onSave,
  onDelete,
  onClose,
}: {
  event: CalendarEvent | null
  defaultDayOfWeek?: number
  defaultDate?: string
  defaultType?: EventType
  onSave: (e: CalendarEvent) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [time, setTime] = useState(event?.time ?? '')
  const [type, setType] = useState<EventType>(event?.type ?? defaultType ?? 'scheduled')
  const [dayOfWeek, setDayOfWeek] = useState(event?.dayOfWeek ?? defaultDayOfWeek ?? 1)
  const [date, setDate] = useState(event?.date ?? defaultDate ?? '')
  const [recurring, setRecurring] = useState(event?.recurring ?? (defaultDate ? false : true))
  const [notes, setNotes] = useState(event?.notes ?? '')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      id: event?.id ?? Date.now().toString(),
      title: title.trim(),
      time: time.trim(),
      type,
      dayOfWeek,
      date: recurring ? undefined : date || undefined,
      notes: notes.trim() || undefined,
      recurring,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-2xl border-2 border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient">{event ? 'Edit Event' : 'Add Event'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-foreground/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Event Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-purple focus:outline-none"
              placeholder="e.g. Basketball, English lesson"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Time</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-purple focus:outline-none"
              placeholder="e.g. 6:30pm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <div className="space-y-2">
              {([
                { val: 'scheduled' as EventType, label: 'Scheduled Class', color: 'kingdom-purple' },
                { val: 'daddy' as EventType, label: 'Daddy Lesson Time', color: 'kingdom-green' },
                { val: 'competition' as EventType, label: 'Competition / Performance', color: 'kingdom-red' },
              ]).map(({ val, label, color }) => (
                <label key={val} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${type === val ? `border-${color} bg-${color}/5` : 'border-border hover:border-foreground/20'}`}>
                  <input
                    type="radio"
                    name="eventType"
                    value={val}
                    checked={type === val}
                    onChange={() => {
                      setType(val)
                      if (val === 'competition') setRecurring(false)
                      if (val === 'daddy') setTime('7:30pm')
                    }}
                  />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Repeats every week</span>
            </label>
          </div>

          {recurring ? (
            <div>
              <label className="block text-sm font-semibold mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-purple focus:outline-none"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-purple focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">Notes / Prep Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 p-3 rounded-xl border-2 border-border bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={!title.trim()} className="flex-1 btn-kingdom btn-kingdom-primary disabled:opacity-50">
            {event ? 'Save Changes' : 'Add Event'}
          </button>
          {event && (
            <button onClick={() => { onDelete(event.id); onClose() }} className="px-4 btn-kingdom !bg-red-500/10 !text-red-500 hover:!bg-red-500/20">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Habit Modal Component ──────────────────────────────────────────────────

function HabitModal({
  habit,
  onSave,
  onDelete,
  onClose,
}: {
  habit: DailyHabit | null
  onSave: (h: DailyHabit) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(habit?.title ?? '')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      id: habit?.id ?? Date.now().toString(),
      title: title.trim(),
      lastDone: habit?.lastDone ?? null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-sm p-6 shadow-2xl border-2 border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient">{habit ? 'Edit Habit' : 'Add Habit'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-foreground/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Habit Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-sky focus:outline-none"
            placeholder="e.g. Read 10 min"
            autoFocus
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={!title.trim()} className="flex-1 btn-kingdom !bg-kingdom-sky/80 !text-white hover:!bg-kingdom-sky disabled:opacity-50">
            {habit ? 'Save' : 'Add Habit'}
          </button>
          {habit && (
            <button onClick={() => { onDelete(habit.id); onClose() }} className="px-4 btn-kingdom !bg-red-500/10 !text-red-500 hover:!bg-red-500/20">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Event Badge ─────────────────────────────────────────────────────────────

const typeColorMap: Record<EventType, { border: string; bg: string; text: string }> = {
  scheduled: { border: 'border-kingdom-purple/30', bg: 'bg-kingdom-purple/10', text: 'text-kingdom-purple' },
  daddy: { border: 'border-kingdom-green/30', bg: 'bg-kingdom-green/10', text: 'text-kingdom-green' },
  competition: { border: 'border-kingdom-red/30', bg: 'bg-kingdom-red/10', text: 'text-kingdom-red' },
}

function EventBadge({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) {
  const colors = typeColorMap[event.type]
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${colors.border} ${onClick ? 'cursor-pointer hover:bg-foreground/5' : ''} transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {event.time && (
            <span className="text-xs text-foreground/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
          )}
          {event.notes && (
            <FileText className="w-3 h-3 text-foreground/30 flex-shrink-0" />
          )}
        </div>
        <span className={`inline-block text-sm font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {event.title}
        </span>
      </div>
    </div>
  )
}

// ─── Day Card ────────────────────────────────────────────────────────────────

function DayCard({
  date,
  events,
  onAddEvent,
  onEditEvent,
  compact,
  faded,
  past,
  tall,
}: {
  date: Date
  events: CalendarEvent[]
  onAddEvent: () => void
  onEditEvent: (e: CalendarEvent) => void
  compact?: boolean
  faded?: boolean
  past?: boolean
  tall?: boolean
}) {
  const today = isToday(date)
  const isPastDate = past ?? false
  const effectiveFaded = faded || isPastDate

  if (compact) {
    return (
      <div className={`rounded-lg p-1.5 transition-colors min-w-0 ${today ? 'bg-card border-2 border-kingdom-gold shadow-sm' : `bg-card border border-border ${effectiveFaded ? 'opacity-40' : 'hover:border-foreground/20'}`}`}>
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-xs font-bold truncate ${today ? 'text-kingdom-gold' : effectiveFaded ? 'text-foreground/40' : 'text-foreground'}`}>
            {date.getDate()}
          </p>
          <button
            onClick={onAddEvent}
            className={`p-0.5 rounded transition-colors flex-shrink-0 ${today ? 'bg-kingdom-gold/10 text-kingdom-gold' : effectiveFaded ? 'text-foreground/20' : 'hover:bg-foreground/5 text-foreground/40 hover:text-foreground'}`}
            title="Add event"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className={tall ? 'min-h-[3.5rem]' : ''}>
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onEditEvent(ev)}
              className={`text-xs leading-tight px-1 py-0.5 rounded cursor-pointer hover:bg-foreground/5 ${typeColorMap[ev.type].text}`}
              title={`${ev.time} ${ev.title}`}
            >
              {ev.time && <span className="text-foreground/40 mr-0.5">{ev.time}</span>}
              {ev.title}
              {ev.notes && <FileText className="w-2 h-2 inline ml-0.5 text-foreground/20" />}
            </div>
          ))}
          {events.length === 0 && !effectiveFaded && (
            <p className="text-xs text-foreground/20 py-0.5 text-center">-</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-4 transition-colors ${today ? 'bg-card border-2 border-kingdom-gold shadow-lg' : 'bg-card border-2 border-border hover:border-foreground/20'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-sm font-bold ${today ? 'text-kingdom-gold' : 'text-foreground'}`}>
            {DAY_SHORT[getDayOfWeek(date)]}
          </p>
          <p className={`text-lg font-extrabold ${today ? 'text-kingdom-gold' : 'text-foreground'}`}>
            {date.getDate()}
          </p>
        </div>
        <button
          onClick={onAddEvent}
          className={`p-1.5 rounded-lg transition-colors ${today ? 'bg-kingdom-gold/10 text-kingdom-gold hover:bg-kingdom-gold/20' : 'hover:bg-foreground/5 text-foreground/40 hover:text-foreground'}`}
          title="Add event"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        {events.length === 0 && (
          <p className="text-xs text-foreground/30 py-2 text-center">No events</p>
        )}
        {events.map((ev) => (
          <EventBadge key={ev.id} event={ev} onClick={() => onEditEvent(ev)} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [habits, setHabits] = useState<DailyHabit[]>([])
  const [checkoffs, setCheckoffs] = useState<HabitCheckoffs>({})
  const [view, setView] = useState<'week' | 'month'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<number | undefined>(undefined)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
  const [defaultType, setDefaultType] = useState<EventType | undefined>(undefined)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<DailyHabit | null>(null)
  const [weekForceRow, setWeekForceRow] = useState(true)
  const [monthShowScheduled, setMonthShowScheduled] = useState(true)
  const [monthShowDaddy, setMonthShowDaddy] = useState(true)
  const [monthShowCompetition, setMonthShowCompetition] = useState(true)
  const [priorityItems, setPriorityItems] = useState<string[]>([])
  const [newPriorityItem, setNewPriorityItem] = useState('')
  const [showPriorityModal, setShowPriorityModal] = useState(false)

  const todayStr = getToday()
  const todayDow = getTodayDayOfWeek()

  // Load data
  useEffect(() => {
    const loadedEvents = loadEvents()
    setEvents(loadedEvents)
    setHabits(loadHabits())
    setCheckoffs(loadCheckoffs())
    setPriorityItems(loadPriorityItems())

    // Try cloud sync
    const keys = [EVENTS_KEY, HABITS_KEY, CHECKOFFS_KEY, PRIORITY_KEY] as const
    keys.forEach((key) => {
      fetch(`${API_BASE}/api/kaley/notes/${key}`)
        .then(res => res.json())
        .then(data => {
          if (data.found && data.value) {
            const parsed = JSON.parse(data.value)
            if (key === EVENTS_KEY) { setEvents(parsed); localStorage.setItem(key, data.value) }
            else if (key === HABITS_KEY) { setHabits(parsed); localStorage.setItem(key, data.value) }
            else if (key === CHECKOFFS_KEY) { setCheckoffs(parsed); localStorage.setItem(key, data.value) }
            else if (key === PRIORITY_KEY) { setPriorityItems(parsed); localStorage.setItem(key, data.value) }
          }
        })
        .catch(() => {})
    })
  }, [])

  // Helpers
  function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 9999
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)
    if (!match) return 9999
    let hours = parseInt(match[1])
    const minutes = match[2] ? parseInt(match[2]) : 0
    const ampm = match[3].toLowerCase()
    if (ampm === 'pm' && hours !== 12) hours += 12
    if (ampm === 'am' && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const getEventsForDay = useCallback((dow: number, dateStr?: string, filters?: { scheduled?: boolean; daddy?: boolean; competition?: boolean }): CalendarEvent[] => {
    let result = events.filter(e => e.recurring && e.dayOfWeek === dow)
    if (dateStr) {
      const oneTime = events.filter(e => !e.recurring && e.date === dateStr)
      result = [...result, ...oneTime]
    }
    // Apply type filters
    if (filters) {
      result = result.filter(e => {
        if (e.type === 'scheduled') return filters.scheduled !== false
        if (e.type === 'daddy') return filters.daddy !== false
        if (e.type === 'competition') return filters.competition !== false
        return true
      })
    }
    return result.sort((a, b) => parseTimeToMinutes(a.time || '') - parseTimeToMinutes(b.time || ''))
  }, [events])

  const getTodayEvents = getEventsForDay(todayDow, todayStr)
  const upcomingEvents = events.filter(e => e.date && e.date >= todayStr).sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(0, 5)

  // Events CRUD
  const handleSaveEvent = (ev: CalendarEvent) => {
    setEvents(prev => {
      const exists = prev.find(e => e.id === ev.id)
      const next = exists ? prev.map(e => e.id === ev.id ? ev : e) : [...prev, ev]
      saveEvents(next)
      return next
    })
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id)
      saveEvents(next)
      return next
    })
  }

  const openAddEvent = (dayOfWeek?: number, date?: string, type?: EventType) => {
    setEditingEvent(null)
    setDefaultDayOfWeek(dayOfWeek)
    setDefaultDate(date)
    setDefaultType(type)
    setShowEventModal(true)
  }

  const openEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev)
    setDefaultDayOfWeek(undefined)
    setShowEventModal(true)
  }

  // Habits CRUD
  const handleSaveHabit = (h: DailyHabit) => {
    setHabits(prev => {
      const exists = prev.find(x => x.id === h.id)
      const next = exists ? prev.map(x => x.id === h.id ? h : x) : [...prev, h]
      saveHabits(next)
      return next
    })
    setShowHabitModal(false)
    setEditingHabit(null)
  }

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => {
      const next = prev.filter(h => h.id !== id)
      saveHabits(next)
      return next
    })
    // Also remove from checkoffs
    setCheckoffs(prev => {
      const next: HabitCheckoffs = {}
      for (const [date, ids] of Object.entries(prev)) {
        next[date] = ids.filter(i => i !== id)
      }
      saveCheckoffs(next)
      return next
    })
  }

  const toggleHabit = (habitId: string) => {
    const todayKey = todayStr
    setCheckoffs(prev => {
      const dayIds = prev[todayKey] || []
      const next = { ...prev }
      if (dayIds.includes(habitId)) {
        next[todayKey] = dayIds.filter(id => id !== habitId)
      } else {
        next[todayKey] = [...dayIds, habitId]
      }
      saveCheckoffs(next)
      return next
    })
    // Update lastDone
    setHabits(prev => {
      const isChecked = (checkoffs[todayStr] || []).includes(habitId)
      const next = prev.map(h => {
        if (h.id === habitId) {
          return { ...h, lastDone: isChecked ? (prev.find(x => x.id === habitId)?.lastDone ?? null) : todayStr }
        }
        return h
      })
      saveHabits(next)
      return next
    })
  }

  const getLastDoneText = (habit: DailyHabit): string => {
    if (!habit.lastDone) return 'Never'
    if (habit.lastDone === todayStr) return 'Today'
    const days = daysBetween(habit.lastDone, todayStr)
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  // Priority Practice CRUD
  const addPriorityItem = () => {
    if (!newPriorityItem.trim()) return
    const next = [...priorityItems, newPriorityItem.trim()]
    setPriorityItems(next)
    savePriorityItems(next)
    setNewPriorityItem('')
  }

  const removePriorityItem = (index: number) => {
    const next = priorityItems.filter((_, i) => i !== index)
    setPriorityItems(next)
    savePriorityItems(next)
  }

  const movePriorityItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= priorityItems.length) return
    const next = [...priorityItems]
    const temp = next[index]
    next[index] = next[newIndex]
    next[newIndex] = temp
    setPriorityItems(next)
    savePriorityItems(next)
  }

  // Week view dates
  const weekStart = getWeekStart(weekOffset)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  // Next week dates
  const nextWeekStart = getWeekStart(weekOffset + 1)
  const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(nextWeekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const weekLabel = weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weekOffset === 1 ? 'Next Week' : `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} — ${MONTH_NAMES[weekDates[6].getMonth()]} ${weekDates[6].getDate()}`
  const nextWeekLabel = weekOffset === 0 ? 'Next Week' : `${MONTH_NAMES[nextWeekStart.getMonth()]} ${nextWeekStart.getDate()} — ${MONTH_NAMES[nextWeekDates[6].getMonth()]} ${nextWeekDates[6].getDate()}`

  // Month view dates - Monday-first, show all days in the month
  const now = new Date()
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthYear = targetMonth.getFullYear()
  const monthIndex = targetMonth.getMonth()
  const firstDayOfWeek = new Date(monthYear, monthIndex, 1).getDay() // 0=Sun, 1=Mon...

  // Convert to Monday-first: 0=Mon, 1=Tue, ... 6=Sun
  const firstDayOfWeekMonFirst = (firstDayOfWeek + 6) % 7

  // Build full grid: include leading days from prev month and trailing days from next month
  // Start from the Monday before the 1st
  const monthDates: Date[] = []
  const startDate = new Date(monthYear, monthIndex, 1 - firstDayOfWeekMonFirst)
  // Total cells: always 42 (6 rows x 7 cols) to cover all month layouts
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    monthDates.push(d)
  }

  const monthLabel = `${MONTH_NAMES[monthIndex]} ${monthYear}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gradient">Kyler's Schedule</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView('week'); setWeekOffset(0) }}
            className={`btn-kingdom ${view === 'week' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            Week
          </button>
          <button
            onClick={() => { setView('month'); setMonthOffset(0) }}
            className={`btn-kingdom ${view === 'month' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            Month
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Today + Upcoming Events + Priority Practice + Habits row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Today Card */}
          <div className="bg-card border-2 border-kingdom-gold/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-kingdom-gold" />
                <h2 className="text-sm font-bold text-foreground">
                  Today: {DAY_NAMES[todayDow]}, {formatDate(todayStr)}
                </h2>
              </div>
              <button
                onClick={() => openAddEvent(todayDow)}
                className="p-1 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-kingdom-gold transition-colors"
                title="Add event"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 mb-2">
              {getTodayEvents.length === 0 ? (
                <p className="text-xs text-foreground/40 py-2 text-center">No events today</p>
              ) : (
                getTodayEvents.map(ev => (
                  <EventBadge key={ev.id} event={ev} onClick={() => openEditEvent(ev)} />
                ))
              )}
            </div>
          </div>

          {/* Upcoming Card */}
          <div className="bg-card border-2 border-kingdom-red/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-kingdom-red" />
              <h3 className="text-sm font-bold text-kingdom-red">Upcoming</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-foreground/30 py-2 text-center">No upcoming events</p>
            ) : (
              <div className="space-y-1">
                {upcomingEvents.map(ev => {
                  const days = ev.date ? daysBetween(ev.date, todayStr) : null
                  return (
                    <div key={ev.id} className="p-1.5 rounded-lg bg-kingdom-red/5 hover:bg-kingdom-red/10 transition-colors cursor-pointer" onClick={() => openEditEvent(ev)}>
                      <p className="text-xs font-medium text-foreground break-words">
                        {ev.date ? `${formatDate(ev.date)}: ${ev.title}` : ev.title}
                      </p>
                      {days !== null && (
                        <p className="text-xs text-foreground/50">
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : <span>In: <strong className="text-foreground">{days}</strong> days</span>}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Priority Practice Card */}
          <div className="bg-card border-2 border-kingdom-purple/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-kingdom-purple">Priority Practice</h3>
              <button
                onClick={() => { setNewPriorityItem(''); setShowPriorityModal(true) }}
                className="p-1 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-kingdom-purple transition-colors"
                title="Add practice item"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {priorityItems.map((item, index) => (
                <div key={index} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-kingdom-purple/5 group">
                  <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
                    <button
                      onClick={() => movePriorityItem(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-foreground/10 text-foreground/40 hover:text-kingdom-purple disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => movePriorityItem(index, 'down')}
                      disabled={index === priorityItems.length - 1}
                      className="p-0.5 rounded hover:bg-foreground/10 text-foreground/40 hover:text-kingdom-purple disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-foreground flex-1 break-words leading-snug">{item}</span>
                  <button
                    onClick={() => removePriorityItem(index)}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-all flex-shrink-0"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {priorityItems.length === 0 && (
                <p className="text-xs text-foreground/30 py-2 text-center">No practice items yet</p>
              )}
            </div>
          </div>

          {/* Daily Habits Card */}
          <div className="bg-card border-2 border-kingdom-sky/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">Daily Habits</h2>
              <button
                onClick={() => { setEditingHabit(null); setShowHabitModal(true) }}
                className="p-1 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-kingdom-sky transition-colors"
                title="Add habit"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-foreground/40 mb-1.5">Quick daily activities</p>

            <div className="space-y-1">
              {habits.map(habit => {
                const isChecked = (checkoffs[todayStr] || []).includes(habit.id)
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors group"
                  >
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-kingdom-sky text-white' : 'border-2 border-border hover:border-kingdom-sky'}`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${isChecked ? 'text-foreground/40 line-through' : 'text-foreground'}`}>
                        {habit.title}
                      </p>
                    </div>
                    <span className="text-xs text-foreground/30 flex-shrink-0">
                      {getLastDoneText(habit)}
                    </span>
                    <button
                      onClick={() => { setEditingHabit(habit); setShowHabitModal(true) }}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all"
                    >
                      <Edit2 className="w-2.5 h-2.5 text-foreground/40" />
                    </button>
                  </div>
                )
              })}
              {habits.length === 0 && (
                <p className="text-xs text-foreground/30 py-2 text-center">No habits yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Week View */}
        {view === 'week' && (
          <div>
            {/* This Week */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 rounded-lg hover:bg-foreground/5">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-foreground">{weekLabel}</h3>
                <label className="flex items-center gap-1.5 text-xs text-foreground/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weekForceRow}
                    onChange={(e) => setWeekForceRow(e.target.checked)}
                    className="w-3.5 h-3.5"
                  />
                  Single row
                </label>
              </div>
              <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 rounded-lg hover:bg-foreground/5">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className={weekForceRow ? 'grid grid-cols-7 gap-2 mb-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'}>
              {weekDates.map(d => (
                <DayCard
                  key={getDateStr(d)}
                  date={d}
                  events={getEventsForDay(getDayOfWeek(d), getDateStr(d))}
                  onAddEvent={() => openAddEvent(getDayOfWeek(d))}
                  onEditEvent={openEditEvent}
                  compact={weekForceRow}
                />
              ))}
            </div>

            {/* Next Week */}
            <div className="flex items-center justify-between mb-3">
              <div />
              <h3 className="text-sm font-bold text-foreground">
                {nextWeekLabel}
              </h3>
              <div />
            </div>
            <div className={weekForceRow ? 'grid grid-cols-7 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
              {nextWeekDates.map(d => (
                <DayCard
                  key={getDateStr(d)}
                  date={d}
                  events={getEventsForDay(getDayOfWeek(d), getDateStr(d))}
                  onAddEvent={() => openAddEvent(getDayOfWeek(d))}
                  onEditEvent={openEditEvent}
                  compact={weekForceRow}
                />
              ))}
            </div>
          </div>
        )}

        {/* Month View */}
        {view === 'month' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMonthOffset(prev => prev - 1)} className="p-2 rounded-lg hover:bg-foreground/5">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-foreground">{monthLabel}</h3>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={monthShowScheduled} onChange={(e) => setMonthShowScheduled(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-kingdom-purple font-medium">Classes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={monthShowDaddy} onChange={(e) => setMonthShowDaddy(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-kingdom-green font-medium">Lessons</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={monthShowCompetition} onChange={(e) => setMonthShowCompetition(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-kingdom-red font-medium">Events</span>
                  </label>
                </div>
              </div>
              <button onClick={() => setMonthOffset(prev => prev + 1)} className="p-2 rounded-lg hover:bg-foreground/5">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Day-of-week header row (Monday-first) */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_SHORT_MON_FIRST.map((name, i) => (
                <div key={i} className="text-center text-xs font-semibold text-foreground/40 py-1">{name}</div>
              ))}
            </div>
            {/* 7-column grid (Monday-first) */}
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map(d => {
                const isCurrentMonth = d.getMonth() === monthIndex
                const pastDate = isPast(d) && !isToday(d)
                return (
                  <DayCard
                    key={getDateStr(d)}
                    date={d}
                    events={getEventsForDay(getDayOfWeek(d), getDateStr(d), {
                      scheduled: monthShowScheduled,
                      daddy: monthShowDaddy,
                      competition: monthShowCompetition,
                    })}
                    onAddEvent={() => openAddEvent(getDayOfWeek(d), getDateStr(d), 'competition')}
                    onEditEvent={openEditEvent}
                    compact={true}
                    faded={!isCurrentMonth}
                    past={pastDate}
                    tall={true}
                  />
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          defaultDayOfWeek={defaultDayOfWeek}
          defaultDate={defaultDate}
          defaultType={defaultType}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => { setShowEventModal(false); setEditingEvent(null); setDefaultDayOfWeek(undefined); setDefaultDate(undefined); setDefaultType(undefined) }}
        />
      )}

      {/* Habit Modal */}
      {showHabitModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          onClose={() => { setShowHabitModal(false); setEditingHabit(null) }}
        />
      )}

      {/* Priority Practice Modal */}
      {showPriorityModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setShowPriorityModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm p-6 shadow-2xl border-2 border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient">Add Practice Item</h2>
              <button onClick={() => setShowPriorityModal(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <input
                type="text"
                value={newPriorityItem}
                onChange={(e) => setNewPriorityItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newPriorityItem.trim()) { addPriorityItem(); setShowPriorityModal(false) } }}
                className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-purple focus:outline-none"
                placeholder="e.g. Scales, Sight reading"
                autoFocus
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { addPriorityItem(); setShowPriorityModal(false) }}
                disabled={!newPriorityItem.trim()}
                className="flex-1 btn-kingdom btn-kingdom-purple disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => setShowPriorityModal(false)}
                className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
