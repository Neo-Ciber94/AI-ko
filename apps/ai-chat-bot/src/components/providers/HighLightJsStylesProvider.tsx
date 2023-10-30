"use client";
import { createContext, useContext } from "react";

type HighLightJsStylesContext = {
  darkThemeStyles: string;
  lightThemeStyles: string;
};

const highLightJsStylesContext = createContext<HighLightJsStylesContext | null>(
  null,
);

type HighLightJsStylesProviderProps = {
  children: React.ReactNode;
  styles: HighLightJsStylesContext;
};

export function HighLightJsStylesProvider({
  children,
  styles,
}: HighLightJsStylesProviderProps) {
  return (
    <highLightJsStylesContext.Provider value={styles}>
      {children}
    </highLightJsStylesContext.Provider>
  );
}

export function useHighLightJsThemes() {
  const ctx = useContext(highLightJsStylesContext);

  if (ctx == null) {
    throw new Error(`<${HighLightJsStylesProvider.name}> was not set`);
  }

  return ctx;
}
