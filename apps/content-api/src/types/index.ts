// Dependencies
import { PageInstance } from '@prisma/client';

export interface PageInstanceExtended extends PageInstance {
  pageData?: any;
}
