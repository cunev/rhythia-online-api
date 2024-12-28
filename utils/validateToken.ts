export function validateIntrinsicToken(token: string) {
  return true;
  // if (!process.env.validationCode) return true;
  // const generatedValidationCode = eval(process.env.validationCode);
  // console.log(generatedValidationCode, token);
  // return generatedValidationCode == token;
}
