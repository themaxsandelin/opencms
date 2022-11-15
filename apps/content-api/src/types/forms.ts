export interface ValidationResponse {
  valid: boolean;
  cause?: string;
  fieldKey?: string;
  data?: any;
}
