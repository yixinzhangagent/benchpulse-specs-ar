// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario 4: Verifies Done Criterion 4 (Out-of-View Continuity Fault & Wayfinder Arrow).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { BenchPulseLeafInteractor } from "./BenchPulseLeafInteractor"

@component
export class BenchPulseContinuityFaultScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new BenchPulseLeafInteractor()
    await sleep(800)

    const wayfinderArrow = findSceneObjectByName("WayfinderArrow")
    const faultPopup = findSceneObjectByName("FaultPopupRoot")
    expect(wayfinderArrow.enabled).toBe(false)
    expect(faultPopup.enabled).toBe(false)

    // Trigger Continuity Short Stand-In
    await interactor.tapButton("TriggerShortButton")
    expect(wayfinderArrow.enabled).toBe(true)
    expect(faultPopup.enabled).toBe(true)

    const faultTextObj = findSceneObjectByName("FaultAlertText")
    const faultText = (faultTextObj.getComponent("Component.Text") as Text).text
    expect(faultText.includes("SHORT DETECTED: Look Right")).toBe(true)

    // Acknowledge and clear fault
    await interactor.tapButton("AcknowledgeFaultButton")
    expect(wayfinderArrow.enabled).toBe(false)
    expect(faultPopup.enabled).toBe(false)
  }
}
