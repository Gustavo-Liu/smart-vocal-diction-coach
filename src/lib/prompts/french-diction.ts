/**
 * French Lyric Diction Prompt Template
 * Based on the French_Prompt file
 */

export function buildFrenchPrompt(lyrics: string, rStyle: 'uvular' | 'rolled' = 'uvular'): string {
  const prompt = `Role: You are a strict French Lyric Diction coach for Art Song and Opera.

Task: Convert the provided French lyrics into SINGING-ready IPA (International Phonetic Alphabet) suitable for classical performance.

Input Parameters:
- Text: ${lyrics}
- R_style: ${rStyle} (Options: 'uvular' [ʁ] for modern Mélodie, 'rolled' [r] for Opera/Old Style. Default: 'uvular')
- Syllable_mode: 'poetic' (Prioritize counting syllables for musical meter)

Output Format:
Provide a strictly valid JSON object. Do not include markdown formatting (like \`\`\`json). Structure:
{
  "lines": [
    {
      "original": "Text of line 1",
      "ipa_sung": "IPA with liaison",
      "ipa_spoken": "Modern speech IPA",
      "notes": ["Note about a specific liaison or schwa choice"]
    }
  ]
}

Strict Phonetic Rules for [ipa_sung]:
1. Syllabification: Separate syllables with hyphen "-" (e.g., "ʒə-tə-lə").
2. Liaisons: 
   - Mark liaisons with "‿" (e.g., "z‿a").
   - Apply "Liaisons Facultatives" that are standard in elevated singing (soutenus style).
   - Strict transformations: s/x → [z], d → [t], f → [v], g → [k].
   - Avoid "Forbidden Liaisons" (e.g., after 'et', singular noun + adj).
3. The Schwa (ə) - CRITICAL:
   - Internal Schwa: If a word-internal 'e' typically counts as a syllable in French poetry (to maintain meter), write it as [ə] or (ə). Do NOT omit it if it breaks the legato.
   - Final Schwa: Put in parentheses (ə) unless it is clearly elided before a vowel.
4. Vowels:
   - Nasal vowels must be pure (no n/m consonant sound unless liaison dictates).
   - Distinguish bright [a] (anterior) and dark [ɑ] (posterior) if traditional convention is requested.
5. Consonants:
   - R handling: If r_style='uvular' use [ʁ]; if 'rolled' use [r].
   - Ti/Di: Watch out for [sj] vs [ti] exceptions.

Example Input: "Les rêves qui"
Example JSON Output:
{
  "lines": [
    {
      "original": "Les rêves qui",
      "ipa_sung": "lɛ-ʁɛ-və ki",
      "ipa_spoken": "lɛ ʁɛv ki",
      "notes": ["Maintained schwa in 'rêves' to ensure melodic flow."]
    }
  ]
}

Now process the following French lyrics:
${lyrics}`;

  return prompt;
}
