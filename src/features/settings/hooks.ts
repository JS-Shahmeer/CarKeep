import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_KEYS, getSetting, setSetting } from "../../db";
import type { DistanceUnit } from "../../lib/units";

const DEFAULT_DISTANCE_UNIT: DistanceUnit = "km";

export const settingsKeys = {
  distanceUnit: ["settings", "distanceUnit"] as const,
};

export function useDistanceUnit() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: settingsKeys.distanceUnit,
    queryFn: async (): Promise<DistanceUnit> => {
      const value = await getSetting(SETTINGS_KEYS.distanceUnit);
      return value === "mi" ? "mi" : DEFAULT_DISTANCE_UNIT;
    },
  });

  const mutation = useMutation({
    mutationFn: (unit: DistanceUnit) => setSetting(SETTINGS_KEYS.distanceUnit, unit),
    onSuccess: (_data, unit) => {
      queryClient.setQueryData(settingsKeys.distanceUnit, unit);
    },
  });

  return {
    unit: query.data ?? DEFAULT_DISTANCE_UNIT,
    isLoading: query.isLoading,
    setUnit: mutation.mutate,
  };
}
