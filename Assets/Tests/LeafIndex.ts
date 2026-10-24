// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// LEAF Scenario Index registering all 5 Done Criteria scenarios.

import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import { BenchPulseBoardLockScenario } from "./BenchPulseBoardLockScenario"
import { BenchPulseHeatTimerScenario } from "./BenchPulseHeatTimerScenario"
import { BenchPulseStepProgressionScenario } from "./BenchPulseStepProgressionScenario"
import { BenchPulseContinuityFaultScenario } from "./BenchPulseContinuityFaultScenario"
import { BenchPulseIKReachabilityScenario } from "./BenchPulseIKReachabilityScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {
      id: "benchpulse-board-lock",
      typename: BenchPulseBoardLockScenario.getTypeName(),
    },
    {
      id: "benchpulse-heat-timer",
      typename: BenchPulseHeatTimerScenario.getTypeName(),
    },
    {
      id: "benchpulse-step-progression",
      typename: BenchPulseStepProgressionScenario.getTypeName(),
    },
    {
      id: "benchpulse-continuity-fault",
      typename: BenchPulseContinuityFaultScenario.getTypeName(),
    },
    {
      id: "benchpulse-ik-reachability",
      typename: BenchPulseIKReachabilityScenario.getTypeName(),
    },
  ]
}
