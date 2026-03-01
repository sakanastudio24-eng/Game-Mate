import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Toast } from "./Toast";

export interface GlobalToastOptions {
  message: string;
  icon?: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  showToast: (options: GlobalToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    icon?: string;
    durationMs?: number;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    visible: false,
    message: "",
  });

  const hideToast = useCallback(() => {
    setToastState((previous) => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const showToast = useCallback((options: GlobalToastOptions) => {
    setToastState({
      visible: true,
      message: options.message,
      icon: options.icon,
      durationMs: options.durationMs,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        icon={toastState.icon}
        durationMs={toastState.durationMs}
        action={
          toastState.actionLabel && toastState.onAction
            ? {
                label: toastState.actionLabel,
                onPress: () => {
                  toastState.onAction?.();
                  hideToast();
                },
              }
            : undefined
        }
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
