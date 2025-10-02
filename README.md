# express-query-parser2

[![npm version](https://badge.fury.io/js/express-query-parser2.svg)](https://www.npmjs.com/package/express-query-parser2)

A parser helps you parse request for your express server. You may usually encounter some ```req.query``` issues like parsing ```'null'```, ```'true'``` and any numbered string. This parser converts them to the right type.

- Forked from [express-query-parser](https://www.npmjs.com/package/express-query-parser)
- ✅ **Full Express v5 compatibility** - Works seamlessly with both Express v4 and v5
- ✅ **TypeScript support** - Written in TypeScript with full type definitions
- ✅ **Zero breaking changes** - Drop-in replacement for the original package

## Scenarios

### Query with Object

```js
// GET http://localhost/?a=null&b=true&c[d]=false&c[e]=3.14

// without this parser
req.query = {a: 'null', b: 'true', c: {d: 'false', e: '3.14'}}

// with this parser
req.query = {a: null, b: true, c: {d: false, e: 3.14}}
```

### Query with Array

```js
// GET http://localhost/?a[]=null&a[]=false

// without this parser
req.query = {a: ['null', 'false']}

// with this parser
req.query = {a: [null, false]}
```

## Express v5 Compatibility

This package is fully compatible with both Express v4 and Express v5. It automatically detects the Express version and uses the appropriate method to parse query parameters:

- **Express v4**: Direct assignment to `req.query`
- **Express v5**: Property descriptor override (respects Express v5's read-only `req.query`)

## Features

- Parse your query for null / boolean / undefined
- Support nested query
- Support array
- Support numbered string convert
- Full Express v4 and v5 compatibility
- TypeScript support with full type definitions

### Installing

You can install via Yarn or npm

```bash
yarn add express-query-parser2
```

```bash
npm install express-query-parser2
```

### Supported Versions

- **Express**: v4.17.1+ and v5.0.0+
- **Node.js**: v14+ (follows Express requirements)
- **TypeScript**: v4.0+ (optional, includes full type definitions)

## Usage

### ES6/TypeScript

```js
import { queryParser } from 'express-query-parser2'
import express from 'express'

const app = express()

// For nested object support (user[name]=john -> {user: {name: 'john'}})
// Set query parser to 'extended' before using the middleware
app.set('query parser', 'extended')

app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true
  })
)
```

### CommonJS

```js
const { queryParser } = require('express-query-parser2')
const express = require('express')

const app = express()

// For nested object support
app.set('query parser', 'extended')

app.use(queryParser())
```

### Important: Nested Object Support

To parse nested query parameters like `user[name]=john` into `{user: {name: 'john'}}`, you must configure Express to use the extended query parser:

```js
app.set('query parser', 'extended')
```

Without this setting, Express uses the simple query parser which keeps bracket notation as literal keys: `{'user[name]': 'john'}`.

## Config Options

| field | desc | type | default |
|---|---|---|---|
| parseNull  | convert all ```"null"``` to ```null``` | ```boolean```  | ```true``` |
| parseUndefined  | convert all ```"undefined"``` to ```undefined``` | ```boolean```  | ```true``` |
| parseBoolean  | convert all ```"true"``` to ```true``` and ```"false"``` to ```false``` | ```boolean```  | ```true``` |
| parseNumber  | convert all numbered string to int and float | ```boolean```  | ```true``` |

---

## Local Development and Contributing

I am more than happy to accept PRs for bugs, improvements or new features.
Developing your own changes locally is easy, you just need to clone the repo

```bash
git clone git@github.com/reediculous456/express-query-parser.git
```

Then navigate to the project folder

```bash

cd express-query-parser
```

and install the dependencies with either `npm` or `yarn`

```bash
npm i
```

```bash
yarn
```

Tests can be ran with the `test` script

```bash
npm run test
```

```bash
yarn test
```
