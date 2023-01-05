export interface ValidationResponse {
  valid: boolean;
  cause?: string;
  fieldKey?: string;
  value?: any;
  data?: any;
  status: number;
}
