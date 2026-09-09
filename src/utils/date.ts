import moment from 'moment-timezone';

/**
 * Formats a date as DD.MM.YYYY in the given IANA time zone.
 */
export function formatDate(date: Date, timeZone: string): string {
  return moment(date).tz(timeZone).format('DD.MM.YYYY');
}