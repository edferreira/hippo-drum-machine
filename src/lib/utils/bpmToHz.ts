import { el } from "@elemaudio/core";

export default (bpm: number) => el.const({ key: "bpm:hz", value: bpm / 60 });
