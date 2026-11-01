"use client";

import GroundingTool from "./GroundingTool";
import WorryDump from "./WorryDump";
import ExposureLadder from "./ExposureLadder";

export default function AnxietyHome() {
  return (
    <div className="flex flex-col gap-8">
      <GroundingTool />
      <WorryDump />
      <ExposureLadder />
    </div>
  );
}
