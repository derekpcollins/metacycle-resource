/**
 * Spec sheet, fuse map, pinouts and downloads for the Specs page.
 *
 * Every row carries the URL it came from. Values are copied from docs/RESEARCH.md §1 or
 * from the Metacyclopedia page named in `source`. If a value isn't sourced, it doesn't go
 * here; add it to `gaps` instead. Conflicts between sources are stated in `note`.
 */

export interface SpecRow {
  label: string;
  value: string;
  /** Link backing the value. */
  source: string;
  /** Short name for the source link. */
  sourceLabel: string;
  note?: string;
  /** Part page with more detail. */
  part?: string;
}

export interface SpecSection {
  id: string;
  title: string;
  rows: SpecRow[];
}

const MC = 'https://metacyclopedia.github.io/';
const s = {
  motor: [`${MC}motor/`, 'Metacyclopedia: Motor'],
  ctrl: [`${MC}controller/`, 'Metacyclopedia: Controller'],
  battery: [`${MC}battery/`, 'Metacyclopedia: Battery'],
  charger: [`${MC}charger/`, 'Metacyclopedia: Charger'],
  activator: [`${MC}battery-activator/`, 'Metacyclopedia: Battery activator'],
  parts: [`${MC}parts/`, 'Metacyclopedia: Parts'],
  home: [MC, 'Metacyclopedia: Home'],
  display: [`${MC}display-unit/`, 'Metacyclopedia: Display unit'],
  problems: [`${MC}problems/`, 'Metacyclopedia: Problems'],
  reg: [`${MC}registration/`, 'Metacyclopedia: Registration & VIN'],
  can: [`${MC}can-bus/`, 'Metacyclopedia: CAN bus'],
  cable: [`${MC}programming-cable/`, 'Metacyclopedia: Programming cable'],
  pin20: [`${MC}connect-with-20-pin-cable/`, 'Metacyclopedia: 20-pin cable'],
  bt: [`${MC}connect-via-bluetooth/`, 'Metacyclopedia: Bluetooth'],
  usb: [`${MC}connect-through-usb-port/`, 'Metacyclopedia: USB port'],
  alarm: [`${MC}removing-alarm-system/`, 'Metacyclopedia: Removing the alarm'],
  files: [`${MC}files/`, 'Metacyclopedia: Files'],
  rideapart: [
    'https://www.rideapart.com/news/622348/sondors-metacycle-us-deliveries-begin/',
    'RideApart',
  ],
  revzilla: [
    'https://www.revzilla.com/common-tread/2022-sondors-metacycle-electric-motorcycle-review',
    'RevZilla',
  ],
  old: ['https://sites.google.com/view/metacycle-pedia/parts', 'Metacycle-pedia (old site)'],
} as const;

const row = (
  label: string,
  value: string,
  [source, sourceLabel]: readonly [string, string],
  extra: Partial<SpecRow> = {},
): SpecRow => ({ label, value, source, sourceLabel, ...extra });

export const specSections: SpecSection[] = [
  {
    id: 'powertrain',
    title: 'Powertrain',
    rows: [
      row(
        'Motor',
        'QS Motor QS273 8000W 3T rear hub motor (direct drive); several revisions exist',
        s.motor,
        { part: 'hub-motor' },
      ),
      row('Power', '8 kW (11 hp) nominal / 14.5 kW (20 hp) peak', s.rideapart),
      row('Torque', '108 N·m (80 ft-lb) nominal / 176 N·m (130 ft-lb) peak', s.motor),
      row('Controller', 'Votol EM200-2SP (not the plain EM200), 60–72 V', s.ctrl, {
        part: 'controller',
      }),
      row(
        'Controller current',
        'Rated 200 A, 250 A boost; factory-limited to under 200 A (220 A sport)',
        s.ctrl,
        {
          note: 'Sources disagree on the controller rating; some say 150 A nominal.',
        },
      ),
      row('Top speed (claimed)', '60 mph in drive / 80 mph in sport', s.home, {
        note: 'With the factory display setting the speedometer over-reads (about 80 shown at a true 70 mph).',
      }),
    ],
  },
  {
    id: 'battery',
    title: 'Battery & charging',
    rows: [
      row('Battery', '72 V, 54.4 Ah NCM lithium, 4 kWh', s.battery, { part: 'battery' }),
      row('Battery current', '100 A continuous, 250 A peak (SiAECOSYS rating)', s.battery),
      row('BMS', 'CAN bus', s.battery),
      row('Battery maker', 'Believed to be Greenway (unconfirmed)', s.battery),
      row('Charger', '120/240 VAC, 1800 W in; 84 V DC, 18 A out', s.charger, { part: 'charger' }),
      row('Full charge', 'About 5 hours with the stock charger', s.charger),
      row('Charger plugs', 'NEMA 5-15 (US) and Type C (EU) included', s.charger),
      row('Charging connector', 'Chogori Large series 2+1+5', s.parts, { part: 'charging-port' }),
      row('Charging temperature', 'Never charge near or below freezing (32 °F / 0 °C)', s.battery),
    ],
  },
  {
    id: 'wheels',
    title: 'Wheels & tires',
    rows: [
      row('Front tire', '110/70 R17 at 32 psi (221 kPa)', s.parts, { part: 'tires' }),
      row('Rear tire', '150/60 R17 at 30 psi (207 kPa)', s.parts, { part: 'tires' }),
      row(
        'Factory tire brands',
        'Michelin Pilot Road 5, CST CM-NK01, possibly Kenda (varies)',
        s.parts,
      ),
      row(
        'Display wheel circumference',
        '1675 mm (factory setting 1915 mm reads high)',
        s.problems,
        {
          part: 'display',
        },
      ),
    ],
  },
  {
    id: 'chassis',
    title: 'Chassis & brakes',
    rows: [
      row('Weight', 'About 335 lb (production)', s.home),
      row('Rear shock', '310 mm eye to eye, 10 mm holes, 25 mm end widths', s.parts, {
        part: 'rear-shock',
      }),
      row('Rear brake pads', 'EBC FA266 (organic reported quietest)', s.old, {
        part: 'rear-brake-pads',
      }),
      row('Seat bolts', 'M6 × 1.00 × 25 (2), 5 mm Allen', s.parts, { part: 'seat' }),
      row('Range (claimed realistic)', 'About 60 mi', s.rideapart),
      row('Range (one reviewer)', 'Needed a charge after about 30 mi of commuting', s.revzilla),
    ],
  },
  {
    id: 'display',
    title: 'Display',
    rows: [
      row('Display unit', 'SiAECOSYS 061 DKD, 20-pin connector, powered from 72 V', s.display, {
        part: 'display',
      }),
      row('Display protocol', 'One-LIN or CAN bus to the controller', s.display),
    ],
  },
  {
    id: 'identification',
    title: 'Identification',
    rows: [
      row('VIN location', 'Left side of the head tube', s.reg),
      row(
        'VIN decoding',
        'LB2 = Zhejiang Geely Ming Industrial Co.; S = Sondors; 10th character M = 2021; 11th X = SiA (SiAECOSYS) plant',
        s.reg,
      ),
      row('VECI label', 'Right side of the head tube (some DMVs ask for it)', s.reg),
      row(
        'Engine number',
        'Stamped on the hub motor behind the rear brake disc; starts with "SIA72V800WN" followed by 12 digits',
        s.reg,
      ),
    ],
  },
];

export const fuses: SpecRow[] = [
  row('Main battery fuse', '300 A, ASTM A2209-300, inside the battery pack', s.battery, {
    note: 'Owners report drawing over 300 A briefly, so it is believed to be slow-blow.',
    part: 'main-fuse',
  }),
  row('Battery compartment fuse', '5 A blade fuse, in the battery compartment', s.battery, {
    note: 'A blown 5 A fuse is one cause of a bike that won’t power on. The circuit it protects isn’t documented.',
    part: 'fuse-5a',
  }),
];

export interface PinoutTable {
  id: string;
  title: string;
  /** Column headings after "pin / wire". */
  rows: { pin: string; signal: string }[];
  source: string;
  sourceLabel: string;
  note?: string;
}

export const pinouts: PinoutTable[] = [
  {
    id: 'charging-port',
    title: 'Charging port (battery wake-up)',
    rows: [
      { pin: '3', signal: '+12 V (wakes the battery relay)' },
      { pin: '5 or 6', signal: 'Ground (see note)' },
    ],
    source: s.charger[0],
    sourceLabel: 'Metacyclopedia: Charger and Battery activator',
    note: 'The Charger page says pin 6 is grounded; the Battery activator page says pin 5. The CAN bus is also exposed on this port. Check before wiring anything.',
  },
  {
    id: 'display-20-pin',
    title: '20-pin display connector (for programming)',
    rows: [
      { pin: '1', signal: 'CAN −' },
      { pin: '11', signal: 'CAN +' },
      { pin: '20', signal: 'Ground' },
    ],
    source: s.pin20[0],
    sourceLabel: s.pin20[1],
    note: 'Don’t use the wiring diagram from the "Metacycle First Hack" video; comments say it’s wrong. Owners report only pins 1 and 11 are needed.',
  },
  {
    id: 'usb-port',
    title: 'Storage-compartment USB port (4-wire bikes only)',
    rows: [
      { pin: 'Red', signal: '+5 V' },
      { pin: 'White', signal: 'Data − / CAN −' },
      { pin: 'Green', signal: 'Data + / CAN +' },
      { pin: 'Black', signal: 'Ground' },
    ],
    source: s.bt[0],
    sourceLabel: 'Metacyclopedia: Bluetooth and USB port pages',
    note: 'If only two wires go to your USB port, it carries power only and can’t be used for programming.',
  },
  {
    id: 'alarm-plug',
    title: 'Alarm plug (DJ7065F-2.2-11): alarm side → harness side',
    rows: [
      { pin: 'Red', signal: 'Harness red with white stripe' },
      { pin: 'Orange', signal: 'Harness yellow' },
      { pin: 'Pink', signal: 'Harness blue with white stripe (power-button light)' },
    ],
    source: s.alarm[0],
    sourceLabel: s.alarm[1],
    note: 'Bridging alarm red and orange (harness red/white and yellow) bypasses the alarm.',
  },
];

/** Bus speeds, sourced. */
export const buses: SpecRow[] = [
  row('CAN bus speed', '250 kbit/s', s.can),
  row('Programming cable serial speed', '115200 baud', s.cable),
];

/**
 * Files on Metacyclopedia's Files page that aren't mirrored on /downloads yet (names as
 * Metacyclopedia lists them). Mirrored files live in src/data/downloads.yaml.
 */
export const notMirrored = [
  'Sondors Metacycle User Manual (Sondors-authored)',
  'Sondors Metacycle Operations Manual (Sondors-authored)',
  'Metacycle Warranty (Sondors-authored)',
  'Farasis battery brochure (the battery maker isn’t confirmed)',
  'Votol EM_V3-sport-9 XY-03-P (unknown series)',
  'Vino: third-party Votol software, several versions (Metacyclopedia notes virus-scanner flags on some)',
];
export const downloadsSource = s.files[0];

/** Known gaps, from docs/RESEARCH.md §7. Shown so owners know what's missing. */
export const gaps = [
  'Rim sizes',
  'Front brake caliper and pads',
  'Fork model and oil spec',
  'Torque specs (axle nuts, caliper bolts, motor mount)',
  'Maintenance schedule',
];
