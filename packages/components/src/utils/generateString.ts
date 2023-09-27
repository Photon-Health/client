function randomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateString(lowerLimit = 5, upperLimit = 10): string {
  const stringLength = Math.floor(Math.random() * (upperLimit - lowerLimit + 1)) + lowerLimit;
  return randomString(stringLength);
}

export default generateString;
