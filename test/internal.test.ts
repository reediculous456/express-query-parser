/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { parse } from '../src/index';

describe(`parse function`, () => {
  describe(`string parsing`, () => {
    it(`should return empty string as-is`, () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
      expect(parse(``, options)).toBe(``);
    });

    it(`should return regular strings as-is when no parsing options are enabled`, () => {
      const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
      expect(parse(`hello`, options)).toBe(`hello`);
      expect(parse(`world`, options)).toBe(`world`);
      expect(parse(`123abc`, options)).toBe(`123abc`);
    });

    describe(`null parsing`, () => {
      it(`should parse "null" string to null when parseNull is enabled`, () => {
        const options = { parseBoolean: false, parseNull: true, parseNumber: false, parseUndefined: false };
        expect(parse(`null`, options)).toBe(null);
      });

      it(`should not parse "null" string when parseNull is disabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`null`, options)).toBe(`null`);
      });

      it(`should not parse "NULL" or other variations`, () => {
        const options = { parseBoolean: false, parseNull: true, parseNumber: false, parseUndefined: false };
        expect(parse(`NULL`, options)).toBe(`NULL`);
        expect(parse(`Null`, options)).toBe(`Null`);
        expect(parse(` null`, options)).toBe(` null`);
        expect(parse(`null `, options)).toBe(`null `);
      });
    });

    describe(`undefined parsing`, () => {
      it(`should parse "undefined" string to undefined when parseUndefined is enabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: true };
        expect(parse(`undefined`, options)).toBe(undefined);
      });

      it(`should not parse "undefined" string when parseUndefined is disabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`undefined`, options)).toBe(`undefined`);
      });

      it(`should not parse "UNDEFINED" or other variations`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: true };
        expect(parse(`UNDEFINED`, options)).toBe(`UNDEFINED`);
        expect(parse(`Undefined`, options)).toBe(`Undefined`);
        expect(parse(` undefined`, options)).toBe(` undefined`);
        expect(parse(`undefined `, options)).toBe(`undefined `);
      });
    });

    describe(`boolean parsing`, () => {
      it(`should parse "true" and "false" strings to booleans when parseBoolean is enabled`, () => {
        const options = { parseBoolean: true, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`true`, options)).toBe(true);
        expect(parse(`false`, options)).toBe(false);
      });

      it(`should not parse boolean strings when parseBoolean is disabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`true`, options)).toBe(`true`);
        expect(parse(`false`, options)).toBe(`false`);
      });

      it(`should not parse "TRUE", "FALSE" or other variations`, () => {
        const options = { parseBoolean: true, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`TRUE`, options)).toBe(`TRUE`);
        expect(parse(`False`, options)).toBe(`False`);
        expect(parse(` true`, options)).toBe(` true`);
        expect(parse(`false `, options)).toBe(`false `);
      });
    });

    describe(`number parsing`, () => {
      it(`should parse valid number strings to numbers when parseNumber is enabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: true, parseUndefined: false };
        expect(parse(`123`, options)).toBe(123);
        expect(parse(`0`, options)).toBe(0);
        expect(parse(`-123`, options)).toBe(-123);
        expect(parse(`123.45`, options)).toBe(123.45);
        expect(parse(`-123.45`, options)).toBe(-123.45);
        expect(parse(`0.123`, options)).toBe(0.123);
      });

      it(`should not parse number strings when parseNumber is disabled`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: false, parseUndefined: false };
        expect(parse(`123`, options)).toBe(`123`);
        expect(parse(`123.45`, options)).toBe(`123.45`);
      });

      it(`should not parse invalid number strings`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: true, parseUndefined: false };
        expect(parse(`123abc`, options)).toBe(`123abc`);
        expect(parse(`abc123`, options)).toBe(`abc123`);
        expect(parse(`12.34.56`, options)).toBe(`12.34.56`);
        expect(parse(``, options)).toBe(``);
        // Note: ' 123' and '123 ' actually parse as valid numbers in JavaScript
        expect(parse(` 123`, options)).toBe(123);
        expect(parse(`123 `, options)).toBe(123);
      });

      it(`should handle edge cases for numbers`, () => {
        const options = { parseBoolean: false, parseNull: false, parseNumber: true, parseUndefined: false };
        expect(parse(`Infinity`, options)).toBe(Infinity);
        expect(parse(`-Infinity`, options)).toBe(-Infinity);
        // Note: 'NaN' string doesn't parse to NaN because isNaN(Number('NaN')) is true
        expect(parse(`NaN`, options)).toBe(`NaN`);
      });
    });

    describe(`combined parsing options`, () => {
      it(`should apply multiple parsing options correctly`, () => {
        const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
        expect(parse(`null`, options)).toBe(null);
        expect(parse(`undefined`, options)).toBe(undefined);
        expect(parse(`true`, options)).toBe(true);
        expect(parse(`false`, options)).toBe(false);
        expect(parse(`123`, options)).toBe(123);
        expect(parse(`123.45`, options)).toBe(123.45);
        expect(parse(`hello`, options)).toBe(`hello`);
      });

      it(`should prioritize parsing in the correct order`, () => {
        const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
        // Test that null takes precedence over number parsing
        expect(parse(`null`, options)).toBe(null);
        // Test that undefined takes precedence over number parsing
        expect(parse(`undefined`, options)).toBe(undefined);
        // Test that boolean takes precedence over number parsing
        expect(parse(`true`, options)).toBe(true);
        expect(parse(`false`, options)).toBe(false);
      });
    });
  });

  describe(`array parsing`, () => {
    it(`should recursively parse array elements`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = [ `123`, `true`, `null`, `undefined`, `hello` ];
      const expected = [ 123, true, null, undefined, `hello` ];
      expect(parse(input, options)).toEqual(expected);
    });

    it(`should handle nested arrays`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = [[ `123`, `true` ], [ `null`, `false` ]];
      const expected = [[ 123, true ], [ null, false ]];
      expect(parse(input, options)).toEqual(expected);
    });

    it(`should handle empty arrays`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      expect(parse([], options)).toEqual([]);
    });

    it(`should handle arrays with mixed types`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = [ `123`, 456, true, `false`, `null` ];
      const expected = [ 123, 456, true, false, null ];
      expect(parse(input, options)).toEqual(expected);
    });
  });

  describe(`object parsing`, () => {
    it(`should recursively parse object values`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = {
        boolean: `true`,
        nullValue: `null`,
        number: `123`,
        string: `hello`,
        undefinedValue: `undefined`,
      };
      const expected = {
        boolean: true,
        nullValue: null,
        number: 123,
        string: `hello`,
        undefinedValue: undefined,
      };
      expect(parse(input, options)).toEqual(expected);
    });

    it(`should handle nested objects`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = {
        level1: {
          level2: {
            boolean: `false`,
            number: `456`,
          },
        },
      };
      const expected = {
        level1: {
          level2: {
            boolean: false,
            number: 456,
          },
        },
      };
      expect(parse(input, options)).toEqual(expected);
    });

    it(`should handle objects with array values`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = {
        booleans: [ `true`, `false` ],
        numbers: [ `1`, `2`, `3` ],
      };
      const expected = {
        booleans: [ true, false ],
        numbers: [ 1, 2, 3 ],
      };
      expect(parse(input, options)).toEqual(expected);
    });

    it(`should handle empty objects`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      expect(parse({}, options)).toEqual({});
    });
  });

  describe(`non-string, non-object types`, () => {
    it(`should return numbers as-is`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      expect(parse(123, options)).toBe(123);
      expect(parse(123.45, options)).toBe(123.45);
      expect(parse(0, options)).toBe(0);
      expect(parse(-123, options)).toBe(-123);
    });

    it(`should return booleans as-is`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      expect(parse(true, options)).toBe(true);
      expect(parse(false, options)).toBe(false);
    });

    it(`should handle null and undefined correctly (null errors, undefined returns as-is)`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      // null has typeof 'object' so it tries Object.keys(null) which throws
      expect(() => parse(null, options)).toThrow();
      // undefined has typeof 'undefined' so it goes to default case and returns as-is
      expect(parse(undefined, options)).toBe(undefined);
    });

    it(`should return functions as-is`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const func = () => `test`;
      expect(parse(func, options)).toBe(func);
    });

    it(`should return symbols as-is`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const sym = Symbol(`test`);
      expect(parse(sym, options)).toBe(sym);
    });
  });

  describe(`edge cases and mutations`, () => {
    it(`should mutate the original object`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = { boolean: `true`, number: `123` };
      const result = parse(input, options);

      // The function mutates the original object
      expect(input).toBe(result);
      expect(input.number).toBe(123);
      expect(input.boolean).toBe(true);
    });

    it(`should not mutate arrays (creates new array)`, () => {
      const options = { parseBoolean: true, parseNull: true, parseNumber: true, parseUndefined: true };
      const input = [ `123`, `true` ];
      const result = parse(input, options);

      // Arrays are mapped to new arrays
      expect(input).not.toBe(result);
      expect(input).toEqual([ `123`, `true` ]); // Original unchanged
      expect(result).toEqual([ 123, true ]); // New array with parsed values
    });
  });
});
