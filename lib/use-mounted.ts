"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true setelah komponen berjalan di browser — mencegah hydration mismatch untuk data localStorage. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
