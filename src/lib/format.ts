export function formatNumber(value: number): string {
  return value.toLocaleString('en-PH');
}

export function formatArea(value: number): string {
  return `${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} km²`;
}

export function plural(value: number, singular: string, pluralForm = `${singular}s`): string {
  return value === 1 ? singular : pluralForm;
}
