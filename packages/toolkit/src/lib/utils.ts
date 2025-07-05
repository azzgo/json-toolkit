import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {Content, JSONContent, TextContent} from "vanilla-jsoneditor";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJSON(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("Invalid JSON", error);
    return null;
  }
}

export const getEditorContentJson = (content: Content): unknown | undefined => {
  let schema;
  if ((content as JSONContent).json) {
    schema = (content as JSONContent).json;
  } else if ((content as TextContent).text) {
    schema = parseJSON((content as TextContent).text);
  }
  return schema;
}

export const convertDiffResultToJSONPathMap = (jsonResult: Record<string, any>) => {
  const leftDiffResultMap = new Map<string, 'add' | 'delete' | 'update'>();
  const rightDiffResultMap = new Map<string, 'add' | 'delete' | 'update'>();

  const walk = (obj: Record<string, any>, path: string[] = []) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.endsWith('__added')) {
        const jsonPath = [...path, key.replace(/__added$/, '')].filter(Boolean).join('.');
        rightDiffResultMap.set(jsonPath, 'add');
      } else if (key.endsWith('__deleted')) {
        const jsonPath = [...path, key.replace(/__deleted$/, '')].filter(Boolean).join('.');
        leftDiffResultMap.set(jsonPath, 'delete');
      } else if (Array.isArray(value)) {
        let leftIndex = 0;
        let rightIndex = 0;
        for (let entry of value) {
          if (Array.isArray(entry)) {
            const [op] = entry;
            if (op === '-') {
              const jsonPath = [...path, key, leftIndex.toString()].join('.');
              leftIndex++;
              leftDiffResultMap.set(jsonPath, 'delete');
            } else if (op === '+') {
              const jsonPath = [...path, key, rightIndex.toString()].join('.');
              rightIndex++;
              rightDiffResultMap.set(jsonPath, 'add');
            } else if (op === '~') {
              walk(entry[1], [...path, key, leftIndex.toString()]);
              leftIndex++;
              rightIndex++;
            } else {
              leftIndex++;
              rightIndex++;
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (value.__new && value.__old) {
          const jsonLeftPath = [...path, key].filter(Boolean).join('.');
          const jsonRightPath = [...path, key].filter(Boolean).join('.');
          leftDiffResultMap.set(jsonLeftPath, 'update');
          rightDiffResultMap.set(jsonRightPath, 'update');
        } else {
          walk(value, [...path, key]);
        }
      }
    }
  };

  walk(jsonResult);
  return [leftDiffResultMap, rightDiffResultMap];
}
