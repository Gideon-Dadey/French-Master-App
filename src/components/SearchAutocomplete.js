import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { coursesAPI } from '../services/api';
import { spacing, fontSize } from '../utils/responsive';

export default function SearchAutocomplete({ onSelect, placeholder = "Search courses..." }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        searchCourses(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const searchCourses = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await coursesAPI.search(searchQuery);
      setSuggestions(response.data.data?.slice(0, 5) || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (course) => {
    setQuery(course.title);
    setShowSuggestions(false);
    onSelect?.(course);
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="search-outline" size={20} color={colors.secondaryText} />
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.suggestionMeta, { color: colors.secondaryText }]} numberOfLines={1}>
          {item.category} • {item.level} • {item.instructor?.name || 'Instructor'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor: colors.secondaryBackground, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        )}
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>
      )}

      {showSuggestions && query.length > 2 && suggestions.length === 0 && !loading && (
        <View style={[styles.noResults, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={32} color={colors.secondaryText} />
          <Text style={[styles.noResultsText, { color: colors.secondaryText }]}>
            No courses found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  loader: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: spacing.md,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  suggestionMeta: {
    fontSize: fontSize.xs,
  },
  noResults: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    padding: spacing.xl,
    borderRadius: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  noResultsText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
});

