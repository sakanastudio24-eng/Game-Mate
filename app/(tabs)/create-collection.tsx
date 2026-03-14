import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SegmentedButtons, Text } from "react-native-paper";
import { createPost } from "../../services/posts";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/context/AuthContext";
import { SESSION_EXPIRED_MESSAGE } from "../../src/lib/auth-messages";
import { Screen } from "../../src/components/ui/Screen";
import { useSafeBackNavigation } from "../../src/lib/navigation";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type CreateType = "video" | "game" | "group";

const platforms = ["PlayStation", "PC", "Mobile", "Switch", "Cross-platform"];
const tags = ["Competitive", "Casual", "Guide", "Highlights", "Tutorial"];
const mediaSources = ["None", "Upload", "Camera"];

const flowCopy: Record<
  CreateType,
  {
    screenTitle: string;
    itemLabel: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    primaryButton: string;
  }
> = {
  video: {
    screenTitle: "Create Video",
    itemLabel: "Video",
    titleLabel: "Video Title",
    titlePlaceholder: "e.g. Ranked Clutch Montage",
    descriptionPlaceholder: "What is this clip about?",
    primaryButton: "Publish Video",
  },
  game: {
    screenTitle: "Add Game",
    itemLabel: "Game",
    titleLabel: "Game Name",
    titlePlaceholder: "e.g. Helldivers 2",
    descriptionPlaceholder: "Why you play this game",
    primaryButton: "Save Game",
  },
  group: {
    screenTitle: "Create Group",
    itemLabel: "Group",
    titleLabel: "Group Name",
    titlePlaceholder: "e.g. Late Night Ranked Squad",
    descriptionPlaceholder: "Describe your group goals",
    primaryButton: "Create Group",
  },
};

function resolveType(rawType?: string | string[]): CreateType {
  const value = Array.isArray(rawType) ? rawType[0] : rawType;
  if (value === "video" || value === "game" || value === "group") {
    return value;
  }
  return "video";
}

export default function CreateCollectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string | string[] }>();
  const safeBack = useSafeBackNavigation("/(tabs)/profile");
  const responsive = useResponsive();
  const { accessToken } = useAuth();

  const type = useMemo(() => resolveType(params.type), [params.type]);
  const copy = flowCopy[type];

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [tag, setTag] = useState("Competitive");
  const [mediaSource, setMediaSource] = useState("Upload");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  const normalizedPlatform = platform.trim();

  const handleHeaderBack = () => {
    if (isSubmitting) return;
    if (step === 2) {
      setStep(1);
      return;
    }
    safeBack();
  };

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};

    if (!normalizedTitle) {
      nextErrors.title = `Enter a ${copy.itemLabel.toLowerCase()} title.`;
    }

    if (!normalizedDescription) {
      nextErrors.description = "Add a short description.";
    }

    if (type === "video" && !normalizedPlatform) {
      nextErrors.platform = "Pick a platform for this post.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStepOne()) return;
    setStep(2);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handlePublish = async () => {
    if (isSubmitting) return;
    if (!validateStepOne()) {
      setSubmitError("Fix the required fields before publishing.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    if (type === "video") {
      if (!accessToken) {
        setSubmitError(SESSION_EXPIRED_MESSAGE);
        return;
      }

      setIsSubmitting(true);
      try {
        const created = await createPost(accessToken, {
          game: normalizedPlatform || "General",
          title: normalizedTitle,
          description: normalizedDescription,
          video_url: "",
        });

        router.replace({
          pathname: "/(tabs)/news",
          params: {
            refresh: "1",
            focusVideoId: String(created.id),
            focusFrom: "create",
            createdTitle: normalizedTitle,
          },
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to publish right now.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setSubmitSuccess(`${copy.itemLabel} created.`);
    Alert.alert(`${copy.itemLabel} Created`, `${title.trim()} is now in your profile.`);
    safeBack();
  };

  return (
    <Screen scrollable>
      <Header
        title={copy.screenTitle}
        subtitle={`Step ${step} of 2`}
        showBackButton
        onBack={handleHeaderBack}
      />

      {step === 1 ? (
        <>
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}>{copy.titleLabel} *</Text>
            <Input
              label={copy.titleLabel}
              accessibilityLabel={copy.titleLabel}
              placeholder={copy.titlePlaceholder}
              value={title}
              onChangeText={setTitle}
              error={Boolean(errors.title)}
              errorText={errors.title}
              fullWidth
            />

            <Input
              label="Description"
              accessibilityLabel={`${copy.itemLabel} description`}
              placeholder={copy.descriptionPlaceholder}
              value={description}
              onChangeText={setDescription}
              error={Boolean(errors.description)}
              errorText={errors.description}
              multiline
              numberOfLines={4}
              fullWidth
            />
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}>Platform</Text>
            <View style={styles.optionWrap}>
              {platforms.map((option) => (
                <Button
                  key={option}
                  variant={platform === option ? "primary" : "secondary"}
                  size="small"
                  style={styles.optionButton}
                  onPress={() => setPlatform(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
            {errors.platform ? <Text style={styles.fieldError}>{errors.platform}</Text> : null}
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}>Tag</Text>
            <View style={styles.optionWrap}>
              {tags.map((option) => (
                <Button
                  key={option}
                  variant={tag === option ? "primary" : "secondary"}
                  size="small"
                  style={styles.optionButton}
                  onPress={() => setTag(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}>Media Upload</Text>
            <View style={styles.optionWrap}>
              {mediaSources.map((option) => (
                <Button
                  key={option}
                  variant={mediaSource === option ? "primary" : "secondary"}
                  size="small"
                  style={styles.optionButton}
                  onPress={() => setMediaSource(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}>Visibility</Text>
            <SegmentedButtons
              value={visibility}
              onValueChange={(value) =>
                setVisibility(value as "public" | "friends" | "private")
              }
              buttons={[
                { value: "public", label: "Public" },
                { value: "friends", label: "Friends" },
                { value: "private", label: "Private" },
              ]}
            />
          </Card>

          <Button variant="primary" fullWidth size="large" onPress={handleContinue}>
            Continue
          </Button>
          <Button variant="secondary" fullWidth size="large" onPress={safeBack} disabled={isSubmitting}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.reviewTitle}>Review</Text>
            <Text style={styles.reviewLabel}>{copy.titleLabel}</Text>
            <Text style={styles.reviewValue}>{title.trim()}</Text>

            <Text style={styles.reviewLabel}>Description</Text>
            <Text style={styles.reviewValue}>{description.trim()}</Text>

            <Text style={styles.reviewLabel}>Platform</Text>
            <Text style={styles.reviewValue}>{platform}</Text>

            <Text style={styles.reviewLabel}>Tag</Text>
            <Text style={styles.reviewValue}>{tag}</Text>

            <Text style={styles.reviewLabel}>Media Upload</Text>
            <Text style={styles.reviewValue}>{mediaSource}</Text>

            <Text style={styles.reviewLabel}>Visibility</Text>
            <Text style={styles.reviewValue}>{visibility}</Text>
          </Card>

          <View style={styles.actionRow}>
            <Button
              variant="secondary"
              size="large"
              style={styles.halfButton}
              onPress={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="large"
              style={styles.halfButton}
              onPress={() => {
                void handlePublish();
              }}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : copy.primaryButton}
            </Button>
          </View>
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          {submitSuccess ? <Text style={styles.submitSuccess}>{submitSuccess}</Text> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  optionButton: {
    marginRight: spacing.xs,
  },
  reviewTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  reviewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  reviewValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  halfButton: {
    flex: 1,
  },
  fieldError: {
    color: colors.destructive,
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  submitError: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  submitSuccess: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
});
