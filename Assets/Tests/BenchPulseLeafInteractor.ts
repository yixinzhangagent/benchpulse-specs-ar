// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// Custom LEAF Interactor built with /specs-leaf-write-scenarios.

import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { findInteractablesByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"

export class BenchPulseLeafInteractor extends DefaultLeafInteractor {
  async tapButton(buttonName: string): Promise<void> {
    const button = findInteractablesByName(buttonName, undefined, true)[0]
    if (!button) {
      throw new Error(`Button "${buttonName}" not found or not enabled`)
    }
    await this.trigger(button)
    await sleep(250)
  }
}
