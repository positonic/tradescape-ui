// hooks/useCheckApiKeys.ts
import { useState, useEffect } from "react";

interface ApiKeys {
  Binance?: string;
  Kraken?: string;
  Bybit?: string;
}

export const useExchangeManager = (): [boolean, ApiKeys | null] => {
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);

  useEffect(() => {
    const storedApiKeys = localStorage.getItem("apiKeys");
    if (storedApiKeys) {
      const keysObject: ApiKeys = JSON.parse(storedApiKeys);
      // Basic check to see if both keys exist
      if (keysObject.Binance && keysObject.Kraken) {
        setIsSettingsSaved(true);
        setApiKeys(keysObject); // Save the API keys in state
      } else {
        setIsSettingsSaved(false);
        setApiKeys(null);
      }
    }
  }, []);

  return [isSettingsSaved, apiKeys];
};
