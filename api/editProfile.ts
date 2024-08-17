import z from "zod";

export const Schema = {
  input: z.object({
    name: z.string(),
    age: z.number(),
  }),
  output: z.object({
    uid: z.string(),
  }),
};

export async function GET(
  res: Response
): Promise<(typeof Schema)["output"]["_type"]> {
  const toParse = await res.json();
  const data = Schema.input.parse(toParse);

  return {
    uid: data.name,
  };
}
