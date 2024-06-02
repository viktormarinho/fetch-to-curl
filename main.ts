export const generateMethod = (options: RequestInit) => {
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

const getHeaderString = (name: string, val: string) =>
  ` -H "${name}: ${`${val}`.replace(/(\\|")/g, "\\$1")}"`;

export const generateHeader = (init?: RequestInit | undefined) => {
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

export function generateBody(body?: unknown) {
  if (!body) return "";
  if (typeof body === "object") {
    return ` --data-binary '${escapeBody(JSON.stringify(body))}'`;
  }
  return ` --data-binary '${escapeBody(body)}'`;
}

export function generateCompress(isEncode?: boolean) {
  return isEncode ? " --compressed" : "";
}

export const fetchToCurl = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) => {
  const canUseInputDirectly = typeof input === "string" || input instanceof URL;
  const url = canUseInputDirectly ? input : input.url;
  const options = init ?? {};
  const { body } = options;
  const headers = generateHeader(options);
  return `curl '${url}'${generateMethod(options)}${headers.params || ""}${
    generateBody(body)
  }${generateCompress(headers.isEncode)}`;
};

export default fetchToCurl;
