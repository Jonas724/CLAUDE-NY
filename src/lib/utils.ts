import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getConfidenceColor(score: number): string {
  if (score >= 0.85) return 'text-green-600'
  if (score >= 0.65) return 'text-yellow-600'
  return 'text-red-600'
}

export function getConfidenceLabel(score: number): string {
  if (score >= 0.85) return 'Hög säkerhet'
  if (score >= 0.65) return 'Medel säkerhet'
  return 'Låg säkerhet'
}

export function getConfidenceBg(score: number): string {
  if (score >= 0.85) return 'bg-green-50 border-green-200'
  if (score >= 0.65) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}
