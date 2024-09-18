"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface ReportState {
  testTitle: string;
  templateTitle: string;
  templateId: string;
  id: string;
  type: "template" | "section" | "query" | "processing_step";
}

interface ReportContextType extends ReportState {
  setTestReportState: (state: Partial<ReportState>) => void;
  resetTestReportState: () => void;
}

const initialState: ReportState = {
  testTitle: "",
  templateTitle: "",
  templateId: "",
  id: "",
  type: "",
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReportState>(initialState);

  const setTestReportState = useCallback((newState: Partial<ReportState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const resetTestReportState = useCallback(() => {
    setState(initialState);
  }, []);

  const value = {
    ...state,
    setTestReportState: setTestReportState,
    resetTestReportState: resetTestReportState,
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}

export function useTestReportContext() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReportContext must be used within a ReportProvider");
  }
  return context;
}
