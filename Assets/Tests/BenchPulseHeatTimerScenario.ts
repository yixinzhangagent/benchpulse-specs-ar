// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario 2: Verifies Done Criterion 2 (3.5s Thermal Countdown on Active Pad).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { BenchPulseLeafInteractor } from "./BenchPulseLeafInteractor"

@component
export class BenchPulseHeatTimerScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new BenchPulseLeafInteractor()
    await sleep(800)

    await interactor.tapButton("LockBoardButton")
    await interactor.tapButton("HeatPadButton")

    const timerObj = findSceneObjectByName("TimerStatusText")
    const timerText = (timerObj.getComponent("Component.Text") as Text).text
    expect(timerText.includes("Heating: 350°C — Flow Ready")).toBe(true)
  }
}
