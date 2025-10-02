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

export const queryParser = (options: Options = defaultOptions) => (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  req.query = parse(req.query, options);
  next();
};
