import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { mockQRCode } from '../../src/lib/mockData';
import { colors, spacing } from '../../src/lib/theme';

// QRCodeScreen: Show user's QR code for profile sharing
// Backend integration: GET /api/me/qr-code endpoint in Phase B
// Features: Show QR, copy link, download, customize color

export default function QRCodeScreen() {
  const [activeTab, setActiveTab] = useState<'mycode' | 'scan'>('mycode');
  const [accentColor, setAccentColor] = useState(colors.primary);

  const colors_list = [colors.primary, '#66BAFF', '#66FF9F', '#FF6BA6'];

  return (
    <Screen scrollable>
      <Header title="QR Code" showBackButton onBack={() => {}} />

      {/* Tabs */}
      <View style={styles.tabSelector}>
        {['mycode', 'scan'].map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === 'mycode' ? 'My Code' : 'Scan'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'mycode' ? (
        <>
          {/* QR Code Card */}
          <Card style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <View
                style={[
                  styles.qrBox,
                  { borderColor: accentColor },
                ]}
              >
                {/* Placeholder QR code */}
                <View style={styles.qrPlaceholder}>
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={80}
                    color={accentColor}
                  />
                </View>
              </View>

              <Text style={styles.qrLabel}>{mockQRCode.displayName}</Text>
              <Text style={styles.qrUrl}>{mockQRCode.profileUrl}</Text>
            </View>

            {/* Accent color picker */}
            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>QR Accent Color</Text>
              <View style={styles.colorGrid}>
                {colors_list.map(color => (
                  <Pressable
                    key={color}
                    onPress={() => setAccentColor(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      accentColor === color && styles.colorOptionSelected,
                    ]}
                  >
                    {accentColor === color && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={colors.background}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="primary"
              fullWidth
              size="large"
              icon="content-copy"
            >
              Copy Link
            </Button>

            <Button
              variant="secondary"
              fullWidth
              size="large"
              icon="download"
            >
              Download
            </Button>

            <Button
              variant="secondary"
              fullWidth
              size="large"
              icon="share"
            >
              Share
            </Button>
          </View>
        </>
      ) : (
        <Card style={styles.scanCard}>
          <View style={styles.scanPlaceholder}>
            <MaterialCommunityIcons
              name="camera"
              size={56}
              color={colors.textMuted}
            />
            <Text style={styles.scanText}>Camera Scanner</Text>
            <Text style={styles.scanSubtext}>
              Point camera at a GameMate QR code to add them
            </Text>
          </View>

          <Button
            variant="primary"
            fullWidth
            size="large"
            icon="camera"
          >
            Open Camera
          </Button>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  qrCard: {
    marginBottom: spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  qrBox: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },
  qrPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  qrUrl: {
    color: colors.textMuted,
    fontSize: 12,
  },
  colorSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  colorLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  scanPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  scanText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    marginTop: spacing.md,
  },
  scanSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
