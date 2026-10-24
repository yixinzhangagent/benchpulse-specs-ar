# `plan-lens` Design Interview & CLAD Build Transcript

**Hackathon:** Learn AR with SPECS (Devpost Learn)  
**Project:** `BenchPulse` (`BenchPulse.esproj`)  
**Skill Pack:** `npx skills add challengepost/learn-specs --all -y` (`skills/plan-lens/SKILL.md`)  
**Build Agent:** Snap CLAD (`ls-clad@ls-extensions` — `specs-experience-builder` + `specs-build-ui` + `specs-leaf-write-scenarios`)

---

## Part 1: `plan-lens` Interactive Design Interview

> **Agent (`plan-lens`):**  
> Setup check complete: `BenchPulse.esproj` is in the current folder, `lens-studio` MCP is connected, and the `ls-clad` plugin (`specs-experience-builder`, `specs-build-ui`, `specs-leaf-write-scenarios`) is installed. Created `devpost/`.  
>  
> Welcome to Learn AR with SPECS. As the concept video showed, a coding agent builds what you describe, so the more specific your description, the better your Lens. Instead of you writing that description, I'll interview you about your idea and check it against AR design habits and what Lens Studio's preview can do. Your answers become a design brief, saved to `devpost/design-brief.md`. Then you start a fresh chat, point CLAD at the brief, and it builds the Lens.  
>  
> This takes about 20 to 30 minutes and six to eight questions. You make the decisions. I'll ask follow-ups and point out where an idea might fight the glasses or the preview. Speech-to-text helps.  
>  
> **Question 1 (The idea):** What would you like to make for glasses? If you don't have an idea yet, tell me a bit about what you spend your time on.

**Learner (Yixin Zhang):**  
I build robotics and edge hardware prototypes, so I spend a lot of time soldering PCBs and probing sensor breakout boards at my workbench. Every time I solder a microcontroller or sensor header, my right hand is holding a 350°C soldering iron and my left hand is feeding solder wire, but I have to keep turning my head 60 degrees to my laptop screen to check which pin is `+3.3V`, `GND`, `SDA`, or `SCL` and whether a capacitor is polarized. I want an AR workbench coach for SPECS that puts the pinout, thermal countdown, and continuity alerts right on the board so my hands stay free and my eyes never leave the iron tip.

> **Agent (`plan-lens`):**  
> That hits all three strengths of glasses—your hands are locked onto a hot tool, your eyes have to stay on a tiny target, and the information belongs directly on the physical board.  
>  
> **Question 2 (The spatial moment):** Picture the moment your Lens is at its best. What are you doing, and what do you see?

**Learner:**  
I'm looking slightly down at my desk where the PCB sits about 85 cm away. Instead of a giant schematic floating in front of my face, only the single pad I'm soldering right now has a glowing cyan target ring around it, with a small floating tag (`+3.3V — C1 Positive`) right above the pad and a compact step card just to the upper-left of the board. When I touch the iron to the pad, a 3.5-second heat ring counts down so I don't cold-joint or overheat the component, and when I pinch "Next Joint," that pad turns into a tiny green dot and the ring moves to the next pin.

> **Agent (`plan-lens`):**  
> **Question 3 (Product or overlay & Preview Stand-ins):** In the real world, the glasses would recognize the PCB fiducials and sense iron contact or a Bluetooth multimeter. Since Lens Studio's preview runs in a simulated room on your laptop and can't recognize real objects or live hardware probes, the Lens needs to fake those sensing moments with obvious stand-ins and build what happens next for real. What should those stand-ins be in the preview?

**Learner:**  
Let's place a real-scale virtual workbench mat and 3D PCB (`32 cm × 22 cm`) on the desk in front of the user, and put a clear "Stand-In Control Dock" on the right side of the mat with three big pinch buttons:
1. **"Found Board"** — fakes camera fiducial lock and anchors the 4 pad rings onto the PCB.
2. **"Heat Pad (3.5s)"** — fakes iron tip contact and triggers the live 3.5-second thermal timer and audio ticks.
3. **"Simulate Short"** — fakes a Bluetooth multimeter continuity bridge between `3.3V` and `GND` so we can test the fault alert workflow.

> **Agent (`plan-lens`):**  
> Clear and honest stand-ins.  
>  
> **Question 4 (Where things live):** SPECS has a narrow `37° tall × 32° wide` field of view (`~41 cm × 59 cm` usable area at `85 cm`), and black renders as transparent on its additive display. Where does each element sit relative to where you're looking, and what happens if the bench multimeter is off to the side out of view?

**Learner:**  
During soldering I'm looking slightly downward (`y = -18 cm`, `z = -85 cm`).
- The 3D PCB sits at `x = 0 cm, y = -22 cm, z = -85 cm` (`32 cm × 22 cm`).
- The Step Coach Card floats at `x = -14 cm, y = -8 cm, z = -90 cm` (`26 cm × 16 cm`), using bright cyan (`#4DF0FF`), amber (`#FFB830`), and white (`#F4FAFF`) text so nothing disappears on the additive display.
- The Stand-In Dock sits at `x = 15 cm, y = -12 cm, z = -85 cm` (`24 cm × 15 cm`).
- The virtual Bench Multimeter sits further right at `x = 48 cm, y = -10 cm, z = -90 cm`—outside the `32°` view when I'm focused on the PCB. If a continuity short happens, the Lens plays a spatial alert chime and shows a bright amber arrow (`4.5 cm × 2.5 cm`) at the right edge of my view (`x = 12 cm, y = -4 cm, z = -85 cm`) pointing me toward the multimeter.

> **Agent (`plan-lens`):**  
> **Question 5 & 6 (Hands, input, and when things show):** How do you act on the controls with your hands in the preview, and how do you keep the workspace from getting cluttered?

**Learner:**  
All interactions use big SIK + UIKit pinch buttons (`8 cm × 4.5 cm` to `9 cm × 4.5 cm`) with hover highlights, plus optional voice equivalents (`"Next joint"`, `"Heat pad"`, `"Clear fault"`) backed by those exact buttons. To prevent visual clutter, inactive pads only show a tiny `1.2 cm` dot. Only the active step opens the `3.6 cm` target ring and step instruction, and the fault arrow/banner stays completely hidden unless a short is triggered.

> **Agent (`plan-lens`):**  
> **Question 7 (Done criteria):** How will you know it works? Name three to five concrete things you should be able to do or see in the Lens Studio preview.

**Learner:**  
1. Pinching `LockBoardButton` ("Found Board") activates `PadRing_1` on the 3D PCB and updates the step card to `"Step 1/4: Solder C1 (+3.3V)"`.
2. Pinching `HeatPadButton` ("Heat Pad 3.5s") runs the thermal timer on the active pad and updates `TimerStatusText` to `"Heating: 350°C — Flow Ready"`.
3. Pinching `NextStepButton` ("Next Joint") marks the current pad complete (green check dot) and advances the active ring through Steps 2, 3, and 4 to `"Board Passed QC"`.
4. Pinching `TriggerShortButton` ("Simulate Short") reveals the `WayfinderArrow` and fault banner (`"SHORT DETECTED: Look Right → Multimeter (0.2 Ω)"`), and pinching `AcknowledgeFaultButton` clears it.
5. All controls are physically reachable from the user's standing/seated pose, verified by an automated LEAF IK reachability test (`createIKInteractor()`).

> **Agent (`plan-lens`):**  
> I've written `devpost/design-brief.md` with your exact measurements, stand-ins, and done criteria. Does everything look good to approve?

**Learner:**  
Looks good! Approved.

> **Agent (`plan-lens`):**  
> `devpost/design-brief.md` is now set to `status: approved`. Clear the chat and run CLAD with:  
> `Read devpost/design-brief.md and build it for SPECS. Follow the brief closely. Get the basic flow working first, then add detail. Write and run LEAF tests for each done criterion, and tell me which pass.`

---

## Part 2: CLAD Build & LEAF Verification Summary

| Phase | CLAD Skill / Agent | Output Artifacts | Status |
|---|---|---|---|
| Phase 0.5 | `/specs-project-init` | Verified Camera (`Perspective` + `DeviceTracking: World`), `SpectaclesInteractionKit`, `SpectaclesUIKit`, `Leaf.lspkg` | Completed |
| Phase 2a | `/icon-selector` | `Assets/Icons/solder_iron.png`, `check_circle.png`, `warning_amber.png`, `compass_arrow.png` | Completed |
| Phase 2b | `/mesh-builder-scripting` | `Assets/Scripts/BenchPulsePcbMesh.ts` (3D PCB, 4 IC/Cap footprints, animated target rings, multimeter station) | Completed |
| Phase 2c | `/build-sfx` | `Assets/GeneratedSFX/PinchConfirm.wav`, `HeatTimerTick.wav`, `JointCompleteChime.wav`, `ContinuityAlert.wav` | Completed |
| Phase 2d | `/specs-build-ui` | `Assets/Scripts/BenchPulseCoachUI.ts` (`BackPlate` + `FlexLayout` + `+0.6cm` Z-offset), `Assets/Scripts/BenchPulseDiagnosticsUI.ts` (`Frame` + Stand-In Dock + Fault Banner) | Completed |
| Phase 2f | `specs-experience-builder` | `Assets/Scripts/BenchPulseMain.ts` (Unidirectional state machine + `Event<T>` bus + voice fallback) | Completed |
| Phase 3 | `VirtualScene` (Two-Phase) | Authored SceneObjects in `Assets/Scene.scene` & `.virtual-scene.json` | Completed |
| Phase 4 | `/specs-leaf-write-scenarios` & `/specs-leaf-run-in-preview` | `Assets/Tests/LeafIndex.ts`, `BenchPulseLeafInteractor.ts`, and 5 Scenario classes — **5/5 PASSED** | Completed |
