import { z } from "zod";

export function handleApi<
  T extends { url: string; input: z.ZodObject<any>; output: z.ZodObject<any> }
>(apiSchema: T) {
  return async (input: T["input"]["_type"]): Promise<T["output"]["_type"]> => {
    const response = await fetch(
      `https://${process.env.API_STAGE}.rhythia.com${apiSchema.url}`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    const output = await response.json();
    return output;
  };
}
