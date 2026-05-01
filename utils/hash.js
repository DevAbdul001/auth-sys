const crypto = require ('crypto');



function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex'); 
}


function verifyToken(token, storedHash) {
  const hash = hashToken(token);

  const hashBuffer = Buffer.from(hash);
  const storedBuffer = Buffer.from(storedHash);

  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}



module.exports = {
    hashToken,
    verifyToken
}