// hooks/useCheckApiKeys.ts
import { useState, useEffect, useCallback } from "react";
import { ApiKeys } from "@/interfaces/ApiKeys";

export const useExchangeManager = (): [
  boolean,
  ApiKeys | undefined,
  (apiKeys: ApiKeys) => void
] => {
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys | undefined>(undefined);

  const encryptAndSaveKeys = useCallback(async (apiKeys: ApiKeys) => {
    if (apiKeys) {
      const keysString = JSON.stringify(apiKeys);
      try {
        const response = await fetch(
          "/api/encrypt?keysString=" + encodeURIComponent(keysString)
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const { encryptedKeys } = await response.json();
        localStorage.setItem("encryptedApiKeys", encryptedKeys);
        console.log("keys: Saved encrypted keys", encryptedKeys);
        alert("Keys and secrets saved successfully!");
      } catch (error) {
        console.error("Failed to encrypt keys:", error);
      }
    }
  }, []);

  useEffect(() => {
    async function decryptKeys(encryptedKeys: string) {
      try {
        const response = await fetch(
          "/api/decrypt?encryptedKeys=" + encodeURIComponent(encryptedKeys)
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const { decryptedKeys } = await response.json();

        console.log("keys: Decrypted keys", decryptedKeys);
        return decryptedKeys;
      } catch (error) {
        console.error("Failed to decrypt keys", error);
        return undefined; // Return null or handle the error appropriately
      }
    }

    async function handleApiKeys() {
      const encryptedApiKeys = localStorage.getItem("encryptedApiKeys");
      console.log("encryptedApiKeys", encryptedApiKeys);
      if (encryptedApiKeys) {
        const unencryptedApiKeys = await decryptKeys(encryptedApiKeys);
        if (unencryptedApiKeys) {
          // Ensure unencryptedApiKeys is not null
          const keysObject: ApiKeys = JSON.parse(unencryptedApiKeys);
          // Basic check to see any keys are set
          if (keysObject.binance || keysObject.kraken || keysObject.bybit) {
            setIsSettingsSaved(true);
            setApiKeys(keysObject); // Save the API keys in state
          } else {
            setIsSettingsSaved(false);
            setApiKeys(undefined);
          }
        } else {
          // Handle the case where decryption fails and unencryptedApiKeys is null
          setIsSettingsSaved(false);
          setApiKeys(undefined);
        }
      }
    }

    handleApiKeys();
  }, []); // Dependencies array remains the same

  return [isSettingsSaved, apiKeys, encryptAndSaveKeys];
};
