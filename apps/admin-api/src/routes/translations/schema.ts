// Dependencies
import { z } from 'zod';

// Config
import localeOptions from '../../config/locales-options';

type LocaleCode = typeof localeOptions[number]['code'];

const localeCodes: [LocaleCode, ...LocaleCode[]] = [
  localeOptions[0].code,
  ...localeOptions.slice(1).map(option => option.code)
];

const localizedInput = z.object({
  type: z.literal('localized-input'),
  values: z.record(z.enum(localeCodes), z.string()),
}, {
  required_error: 'You have to set the translation value.',
  invalid_type_error: 'The translation value has to be a localized value.'
});

export const createTranslationSchema = z.object({
  body: z.object({
    key: z.string({
      required_error: 'You have to set the translation key.',
      invalid_type_error: 'The translation key has to be a string.'
    }),
    value: localizedInput
  })
});

export const updateTranslationSchema = z.object({
  body: z.object({
    key: z.string({
      required_error: 'You have to set the translation key.',
      invalid_type_error: 'The translation key has to be a string.'
    }).optional(),
    value: localizedInput.optional()
  })
});
