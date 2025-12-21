function nounSentences(w: string) {
  return [
    `The ${w} was important in that situation.`,
    `People often talk about ${w} in daily life.`,
    `This ${w} had a noticeable effect.`,
  ];
}

function verbSentences(w: string) {
  return [
    `They often ${w} in the morning.`,
    `He decided to ${w} carefully.`,
    `People may ${w} in different ways.`,
  ];
}

function adjectiveSentences(w: string) {
  return [
    `The situation felt ${w}.`,
    `It was a very ${w} experience.`,
    `She described the day as ${w}.`,
  ];
}

function adverbSentences(w: string) {
  return [
    `She spoke ${w} during the meeting.`,
    `He completed the task ${w}.`,
    `They worked ${w} throughout the day.`,
  ];
}

function genericSentences(w: string) {
  return [
    `The word "${w}" is used in different contexts.`,
    `People may encounter "${w}" in reading or conversation.`,
    `"${w}" appears in various forms of expression.`,
  ];
}

export function demoSentencesByPOS(
  word: string,
  partOfSpeech?: string
): string[] {
  const w = word.trim();

  switch (partOfSpeech) {
    case "noun":
      return nounSentences(w);
    case "verb":
      return verbSentences(w);
    case "adjective":
      return adjectiveSentences(w);
    case "adverb":
      return adverbSentences(w);
    default:
      return genericSentences(w);
  }
}
