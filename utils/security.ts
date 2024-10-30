import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { managedNonce } from "@noble/ciphers/webcrypto";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils";
const key = hexToBytes(process.env.TOKEN_SECRET || "");
const chacha = managedNonce(xchacha20poly1305)(key); // manages nonces for you

export function encryptString(str: string) {
  const data = utf8ToBytes(str);
  return bytesToHex(chacha.encrypt(data));
}

export function decryptString(str: string) {
  const data = hexToBytes(str);
  return bytesToUtf8(chacha.decrypt(data));
}
