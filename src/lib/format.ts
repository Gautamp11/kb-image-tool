export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${trimNumber(kb)} KB`;
  }
  return `${trimNumber(kb / 1024)} MB`;
}

export function bytesToKilobytes(bytes: number): number {
  return bytes / 1024;
}

export function kilobytesToBytes(kb: number): number {
  return Math.round(kb * 1024);
}

export function sizeReductionPercent(
  originalBytes: number,
  outputBytes: number,
): number | null {
  if (originalBytes <= 0) {
    return null;
  }
  return ((originalBytes - outputBytes) / originalBytes) * 100;
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "" : value < 0 ? "+" : "";
  const magnitude = Math.abs(value);
  return `${sign}${magnitude.toFixed(digits)}%`;
}

export function formatReductionLabel(
  originalBytes: number,
  outputBytes: number,
): string {
  const change = sizeReductionPercent(originalBytes, outputBytes);
  if (change === null) {
    return "n/a";
  }
  if (Math.abs(change) < 0.05) {
    return "about the same size";
  }
  if (change > 0) {
    return `${change.toFixed(1)}% smaller`;
  }
  return `${Math.abs(change).toFixed(1)}% larger`;
}

function trimNumber(value: number): string {
  if (value >= 100) {
    return value.toFixed(0);
  }
  if (value >= 10) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}
