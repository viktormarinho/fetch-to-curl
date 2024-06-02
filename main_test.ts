import {
  assert,
  assertEquals,
  assertMatch,
  assertObjectMatch,
} from "jsr:@std/assert";
import {
  fetchToCurl,
  generateBody,
  generateCompress,
  generateHeader,
  generateMethod,
} from "./main.ts";

const checkGeneratedHeadersResult = (
  generated: { params: string; isEncode: boolean },
  expectedHeaders: HeadersInit,
  expectedEncoding: boolean,
) => {
  assert(Object.hasOwn(generated, "isEncode"));
  assert(Object.hasOwn(generated, "params"));
  assertEquals(generated.isEncode, expectedEncoding);
  assertMatch(generated.params, new RegExp('( -H ".*?: .*?")+'));

  Object.entries(expectedHeaders).forEach(([name, value]) => {
    assert(
      generated.params.includes(`-H "${name}: ${value}"`) ||
        generated.params.includes(`-H "${name.toLowerCase()}: ${value}"`),
    );
  });
};

Deno.test("Generate method param", (t) => {
  t.step("No method", () => {
    assertEquals(generateMethod({}), "");
  });
  t.step("POST", () => {
    const option = {
      method: "post",
    };
    assertEquals(generateMethod(option), " -X POST");
  });
  t.step("PUT", () => {
    const option = {
      method: "put",
    };
    assertEquals(generateMethod(option), " -X PUT");
  });

  t.step("PATCH", () => {
    const option = {
      method: "patch",
    };
    assertEquals(generateMethod(option), " -X PATCH");
  });

  t.step("GET", () => {
    const option = {
      method: "get",
    };
    assertEquals(generateMethod(option), " -X GET");
  });

  t.step("DELETE", () => {
    const option = {
      method: "delete",
    };
    assertEquals(generateMethod(option), " -X DELETE");
  });

  t.step("HEAD", () => {
    const option = {
      method: "head",
    };
    assertEquals(generateMethod(option), " -X HEAD");
  });

  t.step("OPTIONS", () => {
    const option = {
      method: "options",
    };
    assertEquals(generateMethod(option), " -X OPTIONS");
  });

  t.step("Unknown method", () => {
    const option = {
      method: "xxxx",
    };
    assertEquals(generateMethod(option), "");
  });
});

const DEFAULT_HEADER_OPTS = {
  isEncode: false,
  params: "",
};

Deno.test("Generate header param", (t) => {
  t.step("No Header Options", () => {
    assertObjectMatch(generateHeader(), DEFAULT_HEADER_OPTS);
  });

  t.step("Empty Header Options", () => {
    assertObjectMatch(generateHeader({}), DEFAULT_HEADER_OPTS);
  });

  const testHeaders = {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "axios/0.18.0",
    "X-Test": "TestVal",
  };

  const testHeadersWithEncoding = {
    ...testHeaders,
    "accept-encoding": "gzip",
  };

  const testHeadersWithContentLength = {
    ...testHeaders,
    "content-length": "12345",
  };

  t.step("correctly parses Headers from object without encoding", () => {
    checkGeneratedHeadersResult(
      generateHeader({
        headers: testHeaders,
      }),
      testHeaders,
      false,
    );
  });

  t.step("correctly parses Headers from object with encoding", () => {
    checkGeneratedHeadersResult(
      generateHeader({
        headers: testHeadersWithEncoding,
      }),
      testHeadersWithEncoding,
      true,
    );
  });

  t.step("omits content-length Header when parsing headers from object", () => {
    checkGeneratedHeadersResult(
      generateHeader({
        headers: testHeadersWithContentLength,
      }),
      testHeaders,
      false,
    );
  });

  t.step("correctly parses Headers without encoding", () => {
    checkGeneratedHeadersResult(
      generateHeader({
        headers: new Headers(testHeaders),
      }),
      testHeaders,
      false,
    );
  });

  t.step("correctly parses Headers with encoding", () => {
    checkGeneratedHeadersResult(
      generateHeader({
        headers: new Headers(testHeadersWithEncoding),
      }),
      testHeadersWithEncoding,
      true,
    );
  });

  t.step(
    "omits content-length Header when parsing headers from Headers object",
    () => {
      checkGeneratedHeadersResult(
        generateHeader({
          headers: new Headers(testHeadersWithContentLength),
        }),
        testHeaders,
        false,
      );
    },
  );
});

Deno.test("Generate body param", (t) => {
  t.step("No Body", () => {
    assertEquals(generateBody(), "");
  });
  t.step("String Body", () => {
    assertEquals(generateBody("a"), " --data-binary 'a'");
  });

  t.step("Number Body", () => {
    assertEquals(generateBody(12345), " --data-binary '12345'");
  });

  t.step("Object Body", () => {
    const options = {
      test: "test:",
      testNumber: 12345,
      testDate: new Date(1609251707077),
      testQuotes: `'test'`,
    };
    assertEquals(
      generateBody(options),
      ` --data-binary '{"test":"test:","testNumber":12345,"testDate":"2020-12-29T14:21:47.077Z","testQuotes":"'\\''test'\\''"}'`,
    );
  });
});

Deno.test("Generate Compress param", (t) => {
  t.step("No compression", () => {
    assertEquals(generateCompress(), "");
  });

  t.step("Have compression", () => {
    assertEquals(generateCompress(true), " --compressed");
  });
});

Deno.test("fetchToCurl", (t) => {
  t.step("url string and empty options", () => {
    assertEquals(
      fetchToCurl("google.com", {}),
      "curl 'google.com'",
    );
  });

  t.step("url object and empty options", () => {
    assertEquals(
      fetchToCurl(new URL("https://google.com/"), {}),
      "curl 'https://google.com/'",
    );
  });

  t.step("url string and no options", () => {
    assertEquals(
      fetchToCurl("google.com"),
      "curl 'google.com'",
    );
  });

  t.step("url string and Request Object", () => {
    assertEquals(
      fetchToCurl("google.com", { method: "POST" }),
      "curl 'google.com' -X POST",
    );
  });
});
