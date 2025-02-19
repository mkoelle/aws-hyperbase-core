const sodium = require('libsodium-wrappers');

function encryptStringWithKey(key, message) {
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(message);
  const keyBytes = Buffer.from(key, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString('base64');
  return encrypted;
}
exports.encryptStringWithKey = encryptStringWithKey;
