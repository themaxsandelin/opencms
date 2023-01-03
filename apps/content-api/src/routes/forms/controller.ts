// Dependencies
import { rename, mkdir, rm } from 'fs/promises';
import { PrismaClient, FormVersionSubmission, FormVersion } from '@prisma/client';
import { escape } from 'validator';

// Controllers
import { findPageInstanceListFromPath } from '../content/controller';

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

  const value = data[config.key] ? escape(data[config.key]) : '';
  return {
    valid: true,
    value
  };
}

export async function getPublishedFormVersion(id: string, environmentId: string) {
  return prisma.formVersionPublication.findFirst({
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
}

export async function getPreviouslyPublishedFormVersion(id: string) {
  return prisma.formVersion.findFirst({
    where: {
      id,
      wasPublished: true
    }
  });
}

export async function validateFormData(data: any, formVersion: FormVersion): Promise<ValidationResponse> {
  let response: ValidationResponse = {
    valid: true,
    data: {}
  };

  const { fields } = JSON.parse(formVersion.config);
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

export async function validateSubmissionFiles(files: Array<Express.Multer.File>, formVersion: FormVersion): Promise<ValidationResponse> {
  let fileCountLimit = 5;
  const fileSizeLimit = 5000000; // 5mb

  let response: ValidationResponse = {
    valid: true,
    data: {}
  };

  const { fields } = JSON.parse(formVersion.config);
  const fileField = fields.find(field => field.type === 'file');
  if (!fileField) {
    if (files && files.length) {
      return {
        valid: false,
        cause: 'files-not-accepted',
        fieldKey: null
      };
    } else {
      return response;
    }
  }

  const { mimeTypes, limit } = fileField.config;
  // Validate a total limit of files being uploaded.
  // Current max is hard coded to 5, but can be configured to less than that.
  if (limit) {
    fileCountLimit = typeof limit === 'string' ? parseInt(limit) : limit;
  }
  if (files.length > fileCountLimit) {
    response.valid = false;
    response.cause = 'too-many-files';
    response.fieldKey = fileField.config.key;
    return response;
  }

  // Validate based on any mimeType configured on the file field.
  let types = [];
  if (mimeTypes) {
    types = mimeTypes.split(', ');
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (types.length && !types.includes(file.mimetype)) {
      response = {
        valid: false,
        cause: 'invalid-file-type',
        fieldKey: fileField.config.key
      };
      break;
    }
    if (file.size > fileSizeLimit) {
      response = {
        valid: false,
        cause: 'size-limit-reached',
        fieldKey: fileField.config.key
      };
      break;
    }
  }

  return response;
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

export async function getFormOnPagesByPath(path: string, formId: string, siteId: string, environmentId: string, localeCode: string) {
  try {
    const instances = await findPageInstanceListFromPath(path, siteId, environmentId, localeCode);
    if (!instances.length) {
      return null;
    }

    const pageInstance = instances.find(instance => instance.path === path);
    const pageLayoutVersionPublication = await prisma.pageLayoutVersionPublication.findFirst({
      where: {
        environmentId,
        version: {
          layout: {
            deleted: false,
            page: {
              id: pageInstance.pageId
            }
          }
        }
      },
      include: {
        version: true
      }
    });

    // Check that the form is actually present on the page.
    if (!pageLayoutVersionPublication) {
      return null;
    }
    if (!pageLayoutVersionPublication.version) {
      return null;
    }

    const { version } = pageLayoutVersionPublication;
    if (!version.content) {
      return null;
    }

    const content = JSON.parse(version.content);
    if (!content.components) {
      return null;
    }

    const formReference = content.components.find(component => component.key === 'form' && component.fieldData.form && component.fieldData.form === `reference:form:${formId}`);
    if (!formReference) {
      return null;
    }

    return instances;
  } catch (error) {
    console.error(`Failed to fetch form reference from page by path ${path}`, error);
    return null;
  }
}
