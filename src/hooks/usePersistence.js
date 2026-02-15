import { useState, useEffect } from "react";
import blankState from "../data/blankState";

const STORAGE_KEY = "taxflow-pro-data";

export default function usePersistence() {
  const [data, setData] = useState(blankState());
  const [step, setStep] = useState(0);
  const [year, setYear] = useState("2024");
  const [loaded, setLoaded] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const s = JSON.parse(r.value);
          setData(s.data || blankState());
          setStep(s.step || 0);
          setYear(s.year || "2024");
        }
      } catch {
        /* fresh start */
      }
      setLoaded(true);
    })();
  }, []);

  // Save on every change (only after initial load)
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(
          STORAGE_KEY,
          JSON.stringify({ data, step, year, saved: new Date().toISOString() })
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [data, step, year, loaded]);

  const set = (k, v) => setData((prev) => ({ ...prev, [k]: v }));

  return { data, setData, set, step, setStep, year, setYear };
}
