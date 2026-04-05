import { ApiEndpointDoc, ApiScopeOption, ApiScopeValue } from "./types";

export const apiScopeOptions: readonly ApiScopeOption[] = [
  { value: "all", label: "Semua" },
  { value: "public", label: "Public" },
  { value: "jwt", label: "JWT" },
  { value: "client", label: "Client API" },
  { value: "callback", label: "Callback" },
];

export function resolveApiEndpointScope(endpoint: ApiEndpointDoc): ApiScopeValue {
  if (endpoint.auth.includes("Provider Callback")) {
    return "callback";
  }

  if (endpoint.path.startsWith("/api/client/v1")) {
    return "client";
  }

  if (endpoint.auth.includes("Bearer JWT")) {
    return "jwt";
  }

  return "public";
}