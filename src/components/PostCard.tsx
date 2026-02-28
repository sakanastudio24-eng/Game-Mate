import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../lib/theme';
import { Post } from '../lib/mockData';

// PostCard: Individual post in news feed
// Shows author, content, hashtags, like/comment/bookmark actions
// Backend integration: onLike() sends POST /api/posts/{id}/like in Phase B

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

export function PostCard({ post, isLiked, isSaved, onLike, onSave }: PostCardProps) {
  const timeAgo = getTimeAgo(post.timestamp);

  return (
    <View style={styles.card}>
      {/* Author header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorAvatar}>{post.authorAvatar}</Text>
          <View>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Hashtags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hashtagsContainer}>
        {post.hashtags.map((tag, idx) => (
          <Chip
            key={`${post.id}-${idx}`}
            label={`#${tag}`}
            mode="flat"
            size="small"
            style={styles.hashtag}
            textStyle={styles.hashtagText}
          />
        ))}
      </ScrollView>

      {/* Interaction buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={() => onLike(post.id)}
        >
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.actionText, isLiked && { color: colors.primary }]}>
            {post.likes}
          </Text>
        </Pressable>

        <Pressable style={[styles.actionButton, { opacity: 0.5 }]}>
          <MaterialCommunityIcons name="message-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={() => onSave(post.id)}
        >
          <MaterialCommunityIcons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.primary : colors.textMuted}
          />
        </Pressable>

        <Pressable style={[styles.actionButton, { opacity: 0.5 }]}>
          <MaterialCommunityIcons name="share-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

// Helper: format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    firstNames: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    fontSize: 32,
  },
  authorName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 12,
  },
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  hashtagsContainer: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  hashtag: {
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  hashtagText: {
    fontSize: 12,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
