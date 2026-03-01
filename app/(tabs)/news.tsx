import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { PostCard } from "../../src/components/PostCard";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockPosts } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

const categories = [
  { id: "fyp", label: "For You" },
  { id: "esports", label: "Esports" },
  { id: "patches", label: "Updates" },
  { id: "streams", label: "Streams" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export default function NewsScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("fyp");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    const categoryFiltered = mockPosts.filter(
      (post) => post.category === activeCategory,
    );
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryFiltered;

    return categoryFiltered.filter((post) => {
      const haystack = [
        post.authorName,
        post.game,
        post.content,
        ...post.hashtags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, searchQuery]);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const handleSave = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  return (
    <Screen scrollable={false} padded={false}>
      <Header title="News" subtitle="Fresh updates from your games" />

      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Search news, creators, games..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(post) => post.id}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.chipsRow}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  selected={activeCategory === cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  style={styles.filterChip}
                  mode={activeCategory === cat.id ? "flat" : "outlined"}
                  selectedColor={colors.primary}
                />
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isLiked={likedPosts.includes(item.id)}
            isSaved={savedPosts.includes(item.id)}
            onLike={handleLike}
            onSave={handleSave}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyCopy}>Try another search or category.</Text>
          </View>
        }
        style={styles.postList}
        contentContainerStyle={styles.postListContent}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  headerContent: {
    paddingTop: spacing.md,
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  postList: {
    flex: 1,
  },
  postListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyCopy: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
