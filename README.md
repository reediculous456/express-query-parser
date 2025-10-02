# express-query-parser2

[![npm version](https://badge.fury.io/js/express-query-parser2.svg)](https://www.npmjs.com/package/express-query-parser2)

A parser helps you parse request for your express server. You may usually encounter some ```req.query``` issues like parsing ```'null'```, ```'true'``` and any numbered string. This parser covert them to the right type.

- Forked from [express-query-parser](https://www.npmjs.com/package/express-query-parser) and added support for express v5

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

## Features

- Parse your query for null / boolean / undefined
- Support nested query
- Support array
- Support numbered string convert

### Installing

You can install via Yarn or npm

```bash
yarn add express-query-parser2
```

```bash
npm install express-query-parser2
```

## Usage

```js
import { queryParser } from 'express-query-parser2'
import express from 'express'

const app = express()

app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true
  })
)
```

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
