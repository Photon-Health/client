import { differenceInHours, isToday, parse } from 'date-fns';
import { Struct, is, define, refine, string, any } from 'superstruct';

export const message = <T>(struct: Struct<T, any>, message: string): Struct<T, any> =>
  define('message', (value) => (is(value, struct) ? true : message));

export const between = (min: number, max: number, inclusive = true) =>
  define('between', function isBetween(value) {
    return (
      typeof value === 'number' &&
      (inclusive ? value >= min && value <= max : value > min && value < max)
    );
  });

export const notFutureDate = define('NotFutureDate', (value) => {
  const valueDate = new Date(value as string);
  if (!(valueDate instanceof Date)) return false;

  const now = new Date();
  return valueDate <= now;
});

export const afterDate = (date: Date, parser = (v: string) => parse(v, 'yyyy-MM-dd', new Date())) =>
  define('between', function isAfter(value) {
    return (
      differenceInHours(parser(value as string), date) >= 0 || isToday(parser(value as string))
    );
  });

export const numericString = () =>
  refine(string(), 'numericString', (value) => {
    if (value.length === 0) {
      return true;
    }
    return /^\d+$/.test(value as string);
  });

export const zipString = () =>
  refine(string(), 'zipString', (value) => {
    return /^\d{5}(-\d{4})?$/.test(value as string);
  });

export const email = () =>
  refine(string(), 'email', (value) => {
    if (value.length === 0) {
      return true;
    }
    //eslint-disable-next-line
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      value as string
    );
  });

export const empty = () =>
  refine(any(), 'empty', (value) => {
    if (value === null || value == undefined) {
      return true;
    }
    return false;
  });
