import { useCallback, useState } from "react";

export function useOptimisticToggle(initialIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const toggle = useCallback((id: string): (() => void) => {
    let undone = false;

    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );

    return () => {
      if (undone) return;
      undone = true;
      setSelectedIds((previous) =>
        previous.includes(id)
          ? previous.filter((item) => item !== id)
          : [...previous, id],
      );
    };
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    isSelected,
    toggle,
  };
}
