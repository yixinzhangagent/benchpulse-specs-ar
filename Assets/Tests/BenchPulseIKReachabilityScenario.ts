// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario 5: Verifies Done Criterion 5 (Ergonomic IK Reachability for Bench Controls).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractablesByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { createIKInteractor } from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"

@component
export class BenchPulseIKReachabilityScenario extends Scenario {
  async run(): Promise<void> {
    const ikInteractor = createIKInteractor()
    await sleep(1000)

    // Verify physical reachability of LockBoardButton at z = -85 cm, y = -12 cm
    const lockBtn = findInteractablesByName("LockBoardButton", undefined, true)[0]
    expect(lockBtn).toBeTruthy()
    await ikInteractor.trigger(lockBtn)
    await sleep(300)

    const padRing1 = findSceneObjectByName("PadRing_1")
    expect(padRing1.enabled).toBe(true)

    // Verify physical reachability of NextStepButton at z = -90 cm, y = -8 cm
    const nextBtn = findInteractablesByName("NextStepButton", undefined, true)[0]
    expect(nextBtn).toBeTruthy()
    await ikInteractor.trigger(nextBtn)
    await sleep(300)

    const padRing2 = findSceneObjectByName("PadRing_2")
    expect(padRing2.enabled).toBe(true)
  }
}
