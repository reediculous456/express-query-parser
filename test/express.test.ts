import express, { Request, Response } from 'express'
import request from 'supertest'
import { queryParser } from '../src/index'

describe('queryParser middleware', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
  })

  describe('basic middleware functionality', () => {
    it('should parse query parameters with all options enabled', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined&string=hello')
        .expect(200)

      expect(response.body).toEqual({
        number: 123,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        string: 'hello'
      })
    })

    it('should not parse query parameters when all options are disabled', async () => {
      const options = { parseNull: false, parseUndefined: false, parseBoolean: false, parseNumber: false }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined')
        .expect(200)

      expect(response.body).toEqual({
        number: '123',
        boolean: 'true',
        nullValue: 'null',
        undefinedValue: 'undefined'
      })
    })

    it('should call next() to continue middleware chain', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      let middlewareCalled = false

      app.use(queryParser(options))
      app.use((req: Request, res: Response, next) => {
        middlewareCalled = true
        next()
      })
      app.get('/test', (req: Request, res: Response) => {
        res.json({ middlewareCalled, query: req.query })
      })

      const response = await request(app)
        .get('/test?test=123')
        .expect(200)

      expect(response.body.middlewareCalled).toBe(true)
      expect(response.body.query.test).toBe(123)
    })
  })

  describe('selective parsing options', () => {
    it('should only parse numbers when parseNumber is enabled', async () => {
      const options = { parseNull: false, parseUndefined: false, parseBoolean: false, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&nullValue=null&string=hello')
        .expect(200)

      expect(response.body).toEqual({
        number: 123,
        boolean: 'true',
        nullValue: 'null',
        string: 'hello'
      })
    })

    it('should only parse booleans when parseBoolean is enabled', async () => {
      const options = { parseNull: false, parseUndefined: false, parseBoolean: true, parseNumber: false }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&falseValue=false&nullValue=null')
        .expect(200)

      expect(response.body).toEqual({
        number: '123',
        boolean: true,
        falseValue: false,
        nullValue: 'null'
      })
    })

    it('should only parse null when parseNull is enabled', async () => {
      const options = { parseNull: true, parseUndefined: false, parseBoolean: false, parseNumber: false }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined')
        .expect(200)

      expect(response.body).toEqual({
        number: '123',
        boolean: 'true',
        nullValue: null,
        undefinedValue: 'undefined'
      })
    })

    it('should only parse undefined when parseUndefined is enabled', async () => {
      const options = { parseNull: false, parseUndefined: true, parseBoolean: false, parseNumber: false }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?number=123&boolean=true&nullValue=null&undefinedValue=undefined')
        .expect(200)

      expect(response.body).toEqual({
        number: '123',
        boolean: 'true',
        nullValue: 'null',
        undefinedValue: undefined
      })
    })
  })

  describe('array query parameters', () => {
    it('should parse array query parameters', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?numbers=1&numbers=2&numbers=3&booleans=true&booleans=false')
        .expect(200)

      expect(response.body).toEqual({
        numbers: [1, 2, 3],
        booleans: [true, false]
      })
    })

    it('should parse nested array structures', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?items=123&items=true&items=null&items=undefined&items=hello')
        .expect(200)

      // Note: undefined values get serialized to null in JSON
      expect(response.body).toEqual({
        items: [123, true, null, null, 'hello']
      })
    })
  })

  describe('complex nested query parameters', () => {
    it('should handle object-like query parameters', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(express.urlencoded({ extended: true }))
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?user[name]=john&user[age]=25&user[active]=true&user[score]=null')
        .expect(200)

      expect(response.body).toEqual({
        user: {
          name: 'john',
          age: 25,
          active: true,
          score: null
        }
      })
    })

    it('should handle deeply nested structures', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(express.urlencoded({ extended: true }))
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?data[level1][level2][number]=42&data[level1][level2][boolean]=true')
        .expect(200)

      expect(response.body).toEqual({
        data: {
          level1: {
            level2: {
              number: 42,
              boolean: true
            }
          }
        }
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty query string', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test')
        .expect(200)

      expect(response.body).toEqual({})
    })

    it('should handle query parameters with empty values', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?empty=&another=')
        .expect(200)

      expect(response.body).toEqual({
        empty: '',
        another: ''
      })
    })

    it('should handle special characters and encoding', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?message=hello%20world&symbol=%40%23%24')
        .expect(200)

      expect(response.body).toEqual({
        message: 'hello world',
        symbol: '@#$'
      })
    })

    it('should work with different HTTP methods', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))

      app.post('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      app.put('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      app.delete('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      // Test POST
      let response = await request(app)
        .post('/test?number=123&boolean=true')
        .expect(200)
      expect(response.body).toEqual({ number: 123, boolean: true })

      // Test PUT
      response = await request(app)
        .put('/test?number=456&boolean=false')
        .expect(200)
      expect(response.body).toEqual({ number: 456, boolean: false })

      // Test DELETE
      response = await request(app)
        .delete('/test?number=789&boolean=true')
        .expect(200)
      expect(response.body).toEqual({ number: 789, boolean: true })
    })
  })

  describe('middleware order and integration', () => {
    it('should work when placed before other middleware', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }

      app.use(queryParser(options))
      app.use((req: Request, res: Response, next) => {
        // Middleware that depends on parsed query
        if (typeof req.query.id === 'number') {
          (req.query as any).processedId = req.query.id * 2
        }
        next()
      })
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?id=5')
        .expect(200)

      expect(response.body).toEqual({
        id: 5,
        processedId: 10
      })
    })

    it('should work when placed after URL encoding middleware', async () => {
      const options = { parseNull: true, parseUndefined: true, parseBoolean: true, parseNumber: true }

      app.use(express.urlencoded({ extended: true }))
      app.use(queryParser(options))
      app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/test?user[id]=123&user[active]=true')
        .expect(200)

      expect(response.body).toEqual({
        user: {
          id: 123,
          active: true
        }
      })
    })
  })

  describe('real-world usage scenarios', () => {
    it('should handle pagination parameters', async () => {
      const options = { parseNull: false, parseUndefined: false, parseBoolean: false, parseNumber: true }
      app.use(queryParser(options))
      app.get('/api/users', (req: Request, res: Response) => {
        const { page, limit, offset } = req.query
        res.json({ page, limit, offset, types: { page: typeof page, limit: typeof limit, offset: typeof offset } })
      })

      const response = await request(app)
        .get('/api/users?page=2&limit=10&offset=20')
        .expect(200)

      expect(response.body).toEqual({
        page: 2,
        limit: 10,
        offset: 20,
        types: { page: 'number', limit: 'number', offset: 'number' }
      })
    })

    it('should handle filtering parameters', async () => {
      const options = { parseNull: true, parseUndefined: false, parseBoolean: true, parseNumber: true }
      app.use(queryParser(options))
      app.get('/api/products', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/api/products?category=electronics&minPrice=100&maxPrice=500&inStock=true&discontinued=null')
        .expect(200)

      expect(response.body).toEqual({
        category: 'electronics',
        minPrice: 100,
        maxPrice: 500,
        inStock: true,
        discontinued: null
      })
    })

    it('should handle search and sorting parameters', async () => {
      const options = { parseNull: false, parseUndefined: false, parseBoolean: true, parseNumber: false }
      app.use(queryParser(options))
      app.get('/api/search', (req: Request, res: Response) => {
        res.json(req.query)
      })

      const response = await request(app)
        .get('/api/search?q=laptop&sortBy=price&sortOrder=asc&includeOutOfStock=false')
        .expect(200)

      expect(response.body).toEqual({
        q: 'laptop',
        sortBy: 'price',
        sortOrder: 'asc',
        includeOutOfStock: false
      })
    })
  })
})
