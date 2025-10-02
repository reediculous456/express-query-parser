import { NextFunction, Request, Response } from 'express';

interface Options {
  parseBoolean?: boolean;
  parseNull?: boolean;
  parseNumber?: boolean;
  parseUndefined?: boolean;
}

export const parse = (target: any, options: Options): any => {
  switch (typeof (target)) {
    case `string`:
      if (target === ``) {
        return ``;
      } else if (options.parseNull && target === `null`) {
        return null;
      } else if (options.parseUndefined && target === `undefined`) {
        return undefined;
      } else if (options.parseBoolean && (target === `true` || target === `false`)) {
        return target === `true`;
      } else if (options.parseNumber && !isNaN(Number(target))) {
        return Number(target);
      }
      return target;

    case `object`: {
      if (Array.isArray(target)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return target.map((x) => parse(x, options));
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const obj = target;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.keys(obj).map((key) =>
      // eslint-disable-next-line @stylistic/max-len
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        obj[key] = parse(target[key], options));
      return obj;
    }

    default:
      return target;
  }
};

const defaultOptions: Options = {
  parseBoolean: true,
  parseNull: true,
  parseNumber: true,
  parseUndefined: true,
};

// Helper function to check if we can directly assign to req.query
const canAssignDirectly = (req: Request): boolean => {
  const descriptor = Object.getOwnPropertyDescriptor(req, `query`);

  // If there's no descriptor, the property might be inherited but writable
  if (!descriptor) {
    return true;
  }

  // If the property is writable and configurable, we can assign to it
  return descriptor.writable === true && descriptor.configurable !== false;
};

// Helper function to check if we can override the query property
const canOverrideProperty = (req: Request): boolean => {
  const descriptor = Object.getOwnPropertyDescriptor(req, `query`);

  // If there's no descriptor, the property might be inherited and we can likely define it
  if (!descriptor) {
    return true;
  }

  // If the property exists and is configurable, we can override it
  return descriptor.configurable === true;
};

export const queryParser = (options: Options = defaultOptions) => (req: Request, res: Response, next: NextFunction) => {
  const originalQuery = req.query;

  // Parse the query - if this fails, we don't modify anything
  let parsedQuery: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    parsedQuery = parse(originalQuery, options);
  } catch (error) {
    // If parsing fails, log the error and continue without modification
    // eslint-disable-next-line no-console
    console.warn(`express-query-parser: Failed to parse query parameters:`, error);
    next();
    return;
  }

  // Strategy 1: Try direct assignment (Express v4)
  if (canAssignDirectly(req)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.query = parsedQuery;
      next();
      return;
    } catch {
      // If direct assignment fails silently, continue to next strategy
    }
  }

  // Strategy 2: Override the property getter (Express v5)
  if (canOverrideProperty(req)) {
    try {
      Object.defineProperty(req, `query`, {
        configurable: true,
        enumerable: true,
        get() {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return parsedQuery;
        },
      });
      next();
      return;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`express-query-parser: Failed to override query property:`, error);
    }
  }

  // Strategy 3: Fallback - warn and continue without modification
  // eslint-disable-next-line no-console
  console.warn(
    `express-query-parser: Unable to modify req.query in this Express version. ` +
    `Query parameters will not be parsed.`,
  );
  next();
};
