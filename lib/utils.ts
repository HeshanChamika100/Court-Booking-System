import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeWithoutSeconds(time: string) {
  const [hours, minutes] = time.split(':')
  if (hours === undefined || minutes === undefined) return time
  return `${hours}:${minutes}`
}

export function formatTimeTo12Hour(time: string) {
  const [hoursPart, minutesPart] = time.split(':')
  const hours = Number.parseInt(hoursPart ?? '', 10)
  const minutes = Number.parseInt(minutesPart ?? '', 10)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}
