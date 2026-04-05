export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiScopeValue = "public" | "jwt" | "client" | "callback";
export type ApiScopeFilter = "all" | ApiScopeValue;

export type ApiScopeOption = {
  value: ApiScopeFilter;
  label: string;
};

export type ApiParamDoc = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
};

export type ApiStatusCodeDoc = {
  code: number;
  description: string;
};

export type ApiExampleDoc = {
  title: string;
  language?: "bash" | "json" | "text";
  content: string;
};

export type ApiErrorExampleDoc = {
  title: string;
  status: number;
  content: string;
};

export type ApiEndpointDoc = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  auth: string[];
  fullPath?: string;
  headers?: ApiParamDoc[];
  pathParams?: ApiParamDoc[];
  queryParams?: ApiParamDoc[];
  bodyFields?: ApiParamDoc[];
  notes?: string[];
  statusCodes?: ApiStatusCodeDoc[];
  requestExample?: ApiExampleDoc;
  successExample?: ApiExampleDoc;
  errorExamples?: ApiErrorExampleDoc[];
};

export type ApiEndpointGroup = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  endpoints: ApiEndpointDoc[];
};

export type ApiAuthScheme = {
  title: string;
  badge: string;
  description: string;
  headers: string;
};

export type ApiHighlight = {
  title: string;
  description: string;
};

export type ApiQuickStartStep = {
  step: string;
  title: string;
  description: string;
};

export type ApiLifecycleStage = {
  title: string;
  paymentStatus: string;
  buyStatus: string;
  description: string;
};

export type ApiFaq = {
  question: string;
  answer: string;
};