export function getDateString(date: Date) {
  return `${date.getDate().toString().padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}