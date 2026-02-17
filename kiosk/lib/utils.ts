import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * ClassName Utility.
 * Merges Tailwind classes conditionally using clsx and tailwind-merge.
 * Resolves conflicts between Tailwind utility classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
