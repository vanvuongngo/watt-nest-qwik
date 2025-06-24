import { apiOptions } from "~/consts/api";
import { timeApi } from "./routes";

// Isomorphic fetch - to be used in both client and server side
export async function fetchTimeApi(
  url: string = timeApi,
  options = apiOptions
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(timeout);

  return response;
}
