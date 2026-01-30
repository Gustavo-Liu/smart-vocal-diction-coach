/**
 * French IPA Reference Data
 * 法语 IPA 音标参考表
 *
 * 每个音标包含：
 * - symbol: IPA 符号
 * - name_zh: 中文名称
 * - name_en: 英文名称
 * - example: 法语示例单词
 * - example_ipa: 示例单词的 IPA
 * - description_zh: 中文发音描述
 * - description_en: 英文发音描述
 * - audio_text: 用于 TTS 生成音频的文本（法语单词）
 */

export interface IpaSymbol {
  symbol: string;
  name_zh: string;
  name_en: string;
  example: string;
  example_ipa: string;
  description_zh: string;
  description_en: string;
  // 用于单独播放音素的文本（通常是一个简单的音节）- 保留作为 TTS 后备
  phoneme_audio_text: string;
  // 用于播放示例单词的文本 - 保留作为 TTS 后备
  example_audio_text: string;
  // 预录制音频文件路径（优先使用）
  phoneme_audio_file?: string;
  example_audio_file?: string;
}

// 生成音频文件名的辅助函数（将 IPA 符号转换为安全的文件名）
export function getAudioFileName(symbol: string): string {
  // 将特殊 IPA 字符转换为安全的文件名
  const safeNames: Record<string, string> = {
    'i': 'i',
    'e': 'e',
    'ɛ': 'epsilon',
    'a': 'a',
    'ɑ': 'alpha',
    'ɔ': 'open-o',
    'o': 'o',
    'u': 'u',
    'y': 'y',
    'ø': 'o-slash',
    'œ': 'oe',
    'ə': 'schwa',
    'ɛ̃': 'epsilon-nasal',
    'ɑ̃': 'alpha-nasal',
    'ɔ̃': 'open-o-nasal',
    'œ̃': 'oe-nasal',
    'j': 'j',
    'w': 'w',
    'ɥ': 'turned-h',
    'p': 'p',
    'b': 'b',
    't': 't',
    'd': 'd',
    'k': 'k',
    'g': 'g',
    'f': 'f',
    'v': 'v',
    's': 's',
    'z': 'z',
    'ʃ': 'esh',
    'ʒ': 'ezh',
    'm': 'm',
    'n': 'n',
    'ɲ': 'n-palatal',
    'ŋ': 'eng',
    'l': 'l',
    'ʁ': 'r-uvular',
  };
  return safeNames[symbol] || symbol;
}

export interface IpaCategory {
  category_zh: string;
  category_en: string;
  symbols: IpaSymbol[];
}

export const frenchIpaReference: IpaCategory[] = [
  {
    category_zh: '口腔元音',
    category_en: 'Oral Vowels',
    symbols: [
      {
        symbol: 'i',
        name_zh: '闭前不圆唇元音',
        name_en: 'Close front unrounded',
        example: 'si',
        example_ipa: 'si',
        description_zh: '类似中文"衣"，嘴角向两边拉',
        description_en: 'Like "ee" in "see"',
        phoneme_audio_text: 'i',
        example_audio_text: 'si',
      },
      {
        symbol: 'e',
        name_zh: '半闭前不圆唇元音',
        name_en: 'Close-mid front unrounded',
        example: 'été',
        example_ipa: 'ete',
        description_zh: '类似"诶"，但更紧',
        description_en: 'Like "ay" in "say" but shorter',
        phoneme_audio_text: 'é',
        example_audio_text: 'été',
      },
      {
        symbol: 'ɛ',
        name_zh: '半开前不圆唇元音',
        name_en: 'Open-mid front unrounded',
        example: 'tête',
        example_ipa: 'tɛt',
        description_zh: '类似英语"bed"中的元音',
        description_en: 'Like "e" in "bed"',
        phoneme_audio_text: 'è',
        example_audio_text: 'tête',
      },
      {
        symbol: 'a',
        name_zh: '开前不圆唇元音',
        name_en: 'Open front unrounded',
        example: 'chat',
        example_ipa: 'ʃa',
        description_zh: '类似中文"啊"，但嘴张得更小',
        description_en: 'Like "a" in "father" but fronter',
        phoneme_audio_text: 'a',
        example_audio_text: 'chat',
      },
      {
        symbol: 'ɑ',
        name_zh: '开后不圆唇元音',
        name_en: 'Open back unrounded',
        example: 'bas',
        example_ipa: 'bɑ',
        description_zh: '类似"啊"，舌头靠后',
        description_en: 'Like "a" in "father"',
        phoneme_audio_text: 'â',
        example_audio_text: 'bas',
      },
      {
        symbol: 'ɔ',
        name_zh: '半开后圆唇元音',
        name_en: 'Open-mid back rounded',
        example: 'pomme',
        example_ipa: 'pɔm',
        description_zh: '类似英语"or"但更短',
        description_en: 'Like "o" in "dog"',
        phoneme_audio_text: 'o',
        example_audio_text: 'pomme',
      },
      {
        symbol: 'o',
        name_zh: '半闭后圆唇元音',
        name_en: 'Close-mid back rounded',
        example: 'dos',
        example_ipa: 'do',
        description_zh: '类似"哦"，嘴唇圆而突出',
        description_en: 'Like "o" in "go"',
        phoneme_audio_text: 'ô',
        example_audio_text: 'dos',
      },
      {
        symbol: 'u',
        name_zh: '闭后圆唇元音',
        name_en: 'Close back rounded',
        example: 'loup',
        example_ipa: 'lu',
        description_zh: '类似中文"乌"',
        description_en: 'Like "oo" in "food"',
        phoneme_audio_text: 'ou',
        example_audio_text: 'loup',
      },
      {
        symbol: 'y',
        name_zh: '闭前圆唇元音',
        name_en: 'Close front rounded',
        example: 'rue',
        example_ipa: 'ʁy',
        description_zh: '发"衣"的同时嘴唇圆起',
        description_en: 'Say "ee" with rounded lips',
        phoneme_audio_text: 'u',
        example_audio_text: 'rue',
      },
      {
        symbol: 'ø',
        name_zh: '半闭前圆唇元音',
        name_en: 'Close-mid front rounded',
        example: 'feu',
        example_ipa: 'fø',
        description_zh: '发"诶"的同时嘴唇圆起',
        description_en: 'Say "ay" with rounded lips',
        phoneme_audio_text: 'eu',
        example_audio_text: 'feu',
      },
      {
        symbol: 'œ',
        name_zh: '半开前圆唇元音',
        name_en: 'Open-mid front rounded',
        example: 'sœur',
        example_ipa: 'sœʁ',
        description_zh: '发"ɛ"的同时嘴唇圆起',
        description_en: 'Say "e" in "bed" with rounded lips',
        phoneme_audio_text: 'œu',
        example_audio_text: 'sœur',
      },
      {
        symbol: 'ə',
        name_zh: '中央元音（Schwa）',
        name_en: 'Schwa',
        example: 'je',
        example_ipa: 'ʒə',
        description_zh: '轻声的"呃"，嘴唇微圆',
        description_en: 'Like "a" in "about", with slight lip rounding',
        phoneme_audio_text: 'e',
        example_audio_text: 'je',
      },
    ],
  },
  {
    category_zh: '鼻化元音',
    category_en: 'Nasal Vowels',
    symbols: [
      {
        symbol: 'ɛ̃',
        name_zh: '鼻化半开前元音',
        name_en: 'Nasal open-mid front',
        example: 'vin',
        example_ipa: 'vɛ̃',
        description_zh: '发"ɛ"同时气流从鼻腔出',
        description_en: 'Like "an" in "van" but nasal',
        phoneme_audio_text: 'in',
        example_audio_text: 'vin',
      },
      {
        symbol: 'ɑ̃',
        name_zh: '鼻化开后元音',
        name_en: 'Nasal open back',
        example: 'dans',
        example_ipa: 'dɑ̃',
        description_zh: '发"ɑ"同时气流从鼻腔出',
        description_en: 'Like "on" in "song" but more open',
        phoneme_audio_text: 'an',
        example_audio_text: 'dans',
      },
      {
        symbol: 'ɔ̃',
        name_zh: '鼻化半开后元音',
        name_en: 'Nasal open-mid back',
        example: 'non',
        example_ipa: 'nɔ̃',
        description_zh: '发"ɔ"同时气流从鼻腔出',
        description_en: 'Like "on" in "song"',
        phoneme_audio_text: 'on',
        example_audio_text: 'non',
      },
      {
        symbol: 'œ̃',
        name_zh: '鼻化半开前圆唇元音',
        name_en: 'Nasal open-mid front rounded',
        example: 'pain',
        example_ipa: 'pœ̃',
        description_zh: '发"œ"同时气流从鼻腔出',
        description_en: 'Like "un" in French "un"',
        phoneme_audio_text: 'un',
        example_audio_text: 'pain',
      },
    ],
  },
  {
    category_zh: '半元音',
    category_en: 'Semivowels',
    symbols: [
      {
        symbol: 'j',
        name_zh: '硬腭近音',
        name_en: 'Palatal approximant',
        example: 'yeux',
        example_ipa: 'jø',
        description_zh: '类似英语"yes"中的y',
        description_en: 'Like "y" in "yes"',
        phoneme_audio_text: 'ye',
        example_audio_text: 'yeux',
      },
      {
        symbol: 'w',
        name_zh: '唇软腭近音',
        name_en: 'Labio-velar approximant',
        example: 'oui',
        example_ipa: 'wi',
        description_zh: '类似英语"we"中的w',
        description_en: 'Like "w" in "we"',
        phoneme_audio_text: 'oui',
        example_audio_text: 'oui',
      },
      {
        symbol: 'ɥ',
        name_zh: '唇硬腭近音',
        name_en: 'Labio-palatal approximant',
        example: 'huit',
        example_ipa: 'ɥit',
        description_zh: '发"y"的同时快速滑向下一个元音',
        description_en: 'Like "w" but with lips more rounded',
        phoneme_audio_text: 'ui',
        example_audio_text: 'huit',
      },
    ],
  },
  {
    category_zh: '辅音 - 塞音',
    category_en: 'Consonants - Plosives',
    symbols: [
      {
        symbol: 'p',
        name_zh: '清双唇塞音',
        name_en: 'Voiceless bilabial plosive',
        example: 'papa',
        example_ipa: 'papa',
        description_zh: '类似中文"怕"的声母',
        description_en: 'Like "p" in "pen"',
        phoneme_audio_text: 'pa',
        example_audio_text: 'papa',
      },
      {
        symbol: 'b',
        name_zh: '浊双唇塞音',
        name_en: 'Voiced bilabial plosive',
        example: 'bébé',
        example_ipa: 'bebe',
        description_zh: '类似英语"boy"中的b',
        description_en: 'Like "b" in "boy"',
        phoneme_audio_text: 'ba',
        example_audio_text: 'bébé',
      },
      {
        symbol: 't',
        name_zh: '清齿龈塞音',
        name_en: 'Voiceless alveolar plosive',
        example: 'tout',
        example_ipa: 'tu',
        description_zh: '舌尖抵上齿龈',
        description_en: 'Like "t" in "top"',
        phoneme_audio_text: 'ta',
        example_audio_text: 'tout',
      },
      {
        symbol: 'd',
        name_zh: '浊齿龈塞音',
        name_en: 'Voiced alveolar plosive',
        example: 'dîner',
        example_ipa: 'dine',
        description_zh: '类似英语"do"中的d',
        description_en: 'Like "d" in "do"',
        phoneme_audio_text: 'da',
        example_audio_text: 'dîner',
      },
      {
        symbol: 'k',
        name_zh: '清软腭塞音',
        name_en: 'Voiceless velar plosive',
        example: 'café',
        example_ipa: 'kafe',
        description_zh: '类似中文"可"的声母',
        description_en: 'Like "k" in "kit"',
        phoneme_audio_text: 'ca',
        example_audio_text: 'café',
      },
      {
        symbol: 'g',
        name_zh: '浊软腭塞音',
        name_en: 'Voiced velar plosive',
        example: 'gare',
        example_ipa: 'gaʁ',
        description_zh: '类似英语"go"中的g',
        description_en: 'Like "g" in "go"',
        phoneme_audio_text: 'ga',
        example_audio_text: 'gare',
      },
    ],
  },
  {
    category_zh: '辅音 - 擦音',
    category_en: 'Consonants - Fricatives',
    symbols: [
      {
        symbol: 'f',
        name_zh: '清唇齿擦音',
        name_en: 'Voiceless labiodental fricative',
        example: 'feu',
        example_ipa: 'fø',
        description_zh: '类似中文"发"的声母',
        description_en: 'Like "f" in "fun"',
        phoneme_audio_text: 'fa',
        example_audio_text: 'feu',
      },
      {
        symbol: 'v',
        name_zh: '浊唇齿擦音',
        name_en: 'Voiced labiodental fricative',
        example: 'voiture',
        example_ipa: 'vwatyʁ',
        description_zh: '类似英语"very"中的v',
        description_en: 'Like "v" in "very"',
        phoneme_audio_text: 'va',
        example_audio_text: 'voiture',
      },
      {
        symbol: 's',
        name_zh: '清齿龈擦音',
        name_en: 'Voiceless alveolar fricative',
        example: 'soleil',
        example_ipa: 'sɔlɛj',
        description_zh: '类似中文"思"的声母',
        description_en: 'Like "s" in "sun"',
        phoneme_audio_text: 'sa',
        example_audio_text: 'soleil',
      },
      {
        symbol: 'z',
        name_zh: '浊齿龈擦音',
        name_en: 'Voiced alveolar fricative',
        example: 'zèbre',
        example_ipa: 'zɛbʁ',
        description_zh: '类似英语"zoo"中的z',
        description_en: 'Like "z" in "zoo"',
        phoneme_audio_text: 'za',
        example_audio_text: 'zèbre',
      },
      {
        symbol: 'ʃ',
        name_zh: '清龈后擦音',
        name_en: 'Voiceless postalveolar fricative',
        example: 'chat',
        example_ipa: 'ʃa',
        description_zh: '类似中文"诗"的声母',
        description_en: 'Like "sh" in "ship"',
        phoneme_audio_text: 'cha',
        example_audio_text: 'chat',
      },
      {
        symbol: 'ʒ',
        name_zh: '浊龈后擦音',
        name_en: 'Voiced postalveolar fricative',
        example: 'jour',
        example_ipa: 'ʒuʁ',
        description_zh: '类似英语"measure"中的s',
        description_en: 'Like "s" in "measure"',
        phoneme_audio_text: 'ja',
        example_audio_text: 'jour',
      },
    ],
  },
  {
    category_zh: '辅音 - 鼻音',
    category_en: 'Consonants - Nasals',
    symbols: [
      {
        symbol: 'm',
        name_zh: '双唇鼻音',
        name_en: 'Bilabial nasal',
        example: 'maman',
        example_ipa: 'mamɑ̃',
        description_zh: '类似中文"妈"的声母',
        description_en: 'Like "m" in "mother"',
        phoneme_audio_text: 'ma',
        example_audio_text: 'maman',
      },
      {
        symbol: 'n',
        name_zh: '齿龈鼻音',
        name_en: 'Alveolar nasal',
        example: 'non',
        example_ipa: 'nɔ̃',
        description_zh: '类似中文"那"的声母',
        description_en: 'Like "n" in "no"',
        phoneme_audio_text: 'na',
        example_audio_text: 'non',
      },
      {
        symbol: 'ɲ',
        name_zh: '硬腭鼻音',
        name_en: 'Palatal nasal',
        example: 'agneau',
        example_ipa: 'aɲo',
        description_zh: '类似西班牙语的ñ',
        description_en: 'Like "ny" in "canyon"',
        phoneme_audio_text: 'gne',
        example_audio_text: 'agneau',
      },
      {
        symbol: 'ŋ',
        name_zh: '软腭鼻音',
        name_en: 'Velar nasal',
        example: 'camping',
        example_ipa: 'kɑ̃piŋ',
        description_zh: '类似英语"sing"中的ng',
        description_en: 'Like "ng" in "sing"',
        phoneme_audio_text: 'ing',
        example_audio_text: 'camping',
      },
    ],
  },
  {
    category_zh: '辅音 - 流音',
    category_en: 'Consonants - Liquids',
    symbols: [
      {
        symbol: 'l',
        name_zh: '齿龈边近音',
        name_en: 'Alveolar lateral approximant',
        example: 'lune',
        example_ipa: 'lyn',
        description_zh: '类似中文"拉"的声母',
        description_en: 'Like "l" in "love"',
        phoneme_audio_text: 'la',
        example_audio_text: 'lune',
      },
      {
        symbol: 'ʁ',
        name_zh: '小舌擦音（现代）',
        name_en: 'Uvular fricative (Modern)',
        example: 'rue',
        example_ipa: 'ʁy',
        description_zh: '小舌振动（现代口语）',
        description_en: 'Uvular R (modern speech)',
        phoneme_audio_text: 'ra',
        example_audio_text: 'rue',
      },
    ],
  },
];

// 获取所有 IPA 符号的扁平列表
export function getAllIpaSymbols(): IpaSymbol[] {
  return frenchIpaReference.flatMap(category => category.symbols);
}

// 根据符号查找 IPA 信息
export function findIpaBySymbol(symbol: string): IpaSymbol | undefined {
  return getAllIpaSymbols().find(ipa => ipa.symbol === symbol);
}
