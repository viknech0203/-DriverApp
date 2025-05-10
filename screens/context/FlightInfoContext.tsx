import React, { createContext, useContext, useState, ReactNode } from 'react';

type FlightInfo = {
  car: string;
  plate: string;
  driver: string;
  departureDate: string;
  departureTime: string;
  returnTime: string;
  customer: string;
  customerNotes: string;
  department: string;
  arrivalTime: string;
  leavingTime: string;
  contacts: string;
  carWarnings: string;
  status: string;
};

type FlightInfoContextType = {
  flightInfo: FlightInfo;
  setFlightInfo: (info: FlightInfo) => void;
};

const defaultFlightInfo: FlightInfo = {
  car: '',
  plate: '',
  driver: '',
  departureDate: '',
  departureTime: '',
  returnTime: '',
  customer: '',
  customerNotes: '',
  department: '',
  arrivalTime: '',
  leavingTime: '',
  contacts: '',
  carWarnings: '',
  status: '',
};

const FlightInfoContext = createContext<FlightInfoContextType | undefined>(undefined);

export const FlightInfoProvider = ({ children }: { children: ReactNode }) => {
  const [flightInfo, setFlightInfo] = useState<FlightInfo>(defaultFlightInfo);

  return (
    <FlightInfoContext.Provider value={{ flightInfo, setFlightInfo }}>
      {children}
    </FlightInfoContext.Provider>
  );
};

export const useFlightInfo = () => {
  const context = useContext(FlightInfoContext);
  if (!context) {
    throw new Error('useFlightInfo must be used within a FlightInfoProvider');
  }
  return context;
};
