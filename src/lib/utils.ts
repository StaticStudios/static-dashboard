import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {useAuth} from "@clerk/vue";
import {watch} from "vue";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The vue router navigation guard runs immediately on page load
 * so we need to wait for Clerk.js to load before we can check
 * if the user is signed in.
 */
export async function waitForClerkJsLoaded() {
    return new Promise<void>(resolve => {
        watch(useAuth().isLoaded, value => {
            if (value) {
                resolve();
            }
        });
    });
}

