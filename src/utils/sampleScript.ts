import { ScreenplayDocument } from '../types/screenplay';

export const INITIAL_SAMPLE_SCRIPT: ScreenplayDocument = {
  id: 'script-sample-01',
  version: 1,
  updatedAt: Date.now(),
  titlePage: {
    title: 'THE CHRONO HEIST',
    credit: 'written by',
    author: 'Alex Vance & Jordan Cole',
    source: 'Original Screenplay',
    draft: 'White Production Draft',
    date: 'November 2026',
    contact: 'Vance & Cole Productions\ncontact@openlipi.org\nLos Angeles, CA',
    copyright: '© 2026 OpenLipi. Maintained by Bharath Sathuri (bharathsathuri@gmail.com). MIT License.'
  },
  blocks: [
    {
      id: 'b-1',
      type: 'scene_heading',
      text: 'EXT. METROPOLIS ARCHIVES - NIGHT',
      sceneNumber: 1,
    },
    {
      id: 'b-2',
      type: 'action',
      text: 'A relentless deluge batters the obsidian facade of the archive spire. High above, searchlights cut through neon vapor. Rain cascades down gargoyle spouts like liquid mercury.',
    },
    {
      id: 'b-3',
      type: 'action',
      text: 'A grapple cable hiss-cracks against the parapet. ELENA ROSTOVA (30s), clad in matte-black tactical weather gear, vaults silently over the ledge.',
    },
    {
      id: 'b-4',
      type: 'character',
      text: 'ELENA',
    },
    {
      id: 'b-5',
      type: 'parenthetical',
      text: '(into collar mic, breathless)',
    },
    {
      id: 'b-6',
      type: 'dialogue',
      text: "I'm on the roof tier. Sensors are blind for forty seconds. Marcus, did you bypass the perimeter laser grid?",
    },
    {
      id: 'b-7',
      type: 'scene_heading',
      text: 'INT. SURVEILLANCE VAN - CONTINUOUS',
      sceneNumber: 2,
    },
    {
      id: 'b-8',
      type: 'action',
      text: 'MARCUS CHEN (20s) balances three glowing monitors on a makeshift rack. A lukewarm carton of noodles sits next to an oscilloscope.',
    },
    {
      id: 'b-9',
      type: 'character',
      text: 'MARCUS',
    },
    {
      id: 'b-10',
      type: 'dialogue',
      text: "Laser grid is spoofed. You have a clean corridor down shaft Delta-Nine. But Elena... check your biometric telemetry.",
    },
    {
      id: 'b-11',
      type: 'character',
      text: 'ELENA',
    },
    {
      id: 'b-12',
      type: 'parenthetical',
      text: '(checking wrist rig)',
    },
    {
      id: 'b-13',
      type: 'dialogue',
      text: "Pulse is ninety-eight. I'm fine.",
    },
    {
      id: 'b-14',
      type: 'character',
      text: 'MARCUS',
    },
    {
      id: 'b-15',
      type: 'dialogue',
      text: "Not your heart rate. Your chronological displacement. The temporal core is vibrating at twelve gigahertz. It knows you're outside the vault.",
    },
    {
      id: 'b-16',
      type: 'transition',
      text: 'SMASH CUT TO:',
    },
    {
      id: 'b-17',
      type: 'scene_heading',
      text: 'INT. VAULT CHAMBER - CONTINUOUS',
      sceneNumber: 3,
    },
    {
      id: 'b-18',
      type: 'action',
      text: 'A circular room of monolithic dark steel. Floating at dead center within a magnetic cradle is THE CHRONOMETER: a golden celestial sphere humming with cerulean energy arcs.',
    },
    {
      id: 'b-19',
      type: 'action',
      text: 'The ceiling vent grating pops loose. Elena drops down, landing in a featherlight three-point crouch. The floor beneath her boots glows with faint ultraviolet pressure lines.',
    },
    {
      id: 'b-20',
      type: 'character',
      text: 'ELENA',
    },
    {
      id: 'b-21',
      type: 'dialogue',
      text: "Visual confirmed on the artifact. It's stunning.",
    },
    {
      id: 'b-22',
      type: 'shot',
      text: 'CLOSE UP - THE CHRONOMETER',
    },
    {
      id: 'b-23',
      type: 'action',
      text: 'The inner brass rings spin clockwise while the outer silver orbital spins counter-clockwise. Space around the artifact slightly ripples like heat haze on blacktop.',
    },
    {
      id: 'b-24',
      type: 'action',
      text: 'Suddenly, heavy hydraulic doors across the room GROAN. A silhouette steps through the steam vents: DIRECTOR STERLING (50s), tailored three-piece suit, hands relaxed behind his back.',
    },
    {
      id: 'b-25',
      type: 'character',
      text: 'STERLING',
    },
    {
      id: 'b-26',
      type: 'dialogue',
      text: "Ten seconds ahead of schedule, Miss Rostova. You always were impatient with history.",
    },
    {
      id: 'b-27',
      type: 'dual_dialogue',
      text: '',
      character1: 'ELENA',
      parenthetical1: '(raising weapon)',
      dialogue1: "Step away from the control console!",
      character2: 'STERLING',
      parenthetical2: '(smiling calmly)',
      dialogue2: "You cannot shoot what already belongs to tomorrow."
    },
    {
      id: 'b-28',
      type: 'action',
      text: 'Sterling taps a golden pocket watch. A blinding FLASH OF COLD WHITE LIGHT erupts from the pedestal.',
    },
    {
      id: 'b-29',
      type: 'transition',
      text: 'MATCH CUT TO:',
    },
    {
      id: 'b-30',
      type: 'scene_heading',
      text: 'EXT. METROPOLIS PLAZA - DAY (FLASHBACK)',
      sceneNumber: 4,
    },
    {
      id: 'b-31',
      type: 'action',
      text: 'Sunshine, bustling crowds, pigeons taking flight. Elena sits on a bronze bench holding an unburned photograph of the same vault.',
    },
    {
      id: 'b-32',
      type: 'character',
      text: 'ELENA',
    },
    {
      id: 'b-33',
      type: 'parenthetical',
      text: '(to herself)',
    },
    {
      id: 'b-34',
      type: 'dialogue',
      text: "It didn't start tonight. It started seven years ago.",
    },
    {
      id: 'b-35',
      type: 'transition',
      text: 'FADE OUT.',
    }
  ]
};
