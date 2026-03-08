import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function BookDetailScreen({ navigation, route }) {
  const { book } = route.params;
  const { isOwner } = useAuth();

  const isReading = book.status === 'reading';

  function formatDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  const dateLabel = isReading ? 'Started' : 'Date Read';
  const dateValue = isReading ? formatDate(book.dateStarted) : formatDate(book.dateRead);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar: back + optional edit */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditBook', { book })}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover image */}
        {book.coverImage ? (
          <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverInitial}>{book.title[0]}</Text>
          </View>
        )}

        {/* Title & author */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>by {book.author}</Text>

        {/* Rating — only for finished books */}
        {!isReading && (
          <View style={styles.ratingRow}>
            <StarRating rating={book.rating} size={24} />
            <Text style={styles.ratingLabel}>{book.rating} / 5</Text>
          </View>
        )}

        {/* Metadata grid */}
        <View style={styles.metaGrid}>
          <MetaItem label="Genre" value={book.genre} />
          {book.pageCount ? <MetaItem label="Pages" value={`${book.pageCount}`} /> : null}
          <MetaItem label={dateLabel} value={dateValue} />
          <MetaItem label="Favourite" value={book.favorite ? 'Yes ♥' : 'No'} isLast />
        </View>

        {/* Notes */}
        {book.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>My Notes</Text>
            <Text style={styles.notesText}>{book.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value, isLast }) {
  return (
    <View style={[styles.metaItem, isLast && styles.metaItemLast]}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {},
  backText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  coverImage: {
    width: 120,
    height: 170,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  coverPlaceholder: {
    width: 120,
    height: 170,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  coverInitial: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.subtext,
  },
  metaGrid: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaItemLast: {
    borderBottomWidth: 0,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.subtext,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  notesCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
