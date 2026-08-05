// Preset beat patterns for 3 instruments (kick, hat, clap).
// Each preset is a boolean[][] — rows are instruments, columns are steps.
// Indices: [0]=kick, [1]=hat, [2]=clap

export interface Preset {
  name: string;
  description: string;
  steps: number; // pattern length
  grid: boolean[][];
}

const _ = false;
const X = true;

export const PRESETS: Preset[] = [
  {
    name: "Four on the Floor",
    description: "Classic dance kick with offbeat hats",
    steps: 16,
    grid: [
      // kick — every quarter note
      [X, _, _, _, X, _, _, _, X, _, _, _, X, _, _, _],
      // hat — offbeat 8th notes
      [_, _, X, _, _, _, X, _, _, _, X, _, _, _, X, _],
      // clap — on 2 and 4
      [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    ],
  },
  {
    name: "Basic Rock",
    description: "Kick on 1&3, snare on 2&4, 8th note hats",
    steps: 16,
    grid: [
      // kick
      [X, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _],
      // hat — every 8th
      [X, _, X, _, X, _, X, _, X, _, X, _, X, _, X, _],
      // clap — snare on 2&4
      [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    ],
  },
  {
    name: "Hip Hop",
    description: "Swung kick pattern with sparse hats",
    steps: 16,
    grid: [
      // kick — swung
      [X, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _],
      // hat
      [_, _, X, _, _, _, X, _, _, _, X, _, _, _, X, _],
      // clap — snare on 2&4
      [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    ],
  },
  {
    name: "Techno",
    description: "Driving kick with 16th note hats",
    steps: 16,
    grid: [
      // kick — four on the floor
      [X, _, _, _, X, _, _, _, X, _, _, _, X, _, _, _],
      // hat — 16th notes
      [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
      // clap — offbeat
      [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    ],
  },
  {
    name: "Empty",
    description: "Clear all steps",
    steps: 16,
    grid: [
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    ],
  },
];
