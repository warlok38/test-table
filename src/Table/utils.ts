import type { FormValuesType } from "./types";

export function areObjectsEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
) {
  const sortedObj1 = JSON.stringify(obj1, Object.keys(obj1).sort());
  const sortedObj2 = JSON.stringify(obj2, Object.keys(obj2).sort());
  return sortedObj1 === sortedObj2;
}

export function fakeApi(payload: FormValuesType): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(payload);
      resolve();
    }, 0);
  });
}

export function decline(count: number, [one, few, many]: string[]) {
  if (few === "") {
    if (count === 1) {
      return one;
    }
    return many;
  }

  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n1 < 20) {
    return many;
  }
  if (n1 > 1 && n1 < 5) {
    return few;
  }
  if (n1 === 1) {
    return one;
  }
  return many;
}
