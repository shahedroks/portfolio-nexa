import { createContext, useContext, type ReactNode } from "react";
import { getCmsDefaults } from "@/lib/cms.defaults";
import type { CmsBundle } from "@/lib/cms.types";

const CmsContext = createContext<CmsBundle>(getCmsDefaults());

export function CmsProvider({
  value,
  children,
}: {
  value: CmsBundle;
  children: ReactNode;
}) {
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsBundle {
  return useContext(CmsContext);
}
