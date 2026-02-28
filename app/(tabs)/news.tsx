import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet } from "react-native";
import { PostCard } from "../../src/components/PostCard";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockPosts } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

// NewsScreen: Tab 1 - Gaming news feed with category filtering
// Backend integration: Posts fetched from /api/posts?category={category} endpoint in Phase B
// State: activeCategory (filter), likedPosts, savedPosts (local)

export default function NewsScreen() {
  const [activeCategory, setActiveCategory] = useState<
    "fyp" | "esports" | "patches" | "streams"
  >("fyp");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    return mockPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

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

  const categories: Array<{
    id: "fyp" | "esports" | "patches" | "streams";
    label: string;
  }> = [
    { id: "fyp", label: "For You" },
    { id: "esports", label: "Esports" },
    { id: "patches", label: "Patches" },
    { id: "streams", label: "Streams" },
  ];

  return (
    <Screen scrollable={false}>
      <Header title="News Feed" />

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            selected={activeCategory === cat.id}
            onPress={() => setActiveCategory(cat.id)}
            style={styles.filterChip}
            selectedColor={colors.primary}
            mode={activeCategory === cat.id ? "flat" : "outlined"}
          />
        ))}
      </ScrollView>

      {/* Posts list */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isLiked={likedPosts.includes(item.id)}
            isSaved={savedPosts.includes(item.id)}
            onLike={handleLike}
            onSave={handleSave}
          />
        )}
        scrollEnabled={false}
        style={styles.postList}
        contentContainerStyle={styles.postListContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    paddingVertical: spacing.md,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  postList: {
    flex: 1,
  },
  postListContent: {
    paddingHorizontal: spacing.md,
  },
});
