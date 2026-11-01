"use client";

import GroundingTool from "./GroundingTool";
import MuscleRelaxation from "./MuscleRelaxation";
import GuidedMeditation from "./GuidedMeditation";
import AmbientSounds from "./AmbientSounds";
import WorryDump from "./WorryDump";
import ThoughtRecord from "./ThoughtRecord";
import ExposureLadder from "./ExposureLadder";
import AnxietyCheckIn from "./AnxietyCheckIn";
import WeeklyProgress from "./WeeklyProgress";

export default function AnxietyHome() {
  return (
    <div className="flex flex-col gap-8">
      <WeeklyProgress />
      <GroundingTool />
      <MuscleRelaxation />
      <GuidedMeditation />
      <AmbientSounds />
      <AnxietyCheckIn />
      <WorryDump />
      <ThoughtRecord />
      <ExposureLadder />
    </div>
  );
}
