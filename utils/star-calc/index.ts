import { BeatmapDecoder, BeatmapEncoder } from "osu-parsers";
import { StandardRuleset } from "osu-standard-stable";
import { sampleMap } from "./osuUtils";
import { SSPMParsedMap } from "./sspmParser";
import { SSPMMap, V1SSPMParser } from "./sspmv1Parser";

export function rateMap(map: SSPMParsedMap) {
  let notes = map.markers
    .filter((marker) => marker.type === 0)
    .map((marker) => ({
      time: marker.position,
      x: marker.data["field0"].x,
      y: marker.data["field0"].y,
    }));

  return rate(notes);
}

export function rateMapNotes(map: [number, number, number][]) {
  let notes = map.map((marker) => ({
    time: marker[2],
    x: marker[0],
    y: marker[1],
  }));

  return rate(notes);
}

export function rateMapOld(map: SSPMMap) {
  let notes = map.notes.map((marker) => ({
    time: marker.position,
    x: marker.x,
    y: marker.y,
  }));

  return rate(notes);
}

export function rate(
  notes: {
    time: number;
    x: number;
    y: number;
  }[]
) {
  notes = notes.sort((a, b) => a.time - b.time);
  const decoder = new BeatmapDecoder();
  const beatmap1 = decoder.decodeFromString(sampleMap);
  let i = 0;
  while (i < notes.length - 1) {
    const note = notes[i];
    const nextNote = notes[i + 1];
    if (distance(note.x, note.y, nextNote.x, nextNote.y) < 1.25) {
      notes.splice(i + 1, 1);
      continue;
    }

    const hittable = beatmap1.hitObjects[0].clone();
    hittable.startX = Math.round((note.x / 2) * 100);
    hittable.startY = Math.round((note.y / 2) * 100);
    hittable.startTime = note.time;
    beatmap1.hitObjects.push(hittable);
    i++;
  }
  const ruleset = new StandardRuleset();
  const mods = ruleset.createModCombination("RX");
  const difficultyCalculator = ruleset.createDifficultyCalculator(beatmap1);
  const difficultyAttributes = difficultyCalculator.calculateWithMods(mods);
  return difficultyAttributes.starRating;
}

const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
