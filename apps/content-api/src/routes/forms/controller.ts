// Dependencies
import { rename, mkdir, rm } from 'fs/promises';
import { PrismaClient, FormVersionSubmission } from '@prisma/client';
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
      if (field.type !== 'file') {
        const fieldResponse = validateFormField(field, data);
        if (!fieldResponse.valid) {
          response = fieldResponse;
          break;
        } else {
          response.data[field.config.key] = fieldResponse.value;
        }
      }
    }
  }

  return response;
}

async function createSubmissionFile(file: Express.Multer.File, submissionId: string) {
  return prisma.formVersionSubmissionFile.create({
    data: {
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      submissionId,
    }
  });
}

export async function handleSubmissionFiles(files: Array<Express.Multer.File>, submission: FormVersionSubmission, uploadDir: string) {
  // Ensure the submission directory exists.
  const submissionFolder = `${uploadDir}/submissions/${submission.id}`;
  await mkdir(submissionFolder);

  await Promise.all(
    files.map(async (file) => {
      const fileEntry = await createSubmissionFile(file, submission.id);
      await rename(file.path, `${submissionFolder}/${fileEntry.id}`);
    })
  );
}

export async function deleteRequestFiles(files: Array<Express.Multer.File>) {
  await Promise.all(
    files.map(async (file) => {
      await rm(file.path);
    })
  );
}

export async function validateFormToken(tokenId: string, siteId: string, environmentId: string, localeCode: string) {
  const token = await prisma.formVersionToken.findFirst({
    where: {
      id: tokenId,
      siteId,
      environmentId,
      localeCode,
      expiresAt: {
        gte: new Date().toISOString()
      }
    }
  });
  if (!token) return false;
  return true;
}

export async function deleteFormToken(tokenId: string) {
  return prisma.formVersionToken.delete({
    where: {
      id: tokenId
    }
  });
}
