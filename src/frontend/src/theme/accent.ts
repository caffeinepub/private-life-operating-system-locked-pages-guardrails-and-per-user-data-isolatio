export function applyAccentColor(color: string) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let c = 0;

  if (max !== min) {
    c = max - min;
    const delta = max - min;

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  const oklchL = l * 0.8 + 0.2;
  const oklchC = c * 0.15;
  const oklchH = h * 360;

  root.style.setProperty('--primary', `${oklchL.toFixed(3)} ${oklchC.toFixed(3)} ${oklchH.toFixed(1)}`);
}
