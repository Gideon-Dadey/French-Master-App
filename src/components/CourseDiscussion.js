import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { spacing, fontSize } from '../utils/responsive';

export default function CourseDiscussion({ courseId, comments = [] }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      _id: Date.now().toString(),
      user: {
        name: user?.name || 'You',
        avatar: user?.avatar,
      },
      text: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setLocalComments([comment, ...localComments]);
    setNewComment('');
  };

  const renderComment = ({ item }) => (
    <View style={[styles.comment, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <Image
        source={{ uri: item.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'User')}&background=1E88E5&color=fff&size=40` }}
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.text }]}>
            {item.user?.name || 'Anonymous'}
          </Text>
          <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.text}
        </Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.actionText, { color: colors.secondaryText }]}>
              {item.likes || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.actionText, { color: colors.secondaryText }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Course Discussion</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {localComments.length} {localComments.length === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.secondaryBackground, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Ask a question or share your thoughts..."
          placeholderTextColor={colors.secondaryText}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: colors.primary }]}
          onPress={handlePostComment}
          disabled={!newComment.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={localComments}
        renderItem={renderComment}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No comments yet. Be the first to start the discussion!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    flex: 1,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comment: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  commentAuthor: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: fontSize.xs,
  },
  commentText: {
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.xs,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

