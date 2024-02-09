export interface AbortObject<T> {
  promise: Promise<T>,
  abort: () => void
}

export class AbortError extends Error {
  constructor(message = "The promise has been aborted.") {
    super(message);
  }
}

/**
 * Abort the results of a promise. Action will still continue to run.
 * @param promise The raw promise to pass in.
 */
export function abortablePromise<T>(promise: Promise<T>): AbortObject<T> {
  let resolvable = true;
  let abort: () => void = () => {
  };
  const outerPromise = new Promise<T>(async (resolve, reject) => {
    abort = function () {
      resolvable = false;
      reject(new AbortError());
    }
    const res = await promise;
    if (resolvable) {
      resolve(res);
    }
  });
  return {
    abort,
    promise: outerPromise,
  };
}
