// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario 3: Verifies Done Criterion 3 (Step Progression & Clutter-Free Recension).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { BenchPulseLeafInteractor } from "./BenchPulseLeafInteractor"

@component
export class BenchPulseStepProgressionScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new BenchPulseLeafInteractor()
    await sleep(800)

    await interactor.tapButton("LockBoardButton")
    const stepTitleObj = findSceneObjectByName("StepTitleText")
    const textComp = stepTitleObj.getComponent("Component.Text") as Text

    // Advance Step 1 -> Step 2
    await interactor.tapButton("NextStepButton")
    expect(textComp.text.includes("Step 2/4: Solder U1-P8 (GND)")).toBe(true)
    expect(findSceneObjectByName("PadRing_2").enabled).toBe(true)

    // Advance Step 2 -> Step 3
    await interactor.tapButton("NextStepButton")
    expect(textComp.text.includes("Step 3/4: Solder J2-P1 (I2C_SDA)")).toBe(true)
    expect(findSceneObjectByName("PadRing_3").enabled).toBe(true)

    // Advance Step 3 -> Step 4
    await interactor.tapButton("NextStepButton")
    expect(textComp.text.includes("Step 4/4: Solder J2-P2 (I2C_SCL)")).toBe(true)
    expect(findSceneObjectByName("PadRing_4").enabled).toBe(true)

    // Advance Step 4 -> Board Passed QC
    await interactor.tapButton("NextStepButton")
    expect(textComp.text.includes("Board Passed QC")).toBe(true)
  }
}
