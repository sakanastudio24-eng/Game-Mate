import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { buildUserQrValue, parseUserQrValue } from "../../src/lib/qr";
import { CURRENT_USER_AVATAR } from "../../src/lib/current-user";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

export default function QRCodeScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{ source?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mycode" | "scan">("mycode");
  const [accentColor, setAccentColor] = useState(colors.primary);
  const [hasScanned, setHasScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const qrSize = responsive.isSmallPhone ? 216 : responsive.isLargePhone ? 264 : 240;
  const qrValue = useMemo(() => buildUserQrValue(user?.username), [user?.username]);
  const qrPreviewLabel = user?.username ? `@${user.username}` : "Signed-out profile";
  const colorOptions = [colors.primary, "#66BAFF", "#66FF9F", "#FF6BA6"];
  const backTarget =
    params.source === "groups"
      ? "/(tabs)/groups"
      : params.source === "social"
        ? "/(tabs)/social"
        : "/(tabs)/profile";

  useEffect(() => {
    if (activeTab !== "scan") {
      setHasScanned(false);
      return;
    }

    if (!permission) return;
    if (!permission.granted) {
      void requestPermission();
    }
  }, [activeTab, permission, requestPermission]);

  const handleShare = useCallback(async () => {
    if (!qrValue) {
      Alert.alert("Missing Username", "Sign in with a valid username to generate your GameMate QR code.");
      return;
    }

    await Share.share({
      message: qrValue,
      url: qrValue,
    });
  }, [qrValue]);

  const openScannedProfile = useCallback(
    (username: string) => {
      if (user?.username && username.toLowerCase() === user.username.toLowerCase()) {
        router.push("/(tabs)/profile");
        return;
      }

      router.push({
        pathname: "/(tabs)/user-profile",
        params: { username, source: "qr" },
      });
    },
    [router, user?.username],
  );

  const handleScan = useCallback(
    ({ data }) => {
      if (hasScanned) return;

      setHasScanned(true);
      const username = parseUserQrValue(data);
      if (!username) {
        Alert.alert(
          "Unsupported QR Code",
          "This code is not a valid GameMate profile code.",
          [{ text: "Scan Again", onPress: () => setHasScanned(false) }],
        );
        return;
      }

      openScannedProfile(username);
    },
    [hasScanned, openScannedProfile],
  ) as (result: BarcodeScanningResult) => void;

  return (
    <Screen scrollable>
      <Header title="QR Code" showBackButton onBack={() => router.replace(backTarget as any)} />

      <View style={styles.tabSelector}>
        {["mycode", "scan"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab as "mycode" | "scan")}
            accessibilityRole="button"
            accessibilityLabel={tab === "mycode" ? "Show my QR code" : "Show scanner"}
            accessibilityState={{ selected: activeTab === tab }}
            style={[
              styles.tabButton,
              {
                paddingVertical: Math.max(10, responsive.cardPadding - 2),
                minHeight: responsive.buttonHeightSmall,
              },
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { fontSize: responsive.captionSize },
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "mycode" ? "My Code" : "Scan"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "mycode" ? (
        <>
          <Card style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <View
                style={[
                  styles.qrBox,
                  {
                    borderColor: accentColor,
                    borderRadius: responsive.cardRadius,
                    width: qrSize,
                    height: qrSize,
                  },
                ]}
              >
                {qrValue ? (
                  <QRCode
                    value={qrValue}
                    size={qrSize - 32}
                    color={accentColor}
                    backgroundColor={colors.background}
                  />
                ) : (
                  <MaterialCommunityIcons name="barcode-off" size={64} color={colors.textMuted} />
                )}
              </View>

              <View style={styles.identityRow}>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarInitial}>
                    {(user?.username?.[0] || CURRENT_USER_AVATAR[0] || "G").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.identityMeta}>
                  <Text style={[styles.qrLabel, { fontSize: responsive.bodySize + 2 }]}>{qrPreviewLabel}</Text>
                  <Text style={[styles.qrUrl, { fontSize: responsive.bodySmallSize }]}>{qrValue || "gm:user:"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { fontSize: responsive.captionSize }]}>QR Accent Color</Text>
              <View style={styles.colorGrid}>
                {colorOptions.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setAccentColor(color)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set QR accent color ${color}`}
                    accessibilityState={{ selected: accentColor === color }}
                    style={[
                      styles.colorOption,
                      {
                        width: responsive.iconButtonSize + 8,
                        height: responsive.iconButtonSize + 8,
                        borderRadius: (responsive.iconButtonSize + 8) / 2,
                        backgroundColor: color,
                      },
                      accentColor === color && styles.colorOptionSelected,
                    ]}
                  >
                    {accentColor === color ? (
                      <MaterialCommunityIcons name="check" size={20} color={colors.background} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button variant="primary" fullWidth size="large" icon="share" onPress={handleShare}>
              Share Code
            </Button>
            <Button
              variant="secondary"
              fullWidth
              size="large"
              icon="camera"
              onPress={() => setActiveTab("scan")}
            >
              Open Scanner
            </Button>
          </View>
        </>
      ) : (
        <Card style={styles.scanCard}>
          <View style={styles.scanStage}>
            {permission?.granted ? (
              <View style={styles.cameraWrap}>
                <CameraView
                  onBarcodeScanned={hasScanned ? undefined : handleScan}
                  style={StyleSheet.absoluteFillObject}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
                <View pointerEvents="none" style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                </View>
              </View>
            ) : (
              <View style={styles.scanPlaceholder}>
                <MaterialCommunityIcons name="camera-off" size={56} color={colors.textMuted} />
                <Text style={styles.scanText}>
                  {permission ? "Camera permission is required." : "Checking camera access..."}
                </Text>
                <Text style={[styles.scanSubtext, { fontSize: responsive.bodySmallSize }]}>
                  Scan a GameMate QR code that contains `gm:user:username`.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {hasScanned ? (
              <Button variant="primary" fullWidth size="large" icon="qrcode-scan" onPress={() => setHasScanned(false)}>
                Scan Again
              </Button>
            ) : null}
            <Button variant="secondary" fullWidth size="large" icon="qrcode" onPress={() => setActiveTab("mycode")}>
              Back to My Code
            </Button>
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabSelector: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.primary,
  },
  qrCard: {
    marginBottom: spacing.lg,
  },
  qrContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  qrBox: {
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
    padding: 16,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: spacing.md,
  },
  avatarBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 22,
  },
  identityMeta: {
    flex: 1,
  },
  qrLabel: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  qrUrl: {
    color: colors.textMuted,
  },
  colorSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  colorLabel: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  colorGrid: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
  },
  colorOption: {
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  scanCard: {
    marginBottom: spacing.lg,
  },
  scanStage: {
    marginBottom: spacing.lg,
  },
  cameraWrap: {
    height: 360,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111111",
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  scanPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
    paddingVertical: spacing.xxl,
  },
  scanText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: "center",
  },
  scanSubtext: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
