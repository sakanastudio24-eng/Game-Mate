import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Text, Chip, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { mockGroups } from '../../src/lib/mockData';
import { colors, spacing, typography } from '../../src/lib/theme';

// GroupDetailScreen: Shows group details, members, chat, events
// Backend integration: GET /api/groups/{id}, POST /api/groups/{id}/messages in Phase B
// Tabs: members, chat, events

export default function GroupDetailScreen() {
  const group = mockGroups[0]; // Mock: use first group
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'events'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; user: string; text: string }>>([
    { id: '1', user: 'ProPlayer_X', text: 'Who wants to ranked grind today?' },
    { id: '2', user: 'You', text: 'I\'m in! Let\'s go.' },
  ]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setMessages([...messages, { id: Date.now().toString(), user: 'You', text: chatMessage }]);
      setChatMessage('');
    }
  };

  return (
    <Screen scrollable={false}>
      <Header title={group.name} showBackButton onBack={() => {}} />

      {/* Group header info */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.gameName}>{group.game}</Text>
            <Text style={styles.description}>{group.description}</Text>
          </View>
          <Text style={styles.memberCount}>{group.memberCount}</Text>
        </View>

        <View style={styles.badges}>
          {group.mode === 'ranked' && (
            <Chip icon="star" label="Ranked" size="small" style={styles.badge} />
          )}
          {group.micRequired && (
            <Chip icon="microphone" label="Mic Required" size="small" style={styles.badge} />
          )}
          {group.minRank && (
            <Chip label={`${group.minRank}+`} size="small" style={styles.badge} />
          )}
        </View>
      </Card>

      {/* Tab selector */}
      <View style={styles.tabSelector}>
        {['members', 'chat', 'events'].map(tab => (
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'members' && (
        <FlatList
          data={group.members}
          keyExtractor={(_, idx) => `${idx}`}
          renderItem={({ item, index }) => (
            <View style={styles.memberItem}>
              <Text style={styles.memberAvatar}>👤</Text>
              <Text style={styles.memberName}>Member {index + 1}</Text>
              {index === 0 && <Chip label="Admin" size="small" style={styles.adminBadge} />}
            </View>
          )}
          scrollEnabled={false}
        />
      )}

      {activeTab === 'chat' && (
        <>
          <FlatList
            data={messages}
            keyExtractor={msg => msg.id}
            renderItem={({ item }) => (
              <View style={[styles.messageItem, item.user === 'You' && styles.messageItemOwn]}>
                <Text style={styles.messageUser}>{item.user}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            scrollEnabled={false}
            style={styles.chat}
          />

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Message group..."
              placeholderTextColor={colors.textMuted}
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <Pressable
              onPress={handleSendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <MaterialCommunityIcons name="send" size={20} color={colors.background} />
            </Pressable>
          </View>
        </>
      )}

      {activeTab === 'events' && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events scheduled</Text>
          <Text style={styles.emptySubtext}>Upcoming events will appear here</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  gameName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 200,
  },
  memberCount: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 24,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    marginRight: spacing.xs,
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
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
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  memberAvatar: {
    fontSize: 24,
  },
  memberName: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  adminBadge: {
    height: 24,
  },
  chat: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messageItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  messageItemOwn: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  messageUser: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
  },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
