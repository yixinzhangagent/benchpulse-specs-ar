# LEAF Automated Verification Report — BenchPulse (`BenchPulse.esproj`)

**Framework:** Lens Evaluation & Automation Framework (`Leaf.lspkg`)  
**Target Platform:** Snap SPECS (`Lens Studio 5.22.0` / Stereo Interactive Preview)  
**Test Index:** `Assets/Tests/LeafIndex.ts` (`@scenariosIndex`)  
**Custom Interactor:** `Assets/Tests/BenchPulseLeafInteractor.ts` + `createIKInteractor()`

---

## 1. Scene Snapshot & Verified Object Table (CLAD Phase 2)

| SceneObject Name | Parent / Host | Component | Verified Property / State |
|---|---|---|---|
| `LockBoardButton` | `StandInRowTop` (`BenchPulseDiagnosticsUI`) | `SpectaclesUIKit.Button` + `ElementContent` | `enabled = true`, `size = (8.5, 4.5, 1.0)` cm |
| `HeatPadButton` | `StandInRowTop` (`BenchPulseDiagnosticsUI`) | `SpectaclesUIKit.Button` + `ElementContent` | `enabled = true`, `size = (8.5, 4.5, 1.0)` cm |
| `TriggerShortButton` | `StandInRowBottom` (`BenchPulseDiagnosticsUI`) | `SpectaclesUIKit.Button` + `ElementContent` | `enabled = true`, `size = (14.0, 4.5, 1.0)` cm |
| `NextStepButton` | `CoachActionRow` (`BenchPulseCoachUI`) | `SpectaclesUIKit.Button` + `ElementContent` | `enabled = true`, `size = (9.0, 4.5, 1.0)` cm |
| `InspectPinoutButton` | `CoachActionRow` (`BenchPulseCoachUI`) | `SpectaclesUIKit.Button` + `ElementContent` | `enabled = true`, `size = (9.0, 4.5, 1.0)` cm |
| `AcknowledgeFaultButton` | `FaultPopupContent` (`FaultPopupRoot`) | `SpectaclesUIKit.Button` + `ElementContent` | `size = (15.0, 4.5, 1.0)` cm, shown on fault |
| `StepTitleText` | `CoachContent` (`BenchPulseCoachUI`) | `Component.Text` | `depthTest = true`, updates across Steps 1–4 & QC |
| `TimerStatusText` | `CoachContent` (`BenchPulseCoachUI`) | `Component.Text` | `depthTest = true`, updates to `"Heating: 350°C — Flow Ready"` |
| `PadRing_1` .. `PadRing_4` | `BenchPcbRoot` (`BenchPulsePcbMesh`) | `SceneObject` (3D ring) | Anchored on PCB pads (`z = -85 cm, y = -20.5 cm`) |
| `WayfinderArrow` | `BenchPulsePcbMesh` | `SceneObject` | `enabled = false` initially; `true` on continuity fault |
| `FaultPopupRoot` | `BenchPulseDiagnosticsUI` | `SpectaclesUIKit.Frame` | `enabled = false` at tail of `onInitialized` (Rule G3) |

---

## 2. LEAF Scenario Execution Results (`/specs-leaf-run-in-preview`)

| Scenario ID | Scenario Class | Done Criterion Tested | Interactor Used | Result |
|---|---|---|---|---|
| `benchpulse-board-lock` | `BenchPulseBoardLockScenario` | **Criterion 1:** Pinching `LockBoardButton` ("Found Board") activates `PadRing_1` on the 3D PCB and updates `StepTitleText` to `"Step 1/4: Solder C1 (+3.3V)"`. | `BenchPulseLeafInteractor` (`DefaultLeafInteractor`) | **PASSED** (1.26s) |
| `benchpulse-heat-timer` | `BenchPulseHeatTimerScenario` | **Criterion 2:** Pinching `HeatPadButton` ("Heat Pad 3.5s") runs the thermal countdown and updates `TimerStatusText` to `"Heating: 350°C — Flow Ready"`. | `BenchPulseLeafInteractor` (`DefaultLeafInteractor`) | **PASSED** (1.31s) |
| `benchpulse-step-progression` | `BenchPulseStepProgressionScenario` | **Criterion 3:** Pinching `NextStepButton` advances `PadRing_1` → `PadRing_2` → `PadRing_3` → `PadRing_4` and finishes at `"Board Passed QC"`. | `BenchPulseLeafInteractor` (`DefaultLeafInteractor`) | **PASSED** (1.84s) |
| `benchpulse-continuity-fault` | `BenchPulseContinuityFaultScenario` | **Criterion 4:** Pinching `TriggerShortButton` enables `WayfinderArrow` and `FaultPopupRoot` (`"SHORT DETECTED: Look Right"`); pinching `AcknowledgeFaultButton` clears both. | `BenchPulseLeafInteractor` (`DefaultLeafInteractor`) | **PASSED** (1.42s) |
| `benchpulse-ik-reachability` | `BenchPulseIKReachabilityScenario` | **Criterion 5:** Physical arm & head reachability check across `LockBoardButton` (`z = -85 cm, y = -12 cm`) and `NextStepButton` (`z = -90 cm, y = -8 cm`). | `createIKInteractor()` (`IKBodyInteractor`) | **PASSED** (1.79s) |

---

## 3. Logger Output Excerpt

```text
[LEAF] Starting scenario: benchpulse-board-lock
[BenchPulse] Fiducial Stand-In Locked -> Step 1/4 Active on PadRing_1
[LEAF] PASSED: benchpulse-board-lock (1260 ms)

[LEAF] Starting scenario: benchpulse-heat-timer
[BenchPulse] Fiducial Stand-In Locked -> Step 1/4 Active on PadRing_1
[BenchPulse] Thermal timer triggered -> Heating: 350°C — Flow Ready
[LEAF] PASSED: benchpulse-heat-timer (1310 ms)

[LEAF] Starting scenario: benchpulse-step-progression
[BenchPulse] Advanced to Step 2/4: U1-P8
[BenchPulse] Advanced to Step 3/4: J2-P1
[BenchPulse] Advanced to Step 4/4: J2-P2
[BenchPulse] All 4 joints complete -> Board Passed QC
[LEAF] PASSED: benchpulse-step-progression (1840 ms)

[LEAF] Starting scenario: benchpulse-continuity-fault
[BenchPulse] Continuity short detected (0.2 Ohm) -> WayfinderArrow & FaultPopupRoot enabled
[BenchPulse] Continuity fault cleared -> Resuming assembly
[LEAF] PASSED: benchpulse-continuity-fault (1420 ms)

[LEAF] Starting scenario: benchpulse-ik-reachability
[LEAF] IKBodyInteractor converged on target LockBoardButton (dist=86.3cm)
[LEAF] IKBodyInteractor converged on target NextStepButton (dist=91.4cm)
[LEAF] PASSED: benchpulse-ik-reachability (1790 ms)
[SUCCESS] All 5 scenarios passed.
```
