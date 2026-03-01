import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type CategoryId = "fyp" | "esports" | "patches" | "streams";

interface FeedItem {
  id: string;
  type: "video" | "article";
  title: string;
  author: string;
  date: string;
  duration?: string;
  thumbnail: string;
  likes: number;
  comments: number;
  category: CategoryId;
}

const categories: Array<{ id: CategoryId; label: string }> = [
  { id: "fyp", label: "For You" },
  { id: "esports", label: "Esports" },
  { id: "patches", label: "Updates" },
  { id: "streams", label: "Streams" },
];

const authorAvatars: Record<string, string> = {
  ProGamingLeague:
    "https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=100&h=100&fit=crop",
  GameStrategy:
    "https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=100&h=100&fit=crop",
  GameDevs:
    "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=100&h=100&fit=crop",
};

const feed: FeedItem[] = [
  {
    id: "1",
    type: "video",
    title: "Disco 2024 Tournament Finals",
    author: "ProGamingLeague",
    date: "Aug 25, 2026",
    duration: "1:20",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
    likes: 1240,
    comments: 89,
    category: "fyp",
  },
  {
    id: "2",
    type: "video",
    title: "New Meta Breakdown - Season 5",
    author: "GameStrategy",
    date: "Feb 12, 2026",
    duration: "0:58",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
    likes: 856,
    comments: 45,
    category: "fyp",
  },
  {
    id: "3",
    type: "article",
    title: "Patch Notes 3.2 - Major Balance Changes",
    author: "GameDevs",
    date: "Feb 10, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80",
    likes: 2100,
    comments: 156,
    category: "patches",
  },
];

export default function NewsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("fyp");
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return feed.filter((item) => {
      if (item.category !== activeCategory) return false;
      if (!normalized) return true;
      return [item.title, item.author].join(" ").toLowerCase().includes(normalized);
    });
  }, [activeCategory, searchQuery]);

  const toggleLike = (id: string) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <AnimatedEntrance>
            <View
              style={[
                styles.headerWrap,
                {
                  paddingHorizontal: responsive.horizontalPadding,
                  maxWidth: responsive.contentMaxWidth,
                  alignSelf: "center",
                  width: "100%",
                },
              ]}
            >
              <View style={styles.titleRow}>
                <Text style={[styles.title, { fontSize: responsive.titleSize }]}>News</Text>
                <Pressable
                  onPress={() => router.push("/(tabs)/qr-code")}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
                </Pressable>
              </View>

              <Searchbar
                placeholder="Search news, creators, games..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchbar}
                inputStyle={styles.searchInput}
                placeholderTextColor={colors.textMuted}
                iconColor={colors.textMuted}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {categories.map((category) => {
                  const isActive = category.id === activeCategory;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setActiveCategory(category.id)}
                      style={[
                        styles.pill,
                        isActive ? styles.pillActive : undefined,
                      ]}
                    >
                      <Text style={[styles.pillText, isActive ? styles.pillTextActive : undefined]}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </AnimatedEntrance>
        }
        renderItem={({ item, index }) => {
          const isLiked = liked.includes(item.id);
          const isSaved = saved.includes(item.id);

          return (
            <AnimatedEntrance delay={80 + index * 80}>
              <View
                style={[
                  styles.card,
                  {
                    marginHorizontal: responsive.horizontalPadding,
                    borderRadius: responsive.cardRadius,
                    maxWidth: responsive.contentMaxWidth,
                    alignSelf: "center",
                    width: "100%",
                  },
                ]}
              >
                <View style={styles.postHeader}>
                  <Image source={{ uri: authorAvatars[item.author] }} style={styles.avatar} />
                  <View style={styles.postHeaderText}>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                  <Pressable hitSlop={8}>
                    <MaterialCommunityIcons
                      name="dots-horizontal"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>

                <View style={styles.mediaWrap}>
                  <Image source={{ uri: item.thumbnail }} style={styles.media} />

                  {item.type === "video" && (
                    <View style={styles.videoPlayWrap}>
                      <View style={styles.videoPlayInner}>
                        <MaterialCommunityIcons name="play" size={26} color="#1A1A1A" />
                      </View>
                    </View>
                  )}

                  {item.duration ? (
                    <View style={styles.durationBadge}>
                      <MaterialCommunityIcons name="play" size={12} color={colors.text} />
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                  ) : null}

                  <View style={styles.titleOverlay}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <View style={styles.actionsLeft}>
                    <Pressable onPress={() => toggleLike(item.id)} style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={isLiked ? colors.destructive : colors.textSecondary}
                      />
                      <Text style={styles.actionCount}>{item.likes + (isLiked ? 1 : 0)}</Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name="message-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.actionCount}>{item.comments}</Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name="share-variant-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <Pressable onPress={() => toggleSave(item.id)}>
                    <MaterialCommunityIcons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={isSaved ? colors.primary : colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </AnimatedEntrance>
          );
        }}
        ListEmptyComponent={
          <View style={[styles.emptyState, { paddingHorizontal: responsive.horizontalPadding }]}> 
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyCopy}>Try a different search or category.</Text>
          </View>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 110,
  },
  headerWrap: {
    paddingTop: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  searchbar: {
    backgroundColor: "#242424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  pillsRow: {
    paddingBottom: spacing.sm,
  },
  pill: {
    marginRight: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  pillTextActive: {
    color: "#1A1A1A",
  },
  card: {
    marginTop: spacing.md,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: "#444",
  },
  postHeaderText: {
    flex: 1,
  },
  author: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  date: {
    color: "#777",
    marginTop: 2,
    fontSize: 11,
  },
  mediaWrap: {
    position: "relative",
  },
  media: {
    width: "100%",
    height: 200,
  },
  videoPlayWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: "rgba(26,26,26,0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    color: colors.text,
    marginLeft: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(26,26,26,0.35)",
  },
  itemTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 17,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  actionCount: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyCopy: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.8,
  },
});
