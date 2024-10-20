export function validateIntrinsicToken(token: string) {
  if (!process.env.validationCode) return true;
  const generatedValidationCode = eval(process.env.validationCode);
  console.log(generatedValidationCode, token);
  return generatedValidationCode == token;
}
