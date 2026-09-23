import * as THREE from 'three';

// ============================================================================
// DAY / NIGHT CYCLE
// One time-of-day value drives the sky, the world lighting and the night lights.
// The sun and moon are never drawn: they move across the sky out of sight, and the
// key light follows them, so you feel where they are by how the world is lit.
// It lives outside React: the scene reads it every frame and nothing re-renders
// when it changes.
//
// time runs 0..1 over a full day: 0 midnight, 0.25 sunrise, 0.5 noon, 0.75 sunset.
// ============================================================================

// Real seconds each half takes. Day runs a little longer than night so the
// portfolio spends most of its time in its own colours.
const DAY_SECONDS = 105;
const NIGHT_SECONDS = 75;

const SUNRISE = 0.25;
const SUNSET = 0.75;

type Rgb = [number, number, number];

const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// Sky gradients, top to bottom, at the same stop positions as the original CSS gradient.
// DAY is the portfolio's own background, so noon looks exactly like it always did.
export const SKY_STOP_POSITIONS = [0, 0.28, 0.55, 0.78, 1];

const SKY = {
  night: ['#050818', '#0B1030', '#17194A', '#281D5A', '#0C0722'],
  dawnBlue: ['#262B70', '#43398C', '#7C4F9F', '#8E4A8A', '#1E0F40'],
  sunrise: ['#7F74D2', '#C9A0D6', '#FFB58E', '#E8788F', '#4B2270'],
  morning: ['#DDD0FF', '#DCC6F7', '#DDA6D4', '#B64CD8', '#55278E'],
  day: ['#E5D3FF', '#D9C7FF', '#D19DDB', '#B244E5', '#51258E'],
  golden: ['#E4CCF2', '#EDC3DA', '#EAA2BC', '#BD4FC4', '#562689'],
  sunset: ['#6F60C8', '#B783C9', '#FF9F80', '#E2577E', '#45196A'],
  duskBlue: ['#232A6E', '#3B3787', '#6A4A9F', '#7F3F8C', '#1C0E3D']
};

interface Keyframe {
  t: number;
  sky: string[];
  ambient: string;
  ambientIntensity: number;
  fillIntensity: number;
  stars: number;
}

// The noon values are the lighting the world was built under (ambient 2, fill 0.8).
const KEYFRAMES: Keyframe[] = [
  { t: 0.0, sky: SKY.night, ambient: '#4A58C8', ambientIntensity: 0.55, fillIntensity: 0.25, stars: 1 },
  { t: 0.2, sky: SKY.night, ambient: '#4A58C8', ambientIntensity: 0.55, fillIntensity: 0.25, stars: 1 },
  { t: 0.235, sky: SKY.dawnBlue, ambient: '#7B74D6', ambientIntensity: 0.9, fillIntensity: 0.4, stars: 0.35 },
  { t: 0.262, sky: SKY.sunrise, ambient: '#FFC4B0', ambientIntensity: 1.35, fillIntensity: 0.55, stars: 0 },
  { t: 0.31, sky: SKY.morning, ambient: '#FFF0F5', ambientIntensity: 1.8, fillIntensity: 0.7, stars: 0 },
  { t: 0.36, sky: SKY.day, ambient: '#FFFFFF', ambientIntensity: 2, fillIntensity: 0.8, stars: 0 },
  { t: 0.64, sky: SKY.day, ambient: '#FFFFFF', ambientIntensity: 2, fillIntensity: 0.8, stars: 0 },
  { t: 0.7, sky: SKY.golden, ambient: '#FFE6D2', ambientIntensity: 1.85, fillIntensity: 0.75, stars: 0 },
  { t: 0.742, sky: SKY.sunset, ambient: '#FFB89A', ambientIntensity: 1.4, fillIntensity: 0.55, stars: 0 },
  { t: 0.77, sky: SKY.duskBlue, ambient: '#7A6CD0', ambientIntensity: 0.9, fillIntensity: 0.4, stars: 0.4 },
  { t: 0.805, sky: SKY.night, ambient: '#4A58C8', ambientIntensity: 0.55, fillIntensity: 0.25, stars: 1 },
  { t: 1.0, sky: SKY.night, ambient: '#4A58C8', ambientIntensity: 0.55, fillIntensity: 0.25, stars: 1 }
];

// Pre-parse keyframe colours once
const PARSED = KEYFRAMES.map(k => ({
  ...k,
  skyRgb: k.sky.map(hexToRgb),
  ambientColor: new THREE.Color(k.ambient)
}));

// ---------------------------------------------------------------------------
// Moon phase from the real date, measured from a known new moon.
// 0 = new, 0.5 = full.
// ---------------------------------------------------------------------------
const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export const getMoonPhase = (date = new Date()): number => {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  return age / SYNODIC_MONTH_DAYS;
};

// ---------------------------------------------------------------------------
// Starting time: the visitor's own clock, unless ?time= says otherwise
// (a 0..1 value, or one of night / dawn / day / dusk).
// ---------------------------------------------------------------------------
const NAMED_TIMES: Record<string, number> = { night: 0.0, dawn: 0.232, day: 0.45, dusk: 0.738 };

const getInitialTime = (): number => {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('time');
    if (param) {
      if (param in NAMED_TIMES) return NAMED_TIMES[param];
      const value = parseFloat(param);
      if (!Number.isNaN(value)) return ((value % 1) + 1) % 1;
    }
  }
  const now = new Date();
  return (now.getHours() + now.getMinutes() / 60) / 24;
};

// ---------------------------------------------------------------------------
// The shared state. Everything below `time` is derived by stepDayNight().
// ---------------------------------------------------------------------------
export interface DayNightState {
  time: number;
  speed: number;           // multiplier on the cycle, for testing
  sunElevation: number;    // -1..1, above the horizon when > 0
  moonElevation: number;
  sunScreen: THREE.Vector2;  // where the sun would be on screen, 0..1 with y up
  moonScreen: THREE.Vector2;
  sunVisible: number;      // 0..1, how far above the horizon (drives the warm glow on its side)
  sunLow: number;          // 1 when the sun is on the horizon, 0 high in the sky
  moonPhase: number;       // 0 new .. 0.5 full .. 1 new
  moonIllumination: number; // lit fraction of the real moon tonight: a full moon lights the night more
  sky: THREE.Vector3[];    // gradient stops, display (sRGB) values
  stars: number;           // 0..1
  night: number;           // 0 in full daylight, 1 at night
  keyLightDirection: THREE.Vector3;
  keyLightColor: THREE.Color;
  keyLightIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  fillIntensity: number;
  lanterns: number;        // 0..1, how far into the night the lanterns are
}

const moonPhase = getMoonPhase();

export const dayNight: DayNightState = {
  time: getInitialTime(),
  speed: 1,
  sunElevation: 0,
  moonElevation: 0,
  sunScreen: new THREE.Vector2(),
  moonScreen: new THREE.Vector2(),
  sunVisible: 0,
  sunLow: 0,
  moonPhase,
  moonIllumination: (1 - Math.cos(moonPhase * Math.PI * 2)) / 2,
  sky: SKY_STOP_POSITIONS.map(() => new THREE.Vector3()),
  stars: 0,
  night: 0,
  keyLightDirection: new THREE.Vector3(0, 1, 0),
  keyLightColor: new THREE.Color(),
  keyLightIntensity: 0,
  ambientColor: new THREE.Color(),
  ambientIntensity: 2,
  fillIntensity: 0.8,
  lanterns: 0
};

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

// Fixed isometric camera axes: the camera always looks from +x+z toward -x-z,
// so screen-right is (1, 0, -1) and "toward the viewer" is (1, 0, 1).
const SCREEN_RIGHT = new THREE.Vector3(1, 0, -1).normalize();
const TOWARD_VIEWER = new THREE.Vector3(1, 0, 1).normalize();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

const SUN_HIGH_COLOR = new THREE.Color('#FFF3E2');
const SUN_LOW_COLOR = new THREE.Color('#FFB27A');
const MOON_LIGHT_COLOR = new THREE.Color('#A9BCFF');

// Arc a body travels across the screen: in from the lower left, over the top, out the lower right
const placeOnArc = (progress: number, out: THREE.Vector2) => {
  out.set(
    THREE.MathUtils.lerp(-0.08, 1.08, progress),
    0.3 + 0.56 * Math.sin(Math.PI * THREE.MathUtils.clamp(progress, 0, 1))
  );
};

// A light coming from a body's spot on screen. It is aimed partly toward the viewer so
// the faces the camera sees stay lit, the way the original key light was.
const directionFromScreen = (screen: THREE.Vector2, elevation: number, out: THREE.Vector3) => {
  out.set(0, 0, 0)
    .addScaledVector(SCREEN_RIGHT, (screen.x - 0.5) * 1.8)
    .addScaledVector(WORLD_UP, 0.35 + Math.max(elevation, 0))
    .addScaledVector(TOWARD_VIEWER, 0.7)
    .normalize();
};

const tempColorA = new THREE.Color();

/**
 * Move the clock forward (when advance is true) and recompute everything derived from it.
 */
export const stepDayNight = (delta: number, advance: boolean) => {
  const s = dayNight;

  if (advance) {
    const sunUp = s.time > SUNRISE && s.time < SUNSET;
    const rate = 0.5 / (sunUp ? DAY_SECONDS : NIGHT_SECONDS);
    s.time = (s.time + delta * rate * s.speed) % 1;
  }
  const t = s.time;

  // Sun and moon: each crosses the sky during its half of the day
  const sunProgress = (t - SUNRISE) / (SUNSET - SUNRISE);
  const moonProgress = (((t - SUNSET) % 1) + 1) % 1 / (SUNSET - SUNRISE);
  s.sunElevation = Math.sin(Math.PI * sunProgress);
  s.moonElevation = Math.sin(Math.PI * moonProgress);
  if (sunProgress < 0 || sunProgress > 1) s.sunElevation = -Math.abs(s.sunElevation);
  if (moonProgress > 1) s.moonElevation = -Math.abs(s.moonElevation);

  placeOnArc(sunProgress, s.sunScreen);
  placeOnArc(moonProgress, s.moonScreen);
  s.sunVisible = smoothstep(-0.08, 0.02, s.sunElevation);
  s.sunLow = 1 - smoothstep(0.0, 0.5, s.sunElevation);
  s.night = 1 - smoothstep(-0.12, 0.12, s.sunElevation);

  // Keyframed sky colours and ambient light
  let i = 0;
  while (i < PARSED.length - 2 && t > PARSED[i + 1].t) i++;
  const a = PARSED[i];
  const b = PARSED[i + 1];
  const f = smoothstep(0, 1, (t - a.t) / (b.t - a.t || 1));

  for (let stop = 0; stop < s.sky.length; stop++) {
    const ca = a.skyRgb[stop];
    const cb = b.skyRgb[stop];
    s.sky[stop].set(
      ca[0] + (cb[0] - ca[0]) * f,
      ca[1] + (cb[1] - ca[1]) * f,
      ca[2] + (cb[2] - ca[2]) * f
    );
  }
  s.ambientColor.copy(a.ambientColor).lerp(b.ambientColor, f);
  s.ambientIntensity = a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * f;
  s.fillIntensity = a.fillIntensity + (b.fillIntensity - a.fillIntensity) * f;
  s.stars = a.stars + (b.stars - a.stars) * f;

  // Key light: the sun while it is up, the moon after it sets. The switch happens
  // while both are on the horizon and the light is at zero, so it never jumps.
  if (s.sunElevation > -0.05) {
    directionFromScreen(s.sunScreen, s.sunElevation, s.keyLightDirection);
    s.keyLightIntensity = 2 * smoothstep(-0.02, 0.25, s.sunElevation);
    s.keyLightColor.copy(SUN_LOW_COLOR).lerp(SUN_HIGH_COLOR, smoothstep(0.05, 0.45, s.sunElevation));
  } else {
    directionFromScreen(s.moonScreen, s.moonElevation, s.keyLightDirection);
    s.keyLightIntensity = 0.6 * smoothstep(-0.02, 0.2, s.moonElevation) * (0.55 + 0.45 * s.moonIllumination);
    s.keyLightColor.copy(MOON_LIGHT_COLOR);
  }

  // Lanterns come down after sunset and go back up before sunrise
  s.lanterns = t >= 0.5
    ? smoothstep(0.742, 0.8, t)
    : 1 - smoothstep(0.205, 0.262, t);
};

// Run once so the first frame (and the CSS fallback below) has real values
stepDayNight(0, false);

/**
 * CSS version of the current sky, for the page background behind the canvas
 * so the first paint already matches the time of day.
 */
export const getSkyCssGradient = (): string => {
  const stops = dayNight.sky.map((c, i) => {
    tempColorA.setRGB(c.x, c.y, c.z, THREE.SRGBColorSpace);
    return `#${tempColorA.getHexString()} ${Math.round(SKY_STOP_POSITIONS[i] * 100)}%`;
  });
  return `linear-gradient(180deg, ${stops.join(', ')})`;
};

// Handy while working on the scene: __dayNight.set(0.75) jumps to sunset, __dayNight.speed(20) fast-forwards
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __dayNight: unknown }).__dayNight = {
    state: dayNight,
    set: (time: number) => { dayNight.time = ((time % 1) + 1) % 1; },
    speed: (multiplier: number) => { dayNight.speed = multiplier; }
  };
}
