import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components";
import { vehicleKeys } from "../vehicles/hooks";
import { logger } from "../../lib/logger";
import {
  createServiceRecord,
  deleteServiceRecord,
  getServiceRecord,
  listServiceRecords,
  updateServiceRecord,
  type CreateServiceRecordInput,
  type ServiceRecordFilters,
  type UpdateServiceRecordInput,
} from "./repo";

export const serviceKeys = {
  all: ["serviceRecords"] as const,
  list: (filters: ServiceRecordFilters) => ["serviceRecords", "list", filters] as const,
  detail: (id: string) => ["serviceRecords", id] as const,
};

export function useServiceRecords(filters: ServiceRecordFilters = {}) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () => listServiceRecords(filters),
  });
}

export function useServiceRecord(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.detail(id ?? ""),
    queryFn: () => getServiceRecord(id as string),
    enabled: !!id,
  });
}

function invalidateServiceLists(
  queryClient: ReturnType<typeof useQueryClient>,
  vehicleId?: string,
) {
  queryClient.invalidateQueries({ queryKey: serviceKeys.all });
  // Car Detail's "recent history" reads from the vehicle-filtered list.
  if (vehicleId) {
    queryClient.invalidateQueries({ queryKey: serviceKeys.list({ vehicleId }) });
  }
}

export function useCreateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceRecordInput) => createServiceRecord(input),
    onSuccess: (record) => {
      invalidateServiceLists(queryClient, record.vehicleId);
      toast.show("Service record saved.", "success");
    },
    onError: () => {
      logger.error("service_record_create_failed");
      toast.show("Couldn't save the service record. Please try again.", "error");
    },
  });
}

export function useUpdateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateServiceRecordInput) => updateServiceRecord(input),
    onSuccess: (_data, variables) => {
      invalidateServiceLists(queryClient, variables.vehicleId);
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) });
    },
    onError: () => {
      logger.error("service_record_update_failed");
      toast.show("Couldn't save your changes. Please try again.", "error");
    },
  });
}

export function useDeleteServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceRecord,
    onSuccess: () => {
      invalidateServiceLists(queryClient);
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.show("Service record deleted.", "success");
    },
    onError: () => {
      logger.error("service_record_delete_failed");
      toast.show("Couldn't delete the record. Please try again.", "error");
    },
  });
}
