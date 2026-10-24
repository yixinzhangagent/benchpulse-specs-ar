// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario 1: Verifies Done Criterion 1 (Fiducial Board Lock & PadRing_1 Activation).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { BenchPulseLeafInteractor } from "./BenchPulseLeafInteractor"

@component
export class BenchPulseBoardLockScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new BenchPulseLeafInteractor()
    await sleep(1000)

    // Trigger "Found Board" stand-in button
    await interactor.tapButton("LockBoardButton")

    // Assert PadRing_1 is enabled on the 3D PCB and StepTitleText shows Step 1/4
    const padRing1 = findSceneObjectByName("PadRing_1")
    expect(padRing1.enabled).toBe(true)

    const padRing2 = findSceneObjectByName("PadRing_2")
    expect(padRing2.enabled).toBe(false)

    const stepTitleObj = findSceneObjectByName("StepTitleText")
    const stepTitle = (stepTitleObj.getComponent("Component.Text") as Text).text
    expect(stepTitle.includes("Step 1/4: Solder C1 (+3.3V)")).toBe(true)
  }
}
