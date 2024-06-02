# @viktor/fetch-to-curl

Generate curl requests with the inputs you would usually use for the JS fetch.

This is a fork of [this other project](https://github.com/leoek/fetch-to-curl).

The original was written in Javascript, had a manually maintained and outdated
types.ts and had a lot of tooling that i saw as overkill so i made a simpler
version that fits my needs.

This version uses Deno, but should be compatible with any modern JS runtime
since it contains 0 dependencies and is being distributed in JSR.

If you need something that works in old IE browsers, go for the other version.

Thanks to https://github.com/leoek for creating the original one.

## Installation

```sh
deno add @viktor/fetch-to-curl
```

or

```sh
npx jsr add @viktor/fetch-to-curl
```

## Usage

```ts
import { fetchToCurl } from 'jsr:@viktor/fetch-to-curl';

const url = 'https://jsonplaceholder.typicode.com/posts/1';
const options = {
  headers: {
    Authorization: "BASIC SOMEBASE64STRING"
  },
  method: 'get'
};
// Log your request
console.log(fetchToCurl(url, options));
// Do your request
fetch(url, options);

// Output
curl "https://jsonplaceholder.typicode.com/posts/1" -X GET -H "Authorization: BASIC SOMEBASE64STRING"

// fetchToCurl arguments should always match the fetch standard parameters.
```
