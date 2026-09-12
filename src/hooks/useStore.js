import { useState, useEffect } from "react";
import { getState, subscribe } from "../data/store.js";

export function useTabbiState() {
  const [state, setState] = useState(getState());
  useEffect(() => subscribe(setState), []);
  return state;
}
