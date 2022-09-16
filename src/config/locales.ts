interface Locale {
  code: string;
  name: string;
}

const locales: Array<Locale> = [
  {
    code: 'af-ZA',
    name: 'Afrikaans (South Africa)'
  },
  {
    code: 'ar-AE',
    name: 'Arabic (U.A.E.)'
  },
  {
    code: 'ar-BH',
    name: 'Arabic (Bahrain)'
  },
  {
    code: 'ar-DZ',
    name: 'Arabic (Algeria)'
  },
  {
    code: 'ar-EG',
    name: 'Arabic (Egypt)'
  },
  {
    code: 'ar-IQ',
    name: 'Arabic (Iraq)'
  },
  {
    code: 'ar-JO',
    name: 'Arabic (Jordan)'
  },
  {
    code: 'ar-KW',
    name: 'Arabic (Kuwait)'
  },
  {
    code: 'ar-LB',
    name: 'Arabic (Lebanon)'
  },
  {
    code: 'ar-LY',
    name: 'Arabic (Libya)'
  },
  {
    code: 'ar-MA',
    name: 'Arabic (Morocco)'
  },
  {
    code: 'ar-OM',
    name: 'Arabic (Oman)'
  },
  {
    code: 'ar-QA',
    name: 'Arabic (Qatar)'
  },
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)'
  },
  {
    code: 'ar-SY',
    name: 'Arabic (Syria)'
  },
  {
    code: 'ar-TN',
    name: 'Arabic (Tunisia)'
  },
  {
    code: 'ar-YE',
    name: 'Arabic (Yemen)'
  },
  {
    code: 'az-AZ',
    name: 'Azeri (Latin) (Azerbaijan)'
  },
  {
    code: 'az-AZ',
    name: 'Azeri (Cyrillic) (Azerbaijan)'
  },
  {
    code: 'be-BY',
    name: 'Belarusian (Belarus)'
  },
  {
    code: 'bg-BG',
    name: 'Bulgarian (Bulgaria)'
  },
  {
    code: 'bs-BA',
    name: 'Bosnian (Bosnia and Herzegovina)'
  },
  {
    code: 'ca-ES',
    name: 'Catalan (Spain)'
  },
  {
    code: 'cs-CZ',
    name: 'Czech (Czech Republic)'
  },
  {
    code: 'cy-GB',
    name: 'Welsh (United Kingdom)'
  },
  {
    code: 'da-DK',
    name: 'Danish (Denmark)'
  },
  {
    code: 'de-AT',
    name: 'German (Austria)'
  },
  {
    code: 'de-CH',
    name: 'German (Switzerland)'
  },
  {
    code: 'de-DE',
    name: 'German (Germany)'
  },
  {
    code: 'de-LI',
    name: 'German (Liechtenstein)'
  },
  {
    code: 'de-LU',
    name: 'German (Luxembourg)'
  },
  {
    code: 'dv-MV',
    name: 'Divehi (Maldives)'
  },
  {
    code: 'el-GR',
    name: 'Greek (Greece)'
  },
  {
    code: 'en-AU',
    name: 'English (Australia)'
  },
  {
    code: 'en-BZ',
    name: 'English (Belize)'
  },
  {
    code: 'en-CA',
    name: 'English (Canada)'
  },
  {
    code: 'en-CB',
    name: 'English (Caribbean)'
  },
  {
    code: 'en-GB',
    name: 'English (United Kingdom)'
  },
  {
    code: 'en-IE',
    name: 'English (Ireland)'
  },
  {
    code: 'en-JM',
    name: 'English (Jamaica)'
  },
  {
    code: 'en-NZ',
    name: 'English (New Zealand)'
  },
  {
    code: 'en-PH',
    name: 'English (Republic of the Philippines)'
  },
  {
    code: 'en-TT',
    name: 'English (Trinidad and Tobago)'
  },
  {
    code: 'en-US',
    name: 'English (United States)'
  },
  {
    code: 'en-ZA',
    name: 'English (South Africa)'
  },
  {
    code: 'en-ZW',
    name: 'English (Zimbabwe)'
  },
  {
    code: 'es-AR',
    name: 'Spanish (Argentina)'
  },
  {
    code: 'es-BO',
    name: 'Spanish (Bolivia)'
  },
  {
    code: 'es-CL',
    name: 'Spanish (Chile)'
  },
  {
    code: 'es-CO',
    name: 'Spanish (Colombia)'
  },
  {
    code: 'es-CR',
    name: 'Spanish (Costa Rica)'
  },
  {
    code: 'es-DO',
    name: 'Spanish (Dominican Republic)'
  },
  {
    code: 'es-EC',
    name: 'Spanish (Ecuador)'
  },
  {
    code: 'es-ES',
    name: 'Spanish (Castilian)'
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)'
  },
  {
    code: 'es-GT',
    name: 'Spanish (Guatemala)'
  },
  {
    code: 'es-HN',
    name: 'Spanish (Honduras)'
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)'
  },
  {
    code: 'es-NI',
    name: 'Spanish (Nicaragua)'
  },
  {
    code: 'es-PA',
    name: 'Spanish (Panama)'
  },
  {
    code: 'es-PE',
    name: 'Spanish (Peru)'
  },
  {
    code: 'es-PR',
    name: 'Spanish (Puerto Rico)'
  },
  {
    code: 'es-PY',
    name: 'Spanish (Paraguay)'
  },
  {
    code: 'es-SV',
    name: 'Spanish (El Salvador)'
  },
  {
    code: 'es-UY',
    name: 'Spanish (Uruguay)'
  },
  {
    code: 'es-VE',
    name: 'Spanish (Venezuela)'
  },
  {
    code: 'et-EE',
    name: 'Estonian (Estonia)'
  },
  {
    code: 'eu-ES',
    name: 'Basque (Spain)'
  },
  {
    code: 'fa-IR',
    name: 'Farsi (Iran)'
  },
  {
    code: 'fi-FI',
    name: 'Finnish (Finland)'
  },
  {
    code: 'fo-FO',
    name: 'Faroese (Faroe Islands)'
  },
  {
    code: 'fr-BE',
    name: 'French (Belgium)'
  },
  {
    code: 'fr-CA',
    name: 'French (Canada)'
  },
  {
    code: 'fr-CH',
    name: 'French (Switzerland)'
  },
  {
    code: 'fr-FR',
    name: 'French (France)'
  },
  {
    code: 'fr-LU',
    name: 'French (Luxembourg)'
  },
  {
    code: 'fr-MC',
    name: 'French (Principality of Monaco)'
  },
  {
    code: 'gl-ES',
    name: 'Galician (Spain)'
  },
  {
    code: 'gu-IN',
    name: 'Gujarati (India)'
  },
  {
    code: 'he-IL',
    name: 'Hebrew (Israel)'
  },
  {
    code: 'hi-IN',
    name: 'Hindi (India)'
  },
  {
    code: 'hr-BA',
    name: 'Croatian (Bosnia and Herzegovina)'
  },
  {
    code: 'hr-HR',
    name: 'Croatian (Croatia)'
  },
  {
    code: 'hu-HU',
    name: 'Hungarian (Hungary)'
  },
  {
    code: 'hy-AM',
    name: 'Armenian (Armenia)'
  },
  {
    code: 'id-ID',
    name: 'Indonesian (Indonesia)'
  },
  {
    code: 'is-IS',
    name: 'Icelandic (Iceland)'
  },
  {
    code: 'it-CH',
    name: 'Italian (Switzerland)'
  },
  {
    code: 'it-IT',
    name: 'Italian (Italy)'
  },
  {
    code: 'ja-JP',
    name: 'Japanese (Japan)'
  },
  {
    code: 'ka-GE',
    name: 'Georgian (Georgia)'
  },
  {
    code: 'kk-KZ',
    name: 'Kazakh (Kazakhstan)'
  },
  {
    code: 'kn-IN',
    name: 'Kannada (India)'
  },
  {
    code: 'ko-KR',
    name: 'Korean (Korea)'
  },
  {
    code: 'kok-IN',
    name: 'Konkani (India)'
  },
  {
    code: 'ky-KG',
    name: 'Kyrgyz (Kyrgyzstan)'
  },
  {
    code: 'lt-LT',
    name: 'Lithuanian (Lithuania)'
  },
  {
    code: 'lv-LV',
    name: 'Latvian (Latvia)'
  },
  {
    code: 'mi-NZ',
    name: 'Maori (New Zealand)'
  },
  {
    code: 'mk-MK',
    name: 'FYRO Macedonian (Former Yugoslav Republic of Macedonia)'
  },
  {
    code: 'mn-MN',
    name: 'Mongolian (Mongolia)'
  },
  {
    code: 'mr-IN',
    name: 'Marathi (India)'
  },
  {
    code: 'ms-BN',
    name: 'Malay (Brunei Darussalam)'
  },
  {
    code: 'ms-MY',
    name: 'Malay (Malaysia)'
  },
  {
    code: 'mt-MT',
    name: 'Maltese (Malta)'
  },
  {
    code: 'nb-NO',
    name: 'Norwegian (Bokm?l) (Norway)'
  },
  {
    code: 'nl-BE',
    name: 'Dutch (Belgium)'
  },
  {
    code: 'nl-NL',
    name: 'Dutch (Netherlands)'
  },
  {
    code: 'nn-NO',
    name: 'Norwegian (Nynorsk) (Norway)'
  },
  {
    code: 'ns-ZA',
    name: 'Northern Sotho (South Africa)'
  },
  {
    code: 'pa-IN',
    name: 'Punjabi (India)'
  },
  {
    code: 'pl-PL',
    name: 'Polish (Poland)'
  },
  {
    code: 'ps-AR',
    name: 'Pashto (Afghanistan)'
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)'
  },
  {
    code: 'pt-PT',
    name: 'Portuguese (Portugal)'
  },
  {
    code: 'qu-BO',
    name: 'Quechua (Bolivia)'
  },
  {
    code: 'qu-EC',
    name: 'Quechua (Ecuador)'
  },
  {
    code: 'qu-PE',
    name: 'Quechua (Peru)'
  },
  {
    code: 'ro-RO',
    name: 'Romanian (Romania)'
  },
  {
    code: 'ru-RU',
    name: 'Russian (Russia)'
  },
  {
    code: 'sa-IN',
    name: 'Sanskrit (India)'
  },
  {
    code: 'se-FI',
    name: 'Sami (Northern) (Finland)'
  },
  {
    code: 'se-FI',
    name: 'Sami (Skolt) (Finland)'
  },
  {
    code: 'se-FI',
    name: 'Sami (Inari) (Finland)'
  },
  {
    code: 'se-NO',
    name: 'Sami (Northern) (Norway)'
  },
  {
    code: 'se-NO',
    name: 'Sami (Lule) (Norway)'
  },
  {
    code: 'se-NO',
    name: 'Sami (Southern) (Norway)'
  },
  {
    code: 'se-SE',
    name: 'Sami (Northern) (Sweden)'
  },
  {
    code: 'se-SE',
    name: 'Sami (Lule) (Sweden)'
  },
  {
    code: 'se-SE',
    name: 'Sami (Southern) (Sweden)'
  },
  {
    code: 'sk-SK',
    name: 'Slovak (Slovakia)'
  },
  {
    code: 'sl-SI',
    name: 'Slovenian (Slovenia)'
  },
  {
    code: 'sq-AL',
    name: 'Albanian (Albania)'
  },
  {
    code: 'sr-BA',
    name: 'Serbian (Latin) (Bosnia and Herzegovina)'
  },
  {
    code: 'sr-BA',
    name: 'Serbian (Cyrillic) (Bosnia and Herzegovina)'
  },
  {
    code: 'sr-SP',
    name: 'Serbian (Latin) (Serbia and Montenegro)'
  },
  {
    code: 'sr-SP',
    name: 'Serbian (Cyrillic) (Serbia and Montenegro)'
  },
  {
    code: 'sv-FI',
    name: 'Swedish (Finland)'
  },
  {
    code: 'sv-SE',
    name: 'Swedish (Sweden)'
  },
  {
    code: 'sw-KE',
    name: 'Swahili (Kenya)'
  },
  {
    code: 'syr-SY',
    name: 'Syriac (Syria)'
  },
  {
    code: 'ta-IN',
    name: 'Tamil (India)'
  },
  {
    code: 'te-IN',
    name: 'Telugu (India)'
  },
  {
    code: 'th-TH',
    name: 'Thai (Thailand)'
  },
  {
    code: 'tl-PH',
    name: 'Tagalog (Philippines)'
  },
  {
    code: 'tn-ZA',
    name: 'Tswana (South Africa)'
  },
  {
    code: 'tr-TR',
    name: 'Turkish (Turkey)'
  },
  {
    code: 'tt-RU',
    name: 'Tatar (Russia)'
  },
  {
    code: 'uk-UA',
    name: 'Ukrainian (Ukraine)'
  },
  {
    code: 'ur-PK',
    name: 'Urdu (Islamic Republic of Pakistan)'
  },
  {
    code: 'uz-UZ',
    name: 'Uzbek (Latin) (Uzbekistan)'
  },
  {
    code: 'uz-UZ',
    name: 'Uzbek (Cyrillic) (Uzbekistan)'
  },
  {
    code: 'vi-VN',
    name: 'Vietnamese (Viet Nam)'
  },
  {
    code: 'xh-ZA',
    name: 'Xhosa (South Africa)'
  },
  {
    code: 'zh-CN',
    name: 'Chinese (S)'
  },
  {
    code: 'zh-HK',
    name: 'Chinese (Hong Kong)'
  },
  {
    code: 'zh-MO',
    name: 'Chinese (Macau)'
  },
  {
    code: 'zh-SG',
    name: 'Chinese (Singapore)'
  },
  {
    code: 'zh-TW',
    name: 'Chinese (T)'
  },
  {
    code: 'zu-ZA',
    name: 'Zulu (South Africa)'
  }
];

export default locales;
