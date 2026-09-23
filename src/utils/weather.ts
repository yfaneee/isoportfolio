// ============================================================================
// WEATHER
// Rain and snow come and go at random. A clear spell lasts anywhere from one to
// five minutes; then it rains or snows for a minute and a half to three. Some of
// the time it turns straight from rain to snow (or back) without clearing, how
// heavy it is changes every time, and some rain comes as a thunderstorm.
//
// Like the day/night clock, this lives outside React and the scene reads it
// every frame.
// ============================================================================

export type WeatherKind = 'clear' | 'rain' | 'snow';

const FIRST_CLEAR_SECONDS: [number, number] = [20, 120];  // shorter, so a visit has a fair chance of weather
const CLEAR_SECONDS: [number, number] = [60, 300];
const PRECIPITATION_SECONDS: [number, number] = [90, 180];
const SWITCH_CHANCE = 0.35;   // rain straight into snow (or snow into rain) instead of clearing
const STORM_CHANCE = 0.35;    // rain that comes with lightning

const RAIN_FADE_SECONDS = 8;
const SNOW_FADE_SECONDS = 12;
const SNOW_SETTLE_SECONDS = 70;   // heavy snow covers the tops completely in about this long
const SNOW_MELT_SECONDS = 45;
const SNOW_MELT_IN_RAIN_SECONDS = 15;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);

export interface WeatherState {
  kind: WeatherKind;       // the current spell
  remaining: number;       // seconds left in it
  strength: number;        // how heavy this spell is, 0..1
  storm: boolean;
  windX: number;           // sideways drift, world units per second
  windZ: number;
  rain: number;            // what is actually falling right now, eased toward the spell, 0..1
  snow: number;
  snowCover: number;       // how much snow has settled on the tops, 0..1
  wetness: number;         // how wet the tops are, 0..1
  overcast: number;        // how much cloud dims the sky and the sun, 0..1
  flash: number;           // lightning, 0..1+
  nextStrike: number;
  strikeAge: number;
}

export const weather: WeatherState = {
  kind: 'clear',
  remaining: between(FIRST_CLEAR_SECONDS),
  strength: 0,
  storm: false,
  windX: 0,
  windZ: 0,
  rain: 0,
  snow: 0,
  snowCover: 0,
  wetness: 0,
  overcast: 0,
  flash: 0,
  nextStrike: 0,
  strikeAge: 99
};

const startSpell = (kind: WeatherKind, storm = false) => {
  weather.kind = kind;
  weather.storm = storm;
  if (kind === 'clear') {
    weather.remaining = between(CLEAR_SECONDS);
    return;
  }
  weather.remaining = between(PRECIPITATION_SECONDS);
  weather.strength = storm ? 0.85 + Math.random() * 0.15 : 0.4 + Math.random() * 0.6;
  const windAngle = Math.random() * Math.PI * 2;
  const windSpeed = (kind === 'rain' ? 2.5 : 0.8) * Math.random() * (storm ? 1.8 : 1);
  weather.windX = Math.cos(windAngle) * windSpeed;
  weather.windZ = Math.sin(windAngle) * windSpeed;
  weather.nextStrike = 3 + Math.random() * 8;
};

const nextSpell = () => {
  if (weather.kind === 'clear') {
    const kind = Math.random() < 0.5 ? 'rain' : 'snow';
    startSpell(kind, kind === 'rain' && Math.random() < STORM_CHANCE);
  } else if (Math.random() < SWITCH_CHANCE) {
    const kind = weather.kind === 'rain' ? 'snow' : 'rain';
    startSpell(kind, kind === 'rain' && Math.random() < STORM_CHANCE);
  } else {
    startSpell('clear');
  }
};

// ?weather=rain | snow | storm | clear starts with that spell (then it carries on at random)
if (typeof window !== 'undefined') {
  const param = new URLSearchParams(window.location.search).get('weather');
  if (param === 'rain' || param === 'snow') startSpell(param);
  else if (param === 'storm') startSpell('rain', true);
  else if (param === 'clear') startSpell('clear');
}

const approach = (value: number, target: number, step: number) =>
  value < target ? Math.min(value + step, target) : Math.max(value - step, target);

/** Move the weather on by delta seconds. `night` (0..1) decides whether lightning shows. */
export const stepWeather = (delta: number, night: number) => {
  const w = weather;

  w.remaining -= delta;
  if (w.remaining <= 0) nextSpell();

  // Ease what is falling toward the current spell. Switching rain to snow crossfades through sleet.
  w.rain = approach(w.rain, w.kind === 'rain' ? w.strength : 0, delta / RAIN_FADE_SECONDS);
  w.snow = approach(w.snow, w.kind === 'snow' ? w.strength : 0, delta / SNOW_FADE_SECONDS);

  // Snow settles while it falls and melts once it stops, faster in the rain
  if (w.snow > 0.25) {
    w.snowCover = Math.min(1, w.snowCover + (delta / SNOW_SETTLE_SECONDS) * w.snow);
  } else {
    const meltSeconds = w.rain > 0.2 ? SNOW_MELT_IN_RAIN_SECONDS : SNOW_MELT_SECONDS;
    w.snowCover = Math.max(0, w.snowCover - delta / meltSeconds);
  }

  // Tops get wet quickly in the rain and dry slowly after
  w.wetness = w.rain > w.wetness
    ? approach(w.wetness, w.rain, delta / 6)
    : approach(w.wetness, w.rain, delta / 40);

  w.overcast = Math.max(w.rain * 0.85, w.snow * 0.55);

  // Lightning: a bright strike and a weaker second flicker, every few seconds in a heavy storm
  w.strikeAge += delta;
  if (w.storm && w.rain > 0.6) {
    w.nextStrike -= delta;
    if (w.nextStrike <= 0) {
      w.strikeAge = 0;
      w.nextStrike = 6 + Math.random() * 14;
    }
  }
  const age = w.strikeAge;
  const strike = Math.exp(-age * 14) + (age > 0.18 ? 0.6 * Math.exp(-(age - 0.18) * 11) : 0);
  // Lightning reads at night; in daylight it is only a faint brightening
  w.flash = strike * (0.25 + 0.75 * night);
};

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __weather: unknown }).__weather = {
    state: weather,
    set: (kind: WeatherKind | 'storm') => {
      if (kind === 'storm') startSpell('rain', true);
      else startSpell(kind);
    },
    strike: () => { weather.strikeAge = 0; }
  };
}
