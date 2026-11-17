import { router } from "expo-router";
import { Car, ChevronRight } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, Fab, Text } from "../../src/components";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { useVehicles } from "../../src/features/vehicles";
import { formatDistance } from "../../src/lib/units";
import { useTheme } from "../../src/theme";

/** Screen 03 entry / Garage (brief section 02). Vehicle list lives here (module 4). */
export default function GarageScreen() {
  const theme = useTheme();
  const { data: vehicles = [], isLoading } = useVehicles();
  const { unit } = useDistanceUnit();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 }}
        ListHeaderComponent={
          <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
            Garage
          </Text>
        }
        ListEmptyComponent={
          isLoading ? undefined : (
            <EmptyState
              icon={<Car color={theme.colors.textMuted} size={40} />}
              title="No cars yet"
              description="Add your first car to start tracking mileage and service."
              actionLabel="Add My Car"
              onAction={() => router.push("/car/edit")}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/car/${item.id}`)}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radii.md,
                  backgroundColor: theme.colors.primaryTint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Car color={theme.colors.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">{item.nickname}</Text>
                <Text variant="caption" muted>
                  {item.odometerMeters !== null
                    ? formatDistance(item.odometerMeters, unit)
                    : "No odometer reading yet"}
                </Text>
              </View>
              <ChevronRight color={theme.colors.textMuted} size={20} />
            </Card>
          </Pressable>
        )}
      />
      {vehicles.length > 0 && (
        <Fab
          accessibilityLabel="Add service or reminder"
          onPress={() =>
            router.push(
              vehicles.length === 1
                ? { pathname: "/service/new", params: { vehicleId: vehicles[0].id } }
                : "/service/new",
            )
          }
          style={{ position: "absolute", right: theme.spacing.lg, bottom: theme.spacing.lg }}
        />
      )}
    </SafeAreaView>
  );
}
