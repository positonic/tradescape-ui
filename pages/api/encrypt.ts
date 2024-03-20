import type { NextApiRequest, NextApiResponse } from "next";
import CryptoJS from "crypto-js";

export type ResponseEncryptKeys = {
  encryptedKeys: string;
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseEncryptKeys>
) {
  const secretKeyPhrase = process.env.SECRET_KEY_PHRASE;
  const keys: string | string[] | undefined = req.query.keysString;

  if (keys === undefined || secretKeyPhrase === undefined) {
    return res
      .status(500)
      .json({ encryptedKeys: "", error: "Failed to fetch open orders" });
  }
  const keysString: string | undefined = Array.isArray(keys) ? keys[0] : keys;

  // Use the secretKeyPhrase for encryption/decryption here
  try {
    const encryptedKeys = CryptoJS.AES.encrypt(
      keysString,
      secretKeyPhrase
    ).toString();

    const decryptedKeys = CryptoJS.AES.decrypt(
      encryptedKeys,
      secretKeyPhrase
    ).toString(CryptoJS.enc.Utf8);

    const response: ResponseEncryptKeys = { encryptedKeys, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch open order data:", error);
    res
      .status(500)
      .json({ encryptedKeys: "", error: "Failed to fetch open orders" });
  }
}
