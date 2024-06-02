export function generateMethod(options: RequestInit): string {
  const method = options.method;
  if (!method) return "";
  const type: Record<string, string> = {
    GET: " -X GET",
    POST: " -X POST",
    PUT: " -X PUT",
    PATCH: " -X PATCH",
    DELETE: " -X DELETE",
    HEAD: " -X HEAD",
    OPTIONS: " -X OPTIONS",
  };
  return type[method.toUpperCase()] || "";
};

function getHeaderString(name: string, val: string): string {
  return ` -H "${name}: ${`${val}`.replace(/(\\|")/g, "\\$1")}"`;
}

export function generateHeader(init?: RequestInit | undefined): { params: string, isEncode: boolean } {
  const headers = init?.headers;
  let isEncode = false;
  let headerParam = "";
  if (headers instanceof Headers) {
    headers.forEach((val, name) => {
      if (name.toLocaleLowerCase() !== "content-length") {
        headerParam += getHeaderString(name, val);
      }
      if (name.toLocaleLowerCase() === "accept-encoding") {
        isEncode = true;
      }
    });
  } else if (headers) {
    const _headers = headers as Record<string, string>;
    Object.keys(_headers).map((name) => {
      if (name.toLocaleLowerCase() !== "content-length") {
        headerParam += getHeaderString(name, _headers[name]);
      }
      if (name.toLocaleLowerCase() === "accept-encoding") {
        isEncode = true;
      }
    });
  }
  return {
    params: headerParam,
    isEncode,
  };
};

export function escapeBody(body: unknown) {
  if (typeof body !== "string") return body;
  return body.replace(/'/g, `'\\''`);
}

export function generateBody(body?: unknown): string {
  if (!body) return "";
  if (typeof body === "object") {
    return ` --data-binary '${escapeBody(JSON.stringify(body))}'`;
  }
  return ` --data-binary '${escapeBody(body)}'`;
}

export function generateCompress(isEncode?: boolean): string {
  return isEncode ? " --compressed" : "";
}

/**
 * Receives the exact same parameters as the fetch standand
 * then returns a curl string equivalent to that request.
 * @param input RequestInfo | URL
 * @param init RequestInit | undefined
 * @returns string
 */
export function fetchToCurl(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): string {
  const canUseInputDirectly = typeof input === "string" || input instanceof URL;
  const url = canUseInputDirectly ? input : input.url;
  const options = init ?? {};
  const { body } = options;
  const headers = generateHeader(options);
  return `curl '${url}'${generateMethod(options)}${headers.params || ""}${
    generateBody(body)
  }${generateCompress(headers.isEncode)}`;
};