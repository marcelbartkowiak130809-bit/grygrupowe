export const pairFeedbackReasons = {
  close: "Za blisko",
  far: "Za daleko",
  unknown: "Nie znam hasła",
};

export function impostorPairId(category, mainWord, impostorWord) {
  return encodeURIComponent(JSON.stringify([category, mainWord, impostorWord])).replaceAll(".", "%2E");
}

export function summarizeImpostorPairFeedback(data) {
  return Object.entries(data || {}).flatMap(([id, votes]) => {
    let pair;
    try { pair = JSON.parse(decodeURIComponent(id)); } catch { return []; }
    if (!Array.isArray(pair) || pair.length !== 3 || !pair.every(value => typeof value === "string")) return [];
    const [category, mainWord, impostorWord] = pair;
    const counts = Object.fromEntries(Object.keys(pairFeedbackReasons).map(reason => [reason,0]));
    for (const vote of Object.values(votes || {})) {
      if (Object.hasOwn(counts, vote?.reason)) counts[vote.reason] += 1;
    }
    const total = Object.values(counts).reduce((sum,count)=>sum+count,0);
    return total ? [{ category, mainWord, impostorWord, counts, total }] : [];
  }).sort((a,b)=>b.total-a.total);
}
