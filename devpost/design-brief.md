---
status: approved
---

# Design brief: BenchPulse — Spatial PCB Soldering & Circuit Coach for SPECS

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
I'm sitting at my electronics workbench holding a 350°C soldering iron in my right hand and solder wire in my left, looking down at a microcontroller breakout board 85 cm in front of me. A glowing cyan target ring hovers directly over the exact through-hole pad I need to solder next (`U1 Pin 4 — +3.3VVDD`), while a compact step card floats 12 cm to the upper-left of the board showing the polarity warning and a 3.5-second heat timer ring that counts down when I trigger the joint—and collapses back into a quiet green checkmark dot the moment the joint is done.

## Why it belongs on glasses
- Uses: shares your view / draws in the world / leaves your body free
- Why it's better than the phone or laptop version: When soldering or probing a live PCB, both hands are occupied with high-temperature tools and fine-pitch leads. Looking away at a laptop schematic or touching a phone screen breaks eye-hand alignment on sub-millimeter pads and risks burning components or bridging pins. Glasses keep pinout polarity, step timing, and continuity alerts anchored directly on the board where my eyes are already focused.

## Product or overlay
- Type: overlay: it responds to something real
- What the real version would sense: Fiducial markers on the physical PCB to lock the 3D pinout overlay onto the real board, iron tip proximity to start the 3.5-second thermal timer, and continuity/short readings from a Bluetooth bench multimeter.
- Stand-in for the preview: A real-scale virtual workbench mat and 3D PCB (`32 cm × 22 cm`) placed at desk height in front of the user, paired with three explicit stand-in buttons on the bench dock: **"Found Board (Lock Fiducials)"** to snap the spatial overlay onto the PCB pads, **"Simulate Iron Contact (3.5s Heat)"** to run the live thermal countdown on the active pad, and **"Simulate Continuity Short"** to trigger the out-of-view bench multimeter alert and polarity inspection flow.

## Where things live
- Where the user is looking during the main task: Slightly downward (`12°` below eye level, `y = -18 cm`) at the electronics workbench surface `85 cm` in front of them (`z = -85 cm`), well inside SPECS' `37° × 32°` field of view (`usable area ~41 cm × 59 cm` at `85 cm`).
- Virtual Workbench Mat & 3D PCB (`BenchPcbRoot`): Anchored horizontally in front of the user at `z = -85 cm`, `y = -22 cm`, `x = 0 cm`, size `32 cm × 22 cm × 2.5 cm`.
- Spatial Pad Dots & Active Target Ring (`PadRing_1` to `PadRing_4`): Anchored `1.5 cm` directly above each target component footprint on the PCB (`z = -83 cm to -87 cm`, `y = -20.5 cm`), `1.2 cm` diameter when idle (ambient dot) and expanding to a `3.6 cm` glowing cyan/amber ring when active.
- Active Step Coach Card (`BenchPulseCoachUI`): Floating `12 cm` to the upper-left of the active pad at `x = -14 cm`, `y = -8 cm`, `z = -90 cm`, size `26 cm × 16 cm` (static `BackPlate` with `Content` at `+0.6 cm` Z-offset).
- Stand-In & Hands-Free Control Dock (`BenchPulseDiagnosticsUI`): Anchored at the front-right edge of the bench within easy low-arm reach at `x = 15 cm`, `y = -12 cm`, `z = -85 cm`, size `24 cm × 15 cm` (`Frame` with `autoShowHide = false`, `autoScaleContent = false`).
- Out-of-View Bench Multimeter Station (`MultimeterStationRoot`): Placed off to the right side of the bench at `x = 48 cm`, `y = -10 cm`, `z = -90 cm` (outside the immediate `32°` horizontal view when looking at the PCB), size `14 cm × 18 cm × 8 cm`, accompanied by an in-view edge wayfinder arrow (`WayfinderArrow`, `4.5 cm × 2.5 cm` at `x = 12 cm`, `y = -4 cm`, `z = -85 cm`) that appears only when a continuity fault occurs.

## Hands and input
- Pinch "Found Board" button (`LockBoardButton`): `pinch / button` (`8 cm × 4.5 cm` target on the Stand-In Dock) to lock fiducials and reveal the first active pad ring.
- Pinch "Heat Pad (3.5s)" button (`HeatPadButton`): `pinch / button` (`8 cm × 4.5 cm` target) to simulate soldering iron contact and run the 3.5-second thermal timer ring over the active pad.
- Pinch "Next Joint" button (`NextStepButton`): `pinch / button` (`9 cm × 4.5 cm` target on the Step Coach Card) to mark the current solder joint complete, collapse its card into a green check dot, and advance the spatial ring to the next component pad.
- Pinch "Test Short Alert" button (`TriggerShortButton`): `pinch / button` (`8 cm × 4.5 cm` target on the Stand-In Dock) to simulate a solder bridge between `3.3V` and `GND`, triggering the spatial chime and edge wayfinder arrow toward the multimeter on the right.
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: Voice commands `"Next joint"`, `"Heat pad"`, and `"Clear fault"` via Specs `ASRModule` (optional), each paired 1:1 with `NextStepButton`, `HeatPadButton`, and `AcknowledgeFaultButton` so the preview works 100% with mouse pinch and LEAF.

## When things show
- Pad Status Dots (`PadRing_1..4`): Inactive pads show only a minimal `1.2 cm` dot so the board surface stays unobstructed. Only the single active step expands into a `3.6 cm` animated target ring + floating pin label (`+3.3V`, `GND`, `I2C_SDA`, `I2C_SCL`).
- Step Coach Card (`BenchPulseCoachUI`): Shows after pressing `LockBoardButton` for the active soldering step; automatically hides its detailed instructions once all 4 joints pass inspection, leaving a clean summary badge.
- Continuity Fault Banner & Edge Wayfinder Arrow (`WayfinderArrow`): Hidden during normal assembly; shows immediately with a spatial alert chime when `TriggerShortButton` is pinched, pointing right (`→ Look Right 35°: 3.3V–GND Bridge on Pad 2`), and hides as soon as the user pinches `AcknowledgeFaultButton` (`Clear Fault & Re-heat`).
- If something needs attention out of view: Spatial chime (`ContinuityAlert.wav`) plus a bright amber edge wayfinder arrow (`WayfinderArrow`) inside the main FOV pointing right toward the bench multimeter station.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. **Board lock & spatial ring activation (`logic proven`):** Pinching `LockBoardButton` ("Found Board") transitions the Lens from idle standby to Step 1 (`U1 Pin 4: +3.3V Decoupling Cap`), activates `PadRing_1` directly on the 3D PCB, and updates `StepTitleText` on `BenchPulseCoachUI` to `"Step 1/4: Solder C1 (+3.3V)"`.
2. **Thermal countdown on the active pad (`logic proven`):** Pinching `HeatPadButton` ("Heat Pad 3.5s") animates the thermal ring on the active pad and updates `TimerStatusText` to `"Heating: 350°C — Flow Ready"`, playing `HeatTimerTick.wav` and `JointCompleteChime.wav`.
3. **Step progression & clutter-free recension (`logic proven`):** Pinching `NextStepButton` ("Next Joint") collapses the completed pad's ring into a quiet green check dot, advances the active ring to the next pad location (`PadRing_2` → `PadRing_3` → `PadRing_4`), and updates the step counter (`1/4` → `2/4` → `3/4` → `4/4` → `"Board Passed QC"`).
4. **Out-of-view continuity fault & wayfinder guidance (`logic proven`):** Pinching `TriggerShortButton` ("Simulate Short") activates `WayfinderArrow` and `FaultPopupRoot`, plays `ContinuityAlert.wav`, and displays `"SHORT DETECTED: Look Right → Multimeter (0.2 Ω)"`; pinching `AcknowledgeFaultButton` clears the fault and hides the banner.
5. **Ergonomic reachability & additive readability (`logic proven` in IK / `feel unproven` on hardware):** All interactive buttons sit within `85–90 cm` distance and `-8 to -18 cm` vertical offset, verified by a LEAF `createIKInteractor()` reachability scenario, with high-luminance text (`#F4FAFF`, `#4DF0FF`, `#FFB830`, `#38F29B`) for additive transparent optics.

## Out of scope
- Live computer-vision solder wetting quality classification via SnapML camera frames.
- Real Bluetooth BLE GATT socket connection to a hardware Fluke/Brymen multimeter.
- Multi-user shared workbench sessions (Connected Lenses / SyncKit).
- Recording, identifying, or tracking people in the room.

## Risks and open questions
- **Additive brightness over a real bright bench lamp (`feel unproven`):** In Lens Studio's preview the additive shader simulation is clearly legible, but under a real 1000-lumen soldering magnifier lamp on physical SPECS glasses, cyan/amber contrast may need higher alpha backing.
- **Fine depth perception at 60–85 cm (`feel unproven`):** Target rings are placed `1.5 cm` above each pad on the virtual PCB (`logic proven`), whereas real binocular vergence-accommodation comfort over a 30-minute soldering session can only be verified on physical SPECS hardware.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
   - *Verified:* All 5 Done Criteria are covered by automated LEAF scenarios registered in `Assets/Tests/LeafIndex.ts` (`benchpulse-board-lock`, `benchpulse-heat-timer`, `benchpulse-step-progression`, `benchpulse-continuity-fault`, and `benchpulse-ik-reachability`). All 5 scenarios report `PASSED` in the Logger panel.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
   - *Verified:* Walked the virtual room with WASD and looked down `12°` at the workbench (`z = -85 cm, y = -22 cm`). Panning `35°` right reveals `MultimeterStationRoot` at `x = 48 cm` exactly where `WayfinderArrow` points.
3. **Ask the three questions.**
   - Does it use what I'm looking at? *Yes — locks onto the PCB fiducial stand-in right in the downward workbench gaze.*
   - Does it put something in my space, where it belongs? *Yes — each target ring sits on its physical PCB pad in 3D space, and the multimeter alert sits on the bench to the right.*
   - Does it free my hands or let me keep my eyes up? *Yes — hands stay on the iron and solder wire while eyes stay on the PCB.*
   - Would it be just as good on a phone? If so, what would make it need the glasses? *No — a phone screen forces you to look away from a hot 350°C iron tip and tap capacitive glass with flux-covered fingers.*
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
   - **Logic proven:** Fiducial lock stand-in (`LockBoardButton`), 4-pad spatial ring progression (`PadRing_1..4`), 3.5s thermal timer state machine (`HeatPadButton`), out-of-view continuity short alert + edge wayfinder arrow (`TriggerShortButton` / `AcknowledgeFaultButton`), UIKit `FlexLayout` + `+0.6 cm` Z-offset non-overlapping rendering, and IK arm reachability (`BenchPulseIKReachabilityScenario`).
   - **Feel unproven:** Real hand-tracking pinch reliability while holding a soldering iron pencil grip, additive contrast against a real 1000-lumen desk lamp, and real camera fiducial lock latency on physical SPECS glasses.
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
   - *Iteration 1 applied:* Originally the Step Coach Card sat at `y = 2 cm` (eye level), which forced looking up from the PCB. We nudged `BenchPulseCoachUI` down `10 cm` to `y = -8 cm, x = -14 cm, z = -90 cm` so both the active PCB pad and the step card fit inside the `37° × 32°` SPECS field of view simultaneously without tilting the head.
   - *Iteration 2 applied:* Increased `NextStepButton` and `HeatPadButton` height from `3.2 cm` to `4.5 cm` (`9 cm × 4.5 cm`) for effortless pinch targeting and re-ran all 5 LEAF scenarios (`PASSED`).
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
