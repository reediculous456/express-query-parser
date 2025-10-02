import express, { Request, Response } from 'express';
import request from 'supertest';
import { queryParser } from '../src/index';

describe(`queryParser middleware`, () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.set(`query parser`, `extended`);
  });

  describe(`basic middleware functionality`, () => {
    it(`should parse query parameters with all options enabled`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined&string=hello`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: true,
        nullValue: null,
        number: 123,
        string: `hello`,
        undefinedValue: undefined,
      });
    });

    it(`should not parse query parameters when all options are disabled`, async () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: `true`,
        nullValue: `null`,
        number: `123`,
        undefinedValue: `undefined`,
      });
    });

    it(`should call next() to continue middleware chain`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      let middlewareCalled = false;

      app.use(queryParser(options));
      app.use((req: Request, res: Response, next) => {
        middlewareCalled = true;
        next();
      });
      app.get(`/test`, (req: Request, res: Response) => {
        res.json({ middlewareCalled, query: req.query });
      });

      const response = await request(app)
        .get(`/test?test=123`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.middlewareCalled).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.query.test).toBe(123);
    });
  });

  describe(`selective parsing options`, () => {
    it(`should only parse numbers when parseNumber is enabled`, async () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: true, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&nullValue=null&string=hello`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: `true`,
        nullValue: `null`,
        number: 123,
        string: `hello`,
      });
    });

    it(`should only parse booleans when parseBoolean is enabled`, async () => {
      const options = { parseBoolean: true, parseNull: false, parseNumber: false, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&falseValue=false&nullValue=null`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: true,
        falseValue: false,
        nullValue: `null`,
        number: `123`,
      });
    });

    it(`should only parse null when parseNull is enabled`, async () => {
      const options = { parseBoolean: false, parseNull: true, parseNumber: false, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: `true`,
        nullValue: null,
        number: `123`,
        undefinedValue: `undefined`,
      });
    });

    it(`should only parse undefined when parseUndefined is enabled`, async () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined`)
        .expect(200);

      expect(response.body).toEqual({
        boolean: `true`,
        nullValue: `null`,
        number: `123`,
        undefinedValue: undefined,
      });
    });
  });

  describe(`array query parameters`, () => {
    it(`should parse array query parameters`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?numbers=1&numbers=2&numbers=3&booleans=true&booleans=false`)
        .expect(200);

      expect(response.body).toEqual({
        booleans: [ true, false ],
        numbers: [ 1, 2, 3 ],
      });
    });

    it(`should parse nested array structures`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?items=123&items=true&items=null&items=undefined&items=hello`)
        .expect(200);

      // Note: undefined values get serialized to null in JSON
      expect(response.body).toEqual({
        items: [ 123, true, null, null, `hello` ],
      });
    });
  });

  describe(`complex nested query parameters`, () => {
    it(`should handle object-like query parameters`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(express.urlencoded({ extended: true }));
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?user[name]=john&user[age]=25&user[active]=true&user[score]=null`)
        .expect(200);

      expect(response.body).toEqual({
        user: {
          active: true,
          age: 25,
          name: `john`,
          score: null,
        },
      });
    });

    it(`should handle deeply nested structures`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(express.urlencoded({ extended: true }));
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?data[level1][level2][number]=42&data[level1][level2][boolean]=true`)
        .expect(200);

      expect(response.body).toEqual({
        data: {
          level1: {
            level2: {
              boolean: true,
              number: 42,
            },
          },
        },
      });
    });
  });

  describe(`edge cases and error handling`, () => {
    it(`should handle empty query string`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it(`should handle query parameters with empty values`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?empty=&another=`)
        .expect(200);

      expect(response.body).toEqual({
        another: ``,
        empty: ``,
      });
    });

    it(`should handle special characters and encoding`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?message=hello%20world&symbol=%40%23%24`)
        .expect(200);

      expect(response.body).toEqual({
        message: `hello world`,
        symbol: `@#$`,
      });
    });

    it(`should work with different HTTP methods`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      app.use(queryParser(options));

      app.post(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      app.put(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      app.delete(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      // Test POST
      let response = await request(app)
        .post(`/test?number=123&boolean=true`)
        .expect(200);
      expect(response.body).toEqual({ boolean: true, number: 123 });

      // Test PUT
      response = await request(app)
        .put(`/test?number=456&boolean=false`)
        .expect(200);
      expect(response.body).toEqual({ boolean: false, number: 456 });

      // Test DELETE
      response = await request(app)
        .delete(`/test?number=789&boolean=true`)
        .expect(200);
      expect(response.body).toEqual({ boolean: true, number: 789 });
    });
  });

  describe(`middleware order and integration`, () => {
    it(`should work when placed before other middleware`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };

      app.use(queryParser(options));
      app.use((req: Request, res: Response, next) => {
        // Middleware that depends on parsed query
        if (typeof req.query.id === `number`) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (req.query as any).processedId = req.query.id * 2;
        }
        next();
      });
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?id=5`)
        .expect(200);

      expect(response.body).toEqual({
        id: 5,
        processedId: 10,
      });
    });

    it(`should work when placed after URL encoding middleware`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };

      app.use(express.urlencoded({ extended: true }));
      app.use(queryParser(options));
      app.get(`/test`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/test?user[id]=123&user[active]=true`)
        .expect(200);

      expect(response.body).toEqual({
        user: {
          id: 123,
          active: true,
        },
      });
    });
  });

  describe(`real-world usage scenarios`, () => {
    it(`should handle pagination parameters`, async () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: true, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/api/users`, (req: Request, res: Response) => {
        const { limit, offset, page } = req.query;
        res.json({ limit, offset, page, types: { limit: typeof limit, offset: typeof offset, page: typeof page } });
      });

      const response = await request(app)
        .get(`/api/users?page=2&limit=10&offset=20`)
        .expect(200);

      expect(response.body).toEqual({
        limit: 10,
        offset: 20,
        page: 2,
        types: { limit: `number`, offset: `number`, page: `number` },
      });
    });

    it(`should handle filtering parameters`, async () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/api/products`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/api/products?category=electronics&minPrice=100&maxPrice=500&inStock=true&discontinued=null`)
        .expect(200);

      expect(response.body).toEqual({
        category: `electronics`,
        discontinued: null,
        inStock: true,
        maxPrice: 500,
        minPrice: 100,
      });
    });

    it(`should handle search and sorting parameters`, async () => {
      const options = { parseBoolean: true, parseNull: false, parseNumber: false, parseUndefined: false };
      app.use(queryParser(options));
      app.get(`/api/search`, (req: Request, res: Response) => {
        res.json(req.query);
      });

      const response = await request(app)
        .get(`/api/search?q=laptop&sortBy=price&sortOrder=asc&includeOutOfStock=false`)
        .expect(200);

      expect(response.body).toEqual({
        includeOutOfStock: false,
        q: `laptop`,
        sortBy: `price`,
        sortOrder: `asc`,
      });
    });
  });
});
