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
