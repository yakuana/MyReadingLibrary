import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBooks } from '../context/BooksContext';
import { useAuth } from '../context/AuthContext';

// Construct the cover image URL from OpenLibrary cover id
function coverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

// Today's date as YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function AddBookScreen({ navigation }) {
  const { addBook } = useBooks();
  const { isOwner } = useAuth();

  // Redirect non-owners away immediately
  if (!isOwner) {
    navigation.goBack();
    return null;
  }

  // --- Search phase state ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // --- Form phase state ---
  const [selectedBook, setSelectedBook] = useState(null); // OpenLibrary result
  const [status, setStatus] = useState('read');
  const [dateRead, setDateRead] = useState(todayISO());
  const [dateStarted, setDateStarted] = useState(todayISO());
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    setResults([]);
    try {
      const url =
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}` +
        `&fields=key,title,author_name,cover_i,subject,number_of_pages_median&limit=10`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.docs ?? []);
      if ((data.docs ?? []).length === 0) setSearchError('No results found.');
    } catch {
      setSearchError('Search failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  }

  function handleSelectResult(item) {
    setSelectedBook(item);
    setQuery('');
    setResults([]);
    setSearchError('');
  }

  function handleSave() {
    if (!selectedBook) return;
    const newBook = {
      id: Date.now().toString(),
      title: selectedBook.title ?? 'Unknown Title',
      author: selectedBook.author_name?.[0] ?? 'Unknown Author',
      genre: selectedBook.subject?.[0] ?? 'Unknown',
      coverImage: coverUrl(selectedBook.cover_i),
      pageCount: selectedBook.number_of_pages_median ?? null,
      notes,
      favorite,
      status,
      dateStarted: status === 'reading' ? dateStarted : null,
      dateRead: status === 'read' ? dateRead : null,
      rating: status === 'read' ? rating : null,
    };
    addBook(newBook);
    navigation.goBack();
  }

  // ─── Search phase ─────────────────────────────────────────────────────────
  if (!selectedBook) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Book</Text>
          <View style={{ width: 56 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Search bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by title or author..."
              placeholderTextColor={colors.subtext}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {searching && (
            <ActivityIndicator
              style={{ marginTop: 40 }}
              color={colors.accent}
              size="large"
            />
          )}

          {/* Error */}
          {!!searchError && (
            <Text style={styles.errorText}>{searchError}</Text>
          )}

          {/* Results */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.resultsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => handleSelectResult(item)}
                activeOpacity={0.75}
              >
                {/* Cover thumbnail */}
                <View style={styles.resultCover}>
                  {item.cover_i ? (
                    <Image
                      source={{ uri: coverUrl(item.cover_i) }}
                      style={styles.resultCoverImage}
                    />
                  ) : (
                    <View style={styles.resultCoverPlaceholder}>
                      <Text style={styles.resultCoverInitial}>
                        {(item.title ?? '?')[0]}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.resultAuthor} numberOfLines={1}>
                    {item.author_name?.[0] ?? 'Unknown Author'}
                  </Text>
                  {item.first_publish_year ? (
                    <Text style={styles.resultMeta}>
                      {item.first_publish_year}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── Form phase ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedBook(null)}>
          <Text style={styles.cancel}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Book</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Selected book summary */}
          <View style={styles.selectedBookRow}>
            {selectedBook.cover_i ? (
              <Image
                source={{ uri: coverUrl(selectedBook.cover_i) }}
                style={styles.formCoverImage}
              />
            ) : (
              <View style={styles.formCoverPlaceholder}>
                <Text style={styles.formCoverInitial}>
                  {(selectedBook.title ?? '?')[0]}
                </Text>
              </View>
            )}
            <View style={styles.selectedBookInfo}>
              <Text style={styles.selectedTitle} numberOfLines={3}>
                {selectedBook.title}
              </Text>
              <Text style={styles.selectedAuthor}>
                {selectedBook.author_name?.[0] ?? 'Unknown Author'}
              </Text>
            </View>
          </View>

          {/* Status toggle */}
          <Text style={styles.label}>Reading Status</Text>
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'reading' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('reading')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'reading' && styles.statusButtonTextActive,
                ]}
              >
                Currently Reading
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'read' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('read')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'read' && styles.statusButtonTextActive,
                ]}
              >
                Finished
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date fields */}
          {status === 'reading' ? (
            <>
              <Text style={styles.label}>Date Started</Text>
              <TextInput
                style={styles.textInput}
                value={dateStarted}
                onChangeText={setDateStarted}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtext}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Date Finished</Text>
              <TextInput
                style={styles.textInput}
                value={dateRead}
                onChangeText={setDateRead}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtext}
              />

              {/* Rating (only for finished books) */}
              <Text style={styles.label}>Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text
                      style={[styles.star, star <= rating && styles.starFilled]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingValue}>{rating} / 5</Text>
              </View>
            </>
          )}

          {/* Notes */}
          <Text style={styles.label}>My Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write your thoughts..."
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
          />

          {/* Favorite */}
          <View style={styles.favoriteRow}>
            <Text style={styles.label}>Favourite</Text>
            <Switch
              value={favorite}
              onValueChange={setFavorite}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={favorite ? colors.primary : '#FFF'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  cancel: {
    fontSize: 16,
    color: colors.subtext,
    minWidth: 56,
  },
  save: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 56,
    textAlign: 'right',
  },

  // ── Search phase ──
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: colors.subtext,
    marginTop: 24,
    fontSize: 15,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  resultCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  resultCover: {
    marginRight: 12,
  },
  resultCoverImage: {
    width: 44,
    height: 62,
    borderRadius: 4,
  },
  resultCoverPlaceholder: {
    width: 44,
    height: 62,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCoverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  resultAuthor: {
    fontSize: 13,
    color: colors.subtext,
  },
  resultMeta: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
  },

  // ── Form phase ──
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  selectedBookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 14,
  },
  formCoverImage: {
    width: 64,
    height: 90,
    borderRadius: 6,
  },
  formCoverPlaceholder: {
    width: 64,
    height: 90,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCoverInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  selectedBookInfo: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  selectedAuthor: {
    fontSize: 14,
    color: colors.subtext,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtext,
  },
  statusButtonTextActive: {
    color: '#FFF',
  },
  textInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 28,
  },
  star: {
    fontSize: 36,
    color: colors.border,
  },
  starFilled: {
    color: colors.star,
  },
  ratingValue: {
    fontSize: 14,
    color: colors.subtext,
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: 28,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
