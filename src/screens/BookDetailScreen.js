import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

// Consistent spine-color for the cover placeholder, seeded by book id
const SPINE_COLORS = [
  '#8B2635', '#1B3D72', '#1C5631', '#7A5C08',
  '#4A2A5C', '#1A4A6A', '#6A3C12', '#7A2C00',
];
function placeholderColor(id = '') {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return SPINE_COLORS[hash % SPINE_COLORS.length];
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BookDetailScreen({ navigation, route }) {
  const { book } = route.params;
  const { isOwner } = useAuth();
  const isReading = book.status === 'reading';

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back to Shelf</Text>
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover image floats above the card */}
          <View style={styles.coverSection}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: placeholderColor(book.id) }]}>
                <Text style={styles.coverInitial}>{book.title[0]}</Text>
              </View>
            )}
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>

            {!isReading && book.rating != null && (
              <View style={styles.ratingRow}>
                <StarRating rating={book.rating} size={22} />
              </View>
            )}
          </View>

          {/* Review card — parchment on dark library wall */}
          <View style={styles.reviewCard}>

            {/* Meta chips */}
            <View style={styles.metaRow}>
              {book.genre ? <MetaChip label={book.genre} /> : null}
              {book.pageCount ? <MetaChip label={`${book.pageCount} pages`} /> : null}
              {book.favorite ? <MetaChip label="♥ Favourite" accent /> : null}
              {isReading ? <MetaChip label="Currently reading" reading /> : null}
            </View>

            <View style={styles.divider} />

            {/* Date line */}
            <Text style={styles.dateLine}>
              {isReading
                ? `Started reading: ${formatDate(book.dateStarted)}`
                : `Finished: ${formatDate(book.dateRead)}`}
            </Text>

            {/* Review / notes */}
            {book.notes ? (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>My Review</Text>
                <Text style={styles.reviewText}>{book.notes}</Text>
              </View>
            ) : (
              <View style={styles.noReviewSection}>
                <Text style={styles.noReviewText}>
                  {isOwner ? 'Tap Edit to add your review.' : 'No review written yet.'}
                </Text>
              </View>
            )}

          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MetaChip({ label, accent, reading }) {
  let bg    = '#EAD8B8';
  let border = '#D4BC90';
  let text  = '#5A3A18';
  if (accent) { bg = '#8B2635'; border = '#6B1825'; text = '#F5EDD8'; }
  if (reading) { bg = '#1A4A6A'; border = '#0E3050'; text = '#C8E0F0'; }

  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.chipText, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0E06',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A1A0A',
  },
  backButton: {},
  backText: {
    fontSize: 15, color: '#C8923A', fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#C8923A',
    borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  editText: {
    fontSize: 14, fontWeight: '700', color: '#1A0E06',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Cover + title area — sits above the card on the dark "wall"
  coverSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  coverImage: {
    width: 130, height: 190,
    borderRadius: 6,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 12,
  },
  coverPlaceholder: {
    width: 130, height: 190,
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 12,
  },
  coverInitial: {
    fontSize: 64, fontWeight: 'bold', color: 'rgba(255,255,255,0.88)',
  },
  title: {
    fontSize: 22, fontWeight: '800',
    color: '#E8C070',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  author: {
    fontSize: 15, color: '#9A7848',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  ratingRow: {
    marginTop: 2,
  },

  // Parchment review card
  reviewCard: {
    backgroundColor: '#F5EDD8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12, fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#D4BC90',
    marginBottom: 14,
  },

  dateLine: {
    fontSize: 13, color: '#8A6A40',
    fontStyle: 'italic',
    marginBottom: 18,
  },

  // Review section — slight inset paper feel
  reviewSection: {
    backgroundColor: '#FBF4E4',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C8923A',
  },
  reviewLabel: {
    fontSize: 10, fontWeight: '800',
    color: '#9A7040',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 15, color: '#3A2810',
    lineHeight: 25,
    fontStyle: 'italic',
  },

  noReviewSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noReviewText: {
    fontSize: 14, color: '#A09060',
    fontStyle: 'italic',
  },
});
