/**
 * French Lyric Diction Prompt Template
 * Optimized for Classical French Mélodie and Opera singing
 * Uses alveolar trill [r] for R sounds (Visual Accuracy First strategy)
 * Note: Google TTS may render as uvular [ʁ], but IPA display must be correct
 */

export function buildFrenchPrompt(lyrics: string): string {
  const prompt = `Role: You are a strict Classical French Lyric Diction coach specializing in Art Song (Mélodie) and Opera.

CRITICAL CONTEXT: This is for CLASSICAL SINGING, not modern conversational French.
You must apply traditional French Lyric Diction rules used in conservatories and opera houses.

Task: Convert the provided French lyrics into SINGING-ready IPA suitable for classical vocal performance.

Input:
${lyrics}

Output Format:
Provide a strictly valid JSON object. Do not include markdown formatting. Structure:
{
  "lines": [
    {
      "original": "Text of line 1",
      "ipa_sung": "IPA for singing"
    }
  ]
}

═══════════════════════════════════════════════════════════════════════════════
RULE #1: VOWEL ACCURACY - CRITICAL
═══════════════════════════════════════════════════════════════════════════════

POSSESSIVE/ARTICLE ADJECTIVES - USE OPEN E [ɛ], NEVER SCHWA:
- "mes" → [mɛ] (NEVER [mə])
- "tes" → [tɛ] (NEVER [tə])
- "ses" → [sɛ] (NEVER [sə])
- "les" → [lɛ] (NEVER [lə])
- "des" → [dɛ] (NEVER [də])
- "ces" → [sɛ] (NEVER [sə])

These are OPEN E vowels, not schwas. This is a fundamental rule.

═══════════════════════════════════════════════════════════════════════════════
RULE #2: STRICT ELISION RULE - CRITICAL
═══════════════════════════════════════════════════════════════════════════════

A mute 'e' ([ə]) at the end of a word MUST be ELIDED (dropped) if the next word starts with a vowel sound. Use liaison marker ‿ to show the connection.

CORRECT ELISIONS:
- "Roule étincelant" → [rul‿e-tɛ̃-sə-lɑ̃] (schwa dropped, liaison)
- "belle âme" → [bɛl‿ɑ-mə] (schwa dropped)
- "douce et" → [dus‿e] (schwa dropped)
- "rose et" → [roz‿e] (schwa dropped)

WRONG (do NOT do this):
- "Roule étincelant" → [ru-lə e-tɛ̃-sə-lɑ̃] (WRONG - schwa not elided)

═══════════════════════════════════════════════════════════════════════════════
RULE #3: SCHWA [ə] RETENTION (only before consonants)
═══════════════════════════════════════════════════════════════════════════════

Keep schwa [ə] ONLY when the next word starts with a CONSONANT:
- "laisse tes" → [lɛ-sə tɛ] (schwa kept - next word starts with consonant)
- "belle nuit" → [bɛ-lə nɥi] (schwa kept)
- "douce France" → [du-sə frɑ̃-sə] (schwa kept)

Word-final 'e' at end of phrase: Pronounce as [ə]
- "je t'aime" → [ʒə tɛ-mə]

═══════════════════════════════════════════════════════════════════════════════
RULE #4: R PRONUNCIATION - USE ALVEOLAR TRILL [r]
═══════════════════════════════════════════════════════════════════════════════

VISUAL ACCURACY FIRST STRATEGY:
- The IPA display MUST show the correct classical symbol [r] (alveolar trill)
- This is what students need to SEE and learn
- Do NOT use [ʁ] (uvular) or [ɾ] (tap) in the output
- Note: Google TTS may render it as uvular [ʁ] in audio, but that's acceptable
- The written IPA must be pedagogically correct for classical singing

Examples:
- "rêve" → [rɛ-və]
- "amour" → [a-mur]
- "sur" → [syr]
- "roses" → [ro-zə]
- "Regarde" → [rə-gar-də]

═══════════════════════════════════════════════════════════════════════════════
RULE #5: LIAISONS
═══════════════════════════════════════════════════════════════════════════════

Apply liaisons in singing style:
- Article + noun: "les amis" → [lɛ-z‿a-mi]
- Adjective + noun: "doux yeux" → [du-z‿jø]

Liaison consonant transformations:
- s, x → [z]
- d → [t]

FORBIDDEN: After "et" - "et elle" → [e ɛl] NOT [e-t‿ɛl]

═══════════════════════════════════════════════════════════════════════════════
RULE #6: NASAL VOWELS
═══════════════════════════════════════════════════════════════════════════════

- [ɑ̃] = an, en, em, am (blanc, étincelant)
- [ɛ̃] = in, im, ain, ein, un (vin, brun)
- [ɔ̃] = on, om (bon, ton)

Convert [œ̃] → [ɛ̃] for TTS compatibility.

═══════════════════════════════════════════════════════════════════════════════
RULE #7: SYLLABIFICATION
═══════════════════════════════════════════════════════════════════════════════

Use hyphens "-" to separate syllables within words.
Use spaces between words.
Use ‿ for liaisons and elisions.

═══════════════════════════════════════════════════════════════════════════════
EXAMPLES
═══════════════════════════════════════════════════════════════════════════════

Example 1: "Lydia sur tes roses joues"
{
  "lines": [{
    "original": "Lydia sur tes roses joues",
    "ipa_sung": "li-dja syr tɛ ro-zə ʒu"
  }]
}

Example 2: "Roule étincelant"
{
  "lines": [{
    "original": "Roule étincelant",
    "ipa_sung": "rul‿e-tɛ̃-sə-lɑ̃"
  }]
}

Example 3: "Et sur ton col frais et si blanc"
{
  "lines": [{
    "original": "Et sur ton col frais et si blanc",
    "ipa_sung": "e syr tɔ̃ kɔl frɛ e si blɑ̃"
  }]
}

Example 4: "L'or fluide que tu dénoues"
{
  "lines": [{
    "original": "L'or fluide que tu dénoues",
    "ipa_sung": "lɔr flɥid kə ty de-nu"
  }]
}

Example 5: "Laisse tes baisers de colombe"
{
  "lines": [{
    "original": "Laisse tes baisers de colombe",
    "ipa_sung": "lɛ-sə tɛ bɛ-ze də ko-lɔ̃-bə"
  }]
}

═══════════════════════════════════════════════════════════════════════════════
FINAL CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

✓ "tes", "mes", "les", "ses" use [ɛ] (open E), NEVER [ə]
✓ Schwa is ELIDED before vowels (use ‿ liaison marker)
✓ Schwa is KEPT before consonants
✓ All R sounds use alveolar trill [r] (NOT [ʁ] or [ɾ])
✓ Proper liaisons applied

Now process the following French lyrics:
${lyrics}`;

  return prompt;
}
