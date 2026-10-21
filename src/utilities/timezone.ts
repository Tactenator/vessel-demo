// The business operates out of Omaha, NE — all "wall clock" date/time entry in the
// dashboard (e.g. a manager typing "3:00 PM" for a drive) means 3:00 PM Central,
// regardless of what timezone the entering browser or hosting server happens to be in.
export const VENUE_TIMEZONE = 'America/Chicago'

/**
 * Converts a `<input type="datetime-local">` value ("YYYY-MM-DDTHH:mm", no timezone)
 * into the correct UTC ISO instant, treating the wall-clock numbers as `timeZone` time.
 * DST-aware (uses Intl to look up the zone's actual offset for that specific date).
 */
export function zonedTimeToUtcIso(localDateTimeStr: string, timeZone: string = VENUE_TIMEZONE): string {
  if (!localDateTimeStr) return ''

  const [datePart, timePart] = localDateTimeStr.split('T')
  if (!datePart || !timePart) return ''

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  // Treat the input numbers as if they were UTC, then see what wall-clock time that
  // UTC instant reads as in `timeZone`. The delta between the two is the zone's offset
  // for this exact date (DST-safe), which we apply to recover the true UTC instant.
  const asUTC = Date.UTC(year, month - 1, day, hour, minute)

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(asUTC))
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '0'
  const hourPart = get('hour')

  const zonedAsIfUTC = Date.UTC(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    hourPart === '24' ? 0 : Number(hourPart),
    Number(get('minute')),
    Number(get('second')),
  )

  const offset = zonedAsIfUTC - asUTC
  return new Date(asUTC - offset).toISOString()
}

/**
 * Converts a stored UTC ISO string into a `<input type="datetime-local">` value
 * ("YYYY-MM-DDTHH:mm") representing that instant's wall-clock time in `timeZone`.
 * Inverse of zonedTimeToUtcIso — used to pre-fill edit forms.
 */
export function utcIsoToZonedDateTimeLocal(
  isoString?: string,
  timeZone: string = VENUE_TIMEZONE,
): string {
  if (!isoString) return ''

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(isoString))
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00'
  const hourPart = get('hour')
  const hour = hourPart === '24' ? '00' : hourPart

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}
