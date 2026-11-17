import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components";
import { logger } from "../../lib/logger";
import { displayToMeters, type DistanceUnit } from "../../lib/units";
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateOdometer,
  updateVehicle,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from "./repo";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  detail: (id: string) => ["vehicles", id] as const,
};

export function useVehicles() {
  return useQuery({ queryKey: vehicleKeys.all, queryFn: listVehicles });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ""),
    queryFn: () => getVehicle(id as string),
    enabled: !!id,
  });
}

/** Converts a form's display-unit odometer value to canonical meters before writing (R01). */
export function toCreateVehicleInput(
  values: {
    nickname: string;
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
    odometer?: number;
  },
  unit: DistanceUnit,
): CreateVehicleInput {
  return {
    ...values,
    odometerMeters:
      values.odometer !== undefined ? displayToMeters(values.odometer, unit) : undefined,
  };
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: () => {
      logger.error("vehicle_create_failed");
      toast.show("Couldn't save the car. Please try again.", "error");
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateVehicleInput) => updateVehicle(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
    },
    onError: () => {
      logger.error("vehicle_update_failed");
      toast.show("Couldn't save your changes. Please try again.", "error");
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.show("Car deleted.", "success");
    },
    onError: () => {
      logger.error("vehicle_delete_failed");
      toast.show("Couldn't delete the car. Please try again.", "error");
    },
  });
}

export function useUpdateOdometer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, meters }: { id: string; meters: number }) => updateOdometer(id, meters),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
    },
    onError: () => {
      logger.error("odometer_update_failed");
      toast.show("Couldn't update the odometer. Please try again.", "error");
    },
  });
}
