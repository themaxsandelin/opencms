// Dependencies
import { PrismaClient } from '@prisma/client';
import { escape } from 'validator';

// Types
import { ValidationResponse } from '../../types/forms';

const prisma = new PrismaClient();

function validateFormField(field: any, data: any) {
  const { config } = field;
  const fieldHasValue = Object.prototype.hasOwnProperty.call(data, config.key) && data[config.key] !== '';
  if (!fieldHasValue && config.alwaysRequired) {
    return {
      valid: false,
      cause: 'missing-required',
      fieldKey: config.key
    };
  }
  const value = escape(data[config.key]);
  return {
    valid: true,
    value
  };
}

export async function validateFormSubmission(id: string, data: any, environmentId: string): Promise<ValidationResponse> {
  let response: ValidationResponse = {
    valid: true,
    data: {}
  };

  const formPublication = await prisma.formVersionPublication.findFirst({
    where: {
      environmentId,
      version: {
        id
      }
    },
    include: {
      version: true
    }
  });
  if (!formPublication) {
    return {
      valid: false,
    };
  }

  const { version } = formPublication;
  const { fields } = JSON.parse(version.config);
  if (fields) {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldResponse = validateFormField(field, data);
      if (!fieldResponse.valid) {
        response = fieldResponse;
        break;
      } else {
        response.data[field.config.key] = fieldResponse.value;
      }
    }
  }

  return response;
}
