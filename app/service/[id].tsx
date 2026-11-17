import { router, useLocalSearchParams } from "expo-router";
import { FileText, Share2, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Card, ComingSoon, ConfirmSheet, Text } from "../../src/components";
import { shareReceipt, useDocument } from "../../src/features/attachments";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import {
  SERVICE_TYPE_LABELS,
  useDeleteServiceRecord,
  useServiceRecord,
  type ServiceType,
} from "../../src/features/services";
import { useVehicle } from "../../src/features/vehicles";
import { formatMinor } from "../../src/lib/money";
import { parseDateOnly } from "../../src/lib/time";
import { formatDistance } from "../../src/lib/units";
import { useTheme } from "../../src/theme";

/** Screen 08 — Record Detail (CK-07). */
export default function ServiceDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: record, isLoading } = useServiceRecord(id);
  const { data: vehicle } = useVehicle(record?.vehicleId);
  const { data: document } = useDocument(record?.receiptDocumentId ?? undefined);
  const { unit } = useDistanceUnit();
  const deleteServiceRecord = useDeleteServiceRecord();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading || !record) {
    return <ComingSoon title="Loading record…" module="module 5 — Service records and history" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
      <Card>
        <Text variant="title">
          {SERVICE_TYPE_LABELS[record.type as ServiceType] ?? record.type}
        </Text>
        {vehicle && (
          <Text variant="body" muted>
            {vehicle.nickname}
          </Text>
        )}
        <Text variant="body" style={{ marginTop: theme.spacing.sm }}>
          {parseDateOnly(record.serviceOn).toLocaleDateString()}
        </Text>
      </Card>

      <Card>
        <Row
          label="Odometer"
          value={
            record.odometerMeters !== null
              ? formatDistance(record.odometerMeters, unit)
              : "Not recorded"
          }
          first
        />
        <Row
          label="Cost"
          value={record.priceMinor !== null ? `$${formatMinor(record.priceMinor)}` : "Not recorded"}
        />
        <Row label="Provider" value={record.provider ?? "Not recorded"} />
      </Card>

      {record.notes ? (
        <Card>
          <Text variant="label" muted style={{ marginBottom: theme.spacing.xs }}>
            Notes
          </Text>
          <Text variant="body">{record.notes}</Text>
        </Card>
      ) : null}

      {document && (
        <Card>
          <Text variant="label" muted style={{ marginBottom: theme.spacing.sm }}>
            Receipt
          </Text>
          {document.mimeType.startsWith("image/") ? (
            <Image
              source={{ uri: document.localPath }}
              style={{ width: "100%", height: 220, borderRadius: theme.radii.md }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              <FileText color={theme.colors.primary} size={24} />
              <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
                {document.label}
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => shareReceipt(document.localPath, document.mimeType)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
              marginTop: theme.spacing.md,
              padding: theme.spacing.sm,
            }}
          >
            <Share2 size={16} color={theme.colors.primary} />
            <Text variant="label" color={theme.colors.primary}>
              Share
            </Text>
          </Pressable>
        </Card>
      )}

      <Pressable
        onPress={() => setConfirmDelete(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.xs,
          padding: theme.spacing.md,
        }}
      >
        <Trash2 size={18} color={theme.colors.statusOverdue} />
        <Text variant="label" color={theme.colors.statusOverdue}>
          Delete record
        </Text>
      </Pressable>

      <ConfirmSheet
        visible={confirmDelete}
        title="Delete this record?"
        description="This also deletes its receipt, if any. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          deleteServiceRecord.mutate(record.id);
          router.back();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </ScrollView>
  );
}

function Row({ label, value, first }: { label: string; value: string; first?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: theme.colors.border,
      }}
    >
      <Text variant="body" muted>
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}
