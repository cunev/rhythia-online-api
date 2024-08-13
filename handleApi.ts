import { z } from "zod";

export function handleApi<
  T extends { url: string; input: z.ZodObject<any>; output: z.ZodObject<any> }
>(apiSchema: T) {
  return async (input: T["input"]["_type"]): Promise<T["output"]["_type"]> => {
    const response = await fetch(`https://test.com${apiSchema.url}`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const output = await response.json();
    return output;
  };
}
