/**
 * Shared horizontal layout tokens so header, full-width pages, and footer align.
 * Narrow views (search, query detail) center within the same horizontal gutters.
 */
export const LAYOUT_OUTER = "mx-auto max-w-6xl px-4 sm:px-6";

/** Narrow reading column; pair with LAYOUT_HORIZONTAL_PAD on an ancestor when needed. */
export const LAYOUT_NARROW = "mx-auto w-full max-w-3xl";

/** Same horizontal padding as LAYOUT_OUTER (use when the max-width wrapper is a child). */
export const LAYOUT_HORIZONTAL_PAD = "px-4 sm:px-6";
