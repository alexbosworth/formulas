const crypto = require('node:crypto');

const bytesCount = 6;
const scale = 2 ** (bytesCount * 8);
const startOffset = 0;

/** Generate a cryptographically secure random fraction

  @returns
  {
    fraction: <Random Number From Zero Up To But Not Including One Number>
  }
*/
module.exports = () => {
  const bytes = crypto.randomBytes(bytesCount);

  return {fraction: bytes.readUIntBE(startOffset, bytesCount) / scale};
};
