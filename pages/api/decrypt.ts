import type { NextApiRequest, NextApiResponse } from "next";
import CryptoJS from "crypto-js";

export type ResponseDecryptKeys = {
  decryptedKeys: string;
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseDecryptKeys>
) {
  const keys: string | string[] | undefined = req.query.encryptedKeys;
  const secretKeyPhrase = process.env.SECRET_KEY_PHRASE;

  if (keys === undefined || secretKeyPhrase === undefined) {
    return res
      .status(500)
      .json({ decryptedKeys: "", error: "Failed to decrypt keys 1" });
  }

  const keysString: string | undefined = Array.isArray(keys) ? keys[0] : keys;

  // Use the secretKeyPhrase for encryption/decryption here
  try {
    const decryptedKeys = CryptoJS.AES.decrypt(
      keysString,
      secretKeyPhrase
    ).toString(CryptoJS.enc.Utf8);
    const response: ResponseDecryptKeys = { decryptedKeys, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to decrypt keys 2:", error);
    res
      .status(500)
      .json({ decryptedKeys: "", error: "Failed to fetch open orders" });
  }
}
