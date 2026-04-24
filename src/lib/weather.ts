export function waveEmoji(heightMeters: number): string {
  if (heightMeters < 0.4) return "🫧";
  if (heightMeters < 1.0) return "🌊";
  if (heightMeters < 1.8) return "🌊🌊";
  return "🌊🌊🌊";
}

export function windEmoji(kts: number): string {
  if (kts < 8) return "🍃";
  if (kts < 16) return "💨";
  return "🌬️";
}

export function skyEmoji(cloudCoverPct: number | undefined, precipMm: number | undefined): string {
  if ((precipMm ?? 0) > 0.3) return "🌧️";
  const cc = cloudCoverPct ?? 0;
  if (cc < 20) return "☀️";
  if (cc < 60) return "🌤️";
  return "☁️";
}

export function windLabel(kts: number): string {
  if (kts < 8) return "Light";
  if (kts < 16) return "Fresh";
  if (kts < 25) return "Strong";
  return "Gale";
}

export function directionArrow(deg: number): string {
  // Points in the direction the swell is coming FROM → flip for arrow "travel" feel
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return arrows[idx];
}

export function compass(deg: number): string {
  const names = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return names[idx];
}
