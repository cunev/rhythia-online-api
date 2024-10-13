import { z } from "zod";
let env = "development";
import { profanity, CensorType } from "@2toad/profanity";
export function setEnvironment(
  stage: "development" | "testing" | "production"
) {
  env = stage;
}
export function handleApi<
  T extends { url: string; input: z.ZodObject<any>; output: z.ZodObject<any> }
>(apiSchema: T) {
  return async (input: T["input"]["_type"]): Promise<T["output"]["_type"]> => {
    const response = await fetch(`https://${env}.rhythia.com${apiSchema.url}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    const output = await response.text();
    return JSON.parse(profanity.censor(output));
  };
}
