// TabsContext.tsx
import React, { createContext, useContext, useState } from 'react';

type TabsContextType = {
  index: number;
  setIndex: (index: number) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [index, setIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ index, setIndex }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used inside TabsProvider');
  return ctx;
};
