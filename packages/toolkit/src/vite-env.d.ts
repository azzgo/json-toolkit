/// <reference types="vite/client" />

declare module "markdown-it" {
  export default function markdownit(options?: any): any;
}

declare module 'json-diff' {
  export function diff(a: any, b: any): Record<string, any>;
  export function diffString(a: any, b: any): string;
}
