import { Handler } from "aws-lambda";
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

export const handler: Handler = async (
  event,
  context
): Promise<(typeof Schema)["output"]["_type"]> => {
  const data = Schema.input.parse(event);

  return {
    uid: data.name,
  };
};
