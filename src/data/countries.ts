export const COUNTRIES = [
  { name: 'Pakistan', code: 'PK' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Ireland', code: 'IE' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Norway', code: 'NO' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Austria', code: 'AT' },
  { name: 'Portugal', code: 'PT' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Brazil', code: 'BR' },
  { name: 'South Africa', code: 'ZA' },
] as const

export type CountryName = (typeof COUNTRIES)[number]['name']

export function countryCode(name: string): string {
  return COUNTRIES.find((c) => c.name === name)?.code ?? 'US'
}
