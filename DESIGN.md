---
name: Reefscape RL
description: A Windows trainer for a REEFSCAPE policy, drawn with Neuron's glossy chrome and one shared field grid.
colors:
  aero-top: "#4e8dd4"
  aero-mid: "#2f72c4"
  aero-deep: "#1b4b8a"
  titlebar: "#1d4f87"
  ink: "#1a2638"
  ink-soft: "#3b4a62"
  muted: "#4e5d75"
  page-top: "#e9f0f9"
  page-mid: "#c6d4e8"
  page-bot: "#a8bbd4"
  surface: "#ffffff"
  surface-alt: "#f4f8fd"
  canvas: "#f6f9fd"
  grid: "#dce5f1"
  line: "#7a8ea9"
  line-strong: "#4b6185"
  inset: "#93a4bd"
  data: "#1f58a8"
  good: "#2f8a3b"
  good-ink: "#1b5425"
  good-wash: "#e6f3e4"
  warn: "#c57600"
  warn-ink: "#7a4600"
  warn-wash: "#fbefd4"
  bad: "#b02a30"
  bad-ink: "#6d1216"
  bad-wash: "#f6dcde"
typography:
  headline:
    fontFamily: "Tahoma, Verdana, Trebuchet MS, Lucida Grande, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Tahoma, Verdana, Trebuchet MS, Lucida Grande, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  body:
    fontFamily: "Tahoma, Verdana, Trebuchet MS, Lucida Grande, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  label:
    fontFamily: "Tahoma, Verdana, Trebuchet MS, Lucida Grande, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
  mono:
    fontFamily: "Consolas, Lucida Console, Courier New, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
components:
  button-primary:
    backgroundColor: "{colors.aero-deep}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
  button-command:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
  button-danger:
    backgroundColor: "{colors.bad}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "4px 6px"
  plate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px"
  tab-current:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.aero-deep}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "7px 14px 8px"
---

# Design System: Reefscape RL

## Overview

**Creative North Star: "The shared field grid"**

Reefscape RL is a working desktop trainer wearing Neuron's 2009 chrome: a glossy blue header, a lifted tab, steel title bars, and cream plates. The reward chart and the field use the same cream ground and the same soft blue grid. The active scoring face is the one mark that burns.

Density stays tight, about 12px Tahoma, because this is a tool used at a team computer. Color does the status work. Green means ready, amber means a job is running or a dependency is missing, red means stop or a failed action. The screen is light, for a room with overhead light.

**Key Characteristics:**

- Glossy blue header with the name, status, step, and reward
- Lifted tabs for Train, Field, Models, and Logs
- Steel title bars on every plate
- Cream canvases ruled with one blue grid
- Aero buttons: white for commands, blue for the main action, red for Stop

## Colors

The shell is silver-blue. Data and the active field mark are one deeper blue. Status colors sit only on state.

### Primary

- **Aero mid** (#2f72c4): The header's main blue.
- **Aero deep** (#1b4b8a): Header foot, primary button, and the data stroke.
- **Data blue** (#1f58a8): Chart line, field border, active scoring face, and the phase fill.

### Neutral

- **Page wash** (#e9f0f9 to #a8bbd4): The window behind the white body.
- **Surface** (#ffffff): Plates and the page body.
- **Surface alt** (#f4f8fd): The lower edge of a plate.
- **Canvas** (#f6f9fd): Reward chart and field.
- **Grid** (#dce5f1): The shared rule on both canvases.
- **Ink** (#1a2638): Body text.
- **Muted** (#4e5d75): Secondary lines on a plate.

### Status

- **Ready** (#2f8a3b on #e6f3e4): Python linked, a finished phase, the live pill.
- **Running** (#c57600 on #fbefd4): A job in progress, or missing training dependencies.
- **Stop** (#b02a30 on #f6dcde): Stop, and action errors.

**The One Grid Rule.** The reward chart and the field share canvas #f6f9fd and grid #dce5f1. Do not give the chart a different ground from the field.

## Typography

**Display Font:** Tahoma (Verdana, Trebuchet MS, Lucida Grande, Arial)
**Body Font:** Tahoma, same stack
**Label/Mono Font:** Consolas for logs, commands, and model paths

**Character:** A compact system face. Plate titles are small, bold, and tracked uppercase. Numbers in the header use tabular figures.

### Hierarchy

- **Headline** (700, 22px): The product name in the header.
- **Title** (700, 11px, 0.08em, uppercase): Plate title bars.
- **Body** (400, 12px, 1.45): Forms, buttons, and phase names.
- **Label** (700, 10px, 0.06em, uppercase): Status, step, and reward captions.
- **Mono** (400, 11px): The log and a selected model path.

## Layout

The window is a column: 76px header, tab strip, command row, then the body. The body maxes out at 1480px. On Train, launch and current status sit side by side, and the chart and field sit under them on a 1.35 / 0.75 split. Below 980px those pairs stack, and the header readouts wrap onto their own row.

Spacing rhythm is 6, 8, 10, and 12px. The body scrolls. The chart and field row grows to fill leftover height.

## Elevation & Depth

Depth comes from glossy gradients and a 1px steel border, not from floating cards. The header has an inset top highlight and a soft gloss sweep. Plates have a hairline top highlight and a 1px drop shadow. Buttons have an inset top highlight. Inputs are sunken.

### Shadow Vocabulary

- **Header inset** (`inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 0 rgba(0, 0, 0, 0.35)`): The glossy bar only.
- **Plate** (`inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 1px 2px rgba(16, 36, 72, 0.1)`): Every plate at rest.
- **Button** (`inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 1px 1px rgba(0, 0, 0, 0.12)`): Command buttons.
- **Input** (`inset 0 1px 2px rgba(0, 0, 0, 0.18)`): Text fields and selects.

**The No Glow Rule.** Do not put a colored halo on robots, chart lines, or status dots. The active scoring face is a larger blue dot with a soft ring, not a neon bloom.

## Shapes

Corners stay small: 3px on fields, 4px on readouts, 6px on buttons, plates, and the brand mark. Tabs are square on the bottom and rounded on the top. The field reef is a hexagon. Robots are small rounded rectangles with a white heading tick.

## Components

### Buttons

- **Shape:** 6px radius.
- **Primary:** White text on a blue gloss, used for Start Training and Run in Field.
- **Command:** White-to-steel gloss, used for Setup + Deps, Doctor, Project Folder, Host AdvantageScope, and Smoke Test.
- **Danger:** White text on a red gloss, used for Stop. Disabled when nothing is running.
- **Hover / Focus:** The border shifts toward data blue. Focus is a 2px #2f78ce ring, 2px outside the control.

### Header readouts

- **Style:** Step and reward sit in translucent chips on the header. Status is a solid wash: green when ready, amber when running.
- **State:** When the value changes, the number flips down from the top. The motion is skipped when the user prefers reduced motion.

### Tabs

- **Shape:** Top radius 6px, bottom square, sitting on the silver strip.
- **Current:** The current tab is white and sits 1px higher, with `aria-current="page"`.
- **Icon:** A 14px glossy square, a different hue for Train, Field, Models, and Logs.

### Plates

- **Style:** White face, steel border, blue title bar with white uppercase text.
- **Title extras:** A live or demo pill may sit at the right of the Field title.

### Inputs

- **Shape:** 3px radius, white fill, sunken inset border #93a4bd.
- **Checkbox row:** Heuristic pretrain and AdvantageScope stream sit under the launch fields.

### Phase list

- **Style:** Each phase has a name and one status line. A gray dot is waiting, green is done, amber is current.
- **Current:** Only the current phase shows a filled blue length.

### Canvases

- **Style:** Cream ground, 28px blue grid. The chart line is data blue. The field rectangle, reef, and active face use the same blue.

## Do's and Don'ts

- Do keep Train, Field, Models, Logs, Setup + Deps, Doctor, Project Folder, Host AdvantageScope, and Stop reachable.
- Do use Reefscape RL as the name on the interface.
- Do show a missing dependency in an amber notice that names Setup + Deps.
- Do use Consolas for logs and model paths.
- Don't add a dark metric hero, a neon field, or a second accent color for decoration.
- Don't draw the chart and the field on different grounds.
- Don't hide Stop while a job is running, and don't enable Setup + Deps, Doctor, or Host AdvantageScope while one is.
