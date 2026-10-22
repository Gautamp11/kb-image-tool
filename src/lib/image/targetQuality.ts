import { MAX_QUALITY, MIN_QUALITY, TARGET_SEARCH_ITERATIONS } from "./constants";

export type QualitySearchProgress = {
  iteration: number;
  maxIterations: number;
  quality: number;
  bytes: number;
};

export type QualitySearchResult<T> = {
  value: T;
  quality: number;
  bytes: number;
  metTarget: boolean;
  smallestBytes: number;
  attempts: number;
};

type SearchOptions<T> = {
  targetBytes: number;
  encode: (quality: number) => Promise<{ value: T; bytes: number }>;
  minQuality?: number;
  maxQuality?: number;
  maxIterations?: number;
  onProgress?: (progress: QualitySearchProgress) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Processing was cancelled.", "AbortError");
  }
}

/**
 * Finds the highest encoder quality whose payload is still at or under the
 * target byte size. If even the lowest quality exceeds the target, returns
 * that smallest result with metTarget = false.
 */
export async function searchQualityForTarget<T>(
  options: SearchOptions<T>,
): Promise<QualitySearchResult<T>> {
  const minQuality = options.minQuality ?? MIN_QUALITY;
  const maxQuality = options.maxQuality ?? MAX_QUALITY;
  const maxIterations = options.maxIterations ?? TARGET_SEARCH_ITERATIONS;
  const { targetBytes, encode } = options;

  if (!(targetBytes > 0)) {
    throw new Error("Target size must be greater than 0 KB.");
  }

  throwIfAborted(options.signal);
  const high = await encode(maxQuality);
  options.onProgress?.({
    iteration: 1,
    maxIterations: maxIterations + 2,
    quality: maxQuality,
    bytes: high.bytes,
  });

  if (high.bytes <= targetBytes) {
    return {
      value: high.value,
      quality: maxQuality,
      bytes: high.bytes,
      metTarget: true,
      smallestBytes: high.bytes,
      attempts: 1,
    };
  }

  throwIfAborted(options.signal);
  const low = await encode(minQuality);
  options.onProgress?.({
    iteration: 2,
    maxIterations: maxIterations + 2,
    quality: minQuality,
    bytes: low.bytes,
  });

  if (low.bytes > targetBytes) {
    return {
      value: low.value,
      quality: minQuality,
      bytes: low.bytes,
      metTarget: false,
      smallestBytes: low.bytes,
      attempts: 2,
    };
  }

  let lo = minQuality;
  let hi = maxQuality;
  let best = low;
  let bestQuality = minQuality;
  let attempts = 2;
  let smallestBytes = Math.min(high.bytes, low.bytes);

  for (let i = 0; i < maxIterations; i += 1) {
    throwIfAborted(options.signal);
    const mid = (lo + hi) / 2;
    const encoded = await encode(mid);
    attempts += 1;
    smallestBytes = Math.min(smallestBytes, encoded.bytes);
    options.onProgress?.({
      iteration: attempts,
      maxIterations: maxIterations + 2,
      quality: mid,
      bytes: encoded.bytes,
    });

    if (encoded.bytes <= targetBytes) {
      best = encoded;
      bestQuality = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return {
    value: best.value,
    quality: bestQuality,
    bytes: best.bytes,
    metTarget: best.bytes <= targetBytes,
    smallestBytes,
    attempts,
  };
}
