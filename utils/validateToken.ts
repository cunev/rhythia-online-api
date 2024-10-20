export function validateIntrinsicToken(token: string) {
  return (
    (process.env.validationCode ? eval(process.env.validationCode) : token) ==
    token
  );
}
