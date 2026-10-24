// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// Main Orchestrator Component built with Snap CLAD (specs-experience-builder).
// Follows Hard Rule 3: One-way data flow (Main -> UI via public setters; UI -> Main via Event<T>).

import { BenchPulseCoachUI, StepCardData } from "./BenchPulseCoachUI"
import { BenchPulseDiagnosticsUI } from "./BenchPulseDiagnosticsUI"
import { BenchPulsePcbMesh } from "./BenchPulsePcbMesh"

@component
export class BenchPulseMain extends BaseScriptComponent {
  @ui.label("BenchPulse Spatial Soldering Coach — Main Controller")
  @ui.separator
  @ui.group_start("Authored Scene Modules")
  @input
  @hint("Step Coach Card UI module (SpectaclesUIKit BackPlate at upper-left of PCB)")
  coachUI!: BenchPulseCoachUI

  @input
  @hint("Preview Stand-In Dock & Continuity Fault Alert UI module (SpectaclesUIKit Frame)")
  diagnosticsUI!: BenchPulseDiagnosticsUI

  @input
  @hint("3D PCB Mesh, Spatial Pad Rings (PadRing_1..4), and WayfinderArrow module")
  pcbMesh!: BenchPulsePcbMesh
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("Target soldering iron temperature in Celsius")
  @widget(new SliderWidget(280, 420, 10))
  solderingTempC: number = 350

  @input
  @hint("Thermal dwell duration per pad in seconds (default 3.5 s)")
  @widget(new SliderWidget(1.5, 6.0, 0.5))
  dwellDurationSec: number = 3.5
  @ui.group_end

  private readonly steps: StepCardData[] = [
    {
      stepIndex: 1,
      totalSteps: 4,
      padCode: "C1",
      netName: "+3.3V",
      polarityNote: "Gold stripe faces +3.3V rail (Pin 4) — Do NOT reverse",
      targetTempC: 350,
      dwellSeconds: 3.5,
    },
    {
      stepIndex: 2,
      totalSteps: 4,
      padCode: "U1-P8",
      netName: "GND",
      polarityNote: "Thermal relief pad — Pre-heat ground plane 3.5s",
      targetTempC: 350,
      dwellSeconds: 3.5,
    },
    {
      stepIndex: 3,
      totalSteps: 4,
      padCode: "J2-P1",
      netName: "I2C_SDA",
      polarityNote: "4.7k pull-up adjacent — Avoid solder bridge to SCL",
      targetTempC: 350,
      dwellSeconds: 3.5,
    },
    {
      stepIndex: 4,
      totalSteps: 4,
      padCode: "J2-P2",
      netName: "I2C_SCL",
      polarityNote: "Final clock line — Inspect fillet cone after flow",
      targetTempC: 350,
      dwellSeconds: 3.5,
    },
  ]

  private boardLocked: boolean = false
  private currentStepIdx: number = 0
  private isHeating: boolean = false
  private heatElapsedSec: number = 0
  private pinoutExpanded: boolean = false
  private faultActive: boolean = false

  onAwake(): void {
    // Bind SIK / UIKit events inside OnStartEvent per specs-interaction-recipes §1
    this.createEvent("OnStartEvent").bind(() => {
      this.bindUIEvents()
    })

    this.createEvent("UpdateEvent").bind((ev) => {
      if (this.isHeating) {
        this.heatElapsedSec += ev.getDeltaTime()
        if (this.heatElapsedSec >= this.dwellDurationSec) {
          this.isHeating = false
          this.coachUI.setHeatingStatus(
            this.dwellDurationSec,
            this.dwellDurationSec,
            true
          )
          this.pcbMesh.setThermalPulseBoost(false)
        }
      }
    })
  }

  private bindUIEvents(): void {
    if (this.diagnosticsUI) {
      this.diagnosticsUI.onLockBoardStandIn.add(() => {
        this.handleLockBoard()
      })
      this.diagnosticsUI.onHeatPadStandIn.add(() => {
        this.handleHeatActivePad()
      })
      this.diagnosticsUI.onTriggerShortStandIn.add(() => {
        this.handleTriggerContinuityShort()
      })
      this.diagnosticsUI.onAcknowledgeFault.add(() => {
        this.handleClearContinuityShort()
      })
    }

    if (this.coachUI) {
      this.coachUI.onNextJointRequested.add(() => {
        this.handleAdvanceStep()
      })
      this.coachUI.onPinoutToggleRequested.add(() => {
        this.handleTogglePinoutDetail()
      })
    }
  }

  public handleLockBoard(): void {
    this.boardLocked = true
    this.currentStepIdx = 0
    this.isHeating = false
    this.pinoutExpanded = false
    this.pcbMesh.setActivePadIndex(0)
    this.coachUI.setStepCard(this.steps[0])
    print("[BenchPulse] Fiducial Stand-In Locked -> Step 1/4 Active on PadRing_1")
  }

  public handleHeatActivePad(): void {
    if (!this.boardLocked) {
      this.handleLockBoard()
    }
    this.isHeating = true
    this.heatElapsedSec = 0
    this.pcbMesh.setThermalPulseBoost(true)
    this.coachUI.setHeatingStatus(
      this.dwellDurationSec,
      this.dwellDurationSec,
      true
    )
    print("[BenchPulse] Thermal timer triggered -> Heating: 350°C — Flow Ready")
  }

  public handleAdvanceStep(): void {
    if (!this.boardLocked) {
      this.handleLockBoard()
      return
    }
    this.isHeating = false
    this.pcbMesh.setThermalPulseBoost(false)

    if (this.currentStepIdx + 1 < this.steps.length) {
      this.currentStepIdx += 1
      const nextStep = this.steps[this.currentStepIdx]
      this.pcbMesh.setActivePadIndex(this.currentStepIdx)
      this.coachUI.setStepCard(nextStep)
      print(
        `[BenchPulse] Advanced to Step ${nextStep.stepIndex}/${nextStep.totalSteps}: ${nextStep.padCode}`
      )
    } else {
      this.currentStepIdx = this.steps.length
      this.pcbMesh.setActivePadIndex(this.steps.length)
      this.coachUI.setBoardPassedQC()
      print("[BenchPulse] All 4 joints complete -> Board Passed QC")
    }
  }

  public handleTogglePinoutDetail(): void {
    if (!this.boardLocked || this.currentStepIdx >= this.steps.length) return
    this.pinoutExpanded = !this.pinoutExpanded
    const step = this.steps[this.currentStepIdx]
    this.coachUI.setPolarityDetailExpanded(
      this.pinoutExpanded,
      step.polarityNote
    )
  }

  public handleTriggerContinuityShort(): void {
    this.faultActive = true
    this.pcbMesh.setWayfinderArrowVisible(true)
    this.diagnosticsUI.setContinuityFaultVisible(true, 0.2)
    print(
      "[BenchPulse] Continuity short detected (0.2 Ohm) -> WayfinderArrow & FaultPopupRoot enabled"
    )
  }

  public handleClearContinuityShort(): void {
    this.faultActive = false
    this.pcbMesh.setWayfinderArrowVisible(false)
    this.diagnosticsUI.setContinuityFaultVisible(false, 0.0)
    print("[BenchPulse] Continuity fault cleared -> Resuming assembly")
  }
}
