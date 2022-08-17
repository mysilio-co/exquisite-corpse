import { useMemo } from "react";
import {
  buildThing,
  setThing,
  createThing,
  getThingAll,
  getStringNoLocale,
  asUrl,
} from "@inrupt/solid-client";
import { RDF, DCTERMS } from "@inrupt/vocab-common-rdf";
import { WM, SIOC, EXQ } from "../vocab";
import { useResource } from "swrlit";
import { hasRDFType } from "../model/utils";

const StoryResourceUrls = {
  CreatingNeurodiverseWellbeing:
    "https://exquisite-corpse.v0.mysilio.me/mozfest2022/CreatingNeurodiverseWellbeing.ttl",
};

export function urlForStoryLine(base, n) {
  return `${base}#${n}`;
}

export function getLineNum(line) {
  const url = line && new URL(asUrl(line));
  return url && parseInt(url.hash.substring(1));
}

export function getContent(line) {
  return line && getStringNoLocale(line, SIOC.content);
}

export function getMonetization(line) {
  return line && getStringNoLocale(line, WM.PaymentPointer);
}

export function getLastLine(story) {
  const lines = story && getLines(story);
  const lineNums = lines && lines.map(getLineNum);
  const lastLineNum = lines && lineNums.length > 0 && Math.max(...lineNums);
  const lastLine = story && lines.find((l) => getLineNum(l) === lastLineNum);
  return lastLine;
}

export function getLines(story) {
  return (
    story &&
    getThingAll(story)
      .filter((t) => hasRDFType(t, EXQ.Line))
      .sort((a, b) => getLineNum(a) - getLineNum(b))
  );
}

export function createLineThing(content, monetization, n) {
  return buildThing(createThing({ name: `${n}` }))
    .addUrl(RDF.type, EXQ.Line)
    .addDatetime(DCTERMS.created, new Date())
    .addStringNoLocale(SIOC.content, content)
    .addStringNoLocale(WM.PaymentPointer, monetization)
    .build();
}

export function addLine(story, content, monetization) {
  const prevLine = story && getLastLine(story);
  const prevNum = prevLine && getLineNum(prevLine);
  const nextNum = prevNum >= 0 ? prevNum + 1 : 0;
  const newLine = content && monetization && createLineThing(content, monetization, nextNum);
  return story && setThing(story, newLine);
}

export function useRandomMonetization(story) {
  return useMemo(() => {
    const lines = story && getLines(story);
    const line = lines[Math.floor(Math.random() * lines.length)];
    return getMonetization(line);
  }, [story]);
}

export function useRandomStorySlug(options) {
  return useMemo(() => {
    const slugs = Object.keys(StoryResourceUrls);
    const filtered =
      options && options.ignore
        ? slugs.filter((s) => s !== options.ignore)
        : slugs;
    const slug = filtered[Math.floor(Math.random() * filtered.length)];
    return slug;
  }, []);
}

export function useStory(slug) {
  return useResource(StoryResourceUrls[slug]);
}
