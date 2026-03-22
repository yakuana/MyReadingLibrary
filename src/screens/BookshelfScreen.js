import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooks } from '../context/BooksContext';

const SPINE_COLORS = [
  '#8B2635', '#1B3D72', '#1C5631', '#7A5C08', '#5C2200',
  '#4A2A5C', '#1A4A6A', '#6A3C12', '#2A2A2A', '#3A1A50',
  '#A02020', '#1E5C8A', '#0E6E5C', '#8A6010', '#7A2C00',
  '#503070', '#2E5018', '#6B1A3A',
];

const HEIGHT_VARIANTS = [148, 128, 160, 118, 143, 133, 156, 122, 140, 150, 124, 158, 136, 144, 120, 152];
const WIDTH_VARIANTS  = [42, 36, 50, 38, 48, 40, 54, 34, 44, 46, 37, 52, 39, 47, 55, 33, 43, 49];
const MAX_BOOK_HEIGHT = Math.max(...HEIGHT_VARIANTS);
const BOOK_GAP = 4;

function getBookProps(index) {
  return {
    bookHeight: HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length],
    bookWidth:  WIDTH_VARIANTS[index % WIDTH_VARIANTS.length],
    spineColor: SPINE_COLORS[index % SPINE_COLORS.length],
  };
}

function BookSpine({ book, globalIndex, onPress }) {
  const { bookHeight, bookWidth, spineColor } = getBookProps(globalIndex);
  const innerW   = bookHeight - 20;
  const innerH   = bookWidth  - 8;
  const innerLeft = (bookWidth  - innerW) / 2;
  const innerTop  = (bookHeight - innerH) / 2;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72} style={{ alignSelf: 'flex-end' }}>
      <View style={{
        width: bookWidth,
        height: bookHeight,
        backgroundColor: spineColor,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.65,
        shadowRadius: 5,
      }}>
        {/* Left highlight — rounded spine illusion */}
        <View style={{
          position: 'absolute', left: 0, top: 0, width: 5, height: bookHeight,
          backgroundColor: 'rgba(255,255,255,0.22)',
        }} />
        {/* Right shadow */}
        <View style={{
          position: 'absolute', right: 0, top: 0, width: 5, height: bookHeight,
          backgroundColor: 'rgba(0,0,0,0.38)',
        }} />
        {/* Top decorative band */}
        <View style={{
          position: 'absolute', top: 0, left: 5, right: 5, height: 8,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.2)',
        }} />
        {/* Bottom band */}
        <View style={{
          position: 'absolute', bottom: 0, left: 5, right: 5, height: 8,
          backgroundColor: 'rgba(0,0,0,0.28)',
        }} />
        {/* Rotated title + author */}
        <View style={{
          position: 'absolute',
          width: innerW, height: innerH,
          left: innerLeft, top: innerTop,
          transform: [{ rotate: '-90deg' }],
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{
            fontSize: 9, fontWeight: '700',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: 0.5, textAlign: 'center',
          }}>{book.title}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{
            fontSize: 7.5, color: 'rgba(255,255,255,0.6)',
            marginTop: 2, textAlign: 'center',
          }}>{book.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Shelf({ shelfBooks, shelfIndex, onBookPress }) {
  return (
    <View style={styles.shelfWrapper}>
      {/* Books row — bottom-aligned so varying heights sit on the plank */}
      <View style={[styles.booksRow, { minHeight: MAX_BOOK_HEIGHT }]}>
        {shelfBooks.map((book, i) =>
          book ? (
            <BookSpine
              key={book.id}
              book={book}
              globalIndex={shelfIndex * 20 + i}
              onPress={() => onBookPress(book)}
            />
          ) : null
        )}
      </View>

      {/* Layered wooden shelf plank */}
      <View style={styles.shelfPlank}>
        <View style={styles.plankHighlight} />
        <View style={styles.plankFace} />
        <View style={styles.plankEdge} />
        <View style={styles.plankShadow} />
      </View>
    </View>
  );
}

export default function BookshelfScreen({ navigation }) {
  const { books } = useBooks();
  const { width }  = useWindowDimensions();

  const readBooks = useMemo(() => books.filter((b) => b.status === 'read'), [books]);

  // Adaptive: fit as many books as the screen allows
  const SHELF_H_PADDING = 32;
  const avgBookWidth    = 43;
  const booksPerShelf   = Math.max(3, Math.floor((width - SHELF_H_PADDING) / (avgBookWidth + BOOK_GAP)));

  const shelves = useMemo(() => {
    const result = [];
    for (let i = 0; i < readBooks.length; i += booksPerShelf) {
      result.push(readBooks.slice(i, i + booksPerShelf));
    }
    const MIN_SHELVES = 4;
    while (result.length < MIN_SHELVES) result.push([]);
    return result;
  }, [readBooks, booksPerShelf]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header — warm gold on dark mahogany */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MY LIBRARY</Text>
          {readBooks.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {readBooks.length} {readBooks.length === 1 ? 'book' : 'books'}
            </Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Subtle top-of-wall lighting strip */}
      <View style={styles.ambientLight} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: SHELF_H_PADDING / 2 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 20 }} />
        {shelves.map((shelfBooks, index) => (
          <Shelf
            key={index}
            shelfBooks={shelfBooks}
            shelfIndex={index}
            onBookPress={(book) => navigation.navigate('BookDetail', { book })}
          />
        ))}

        {readBooks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Your shelves are empty.</Text>
            <Text style={styles.emptySubtext}>Books you've read will appear here.</Text>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0E06',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0D0700',
    borderBottomWidth: 2,
    borderBottomColor: '#3A1A0A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24, color: '#C8923A', fontWeight: '300',
  },
  headerCenter: {
    flex: 1, alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '800',
    color: '#E8C070',
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 11, color: '#7A5A30',
    marginTop: 2, letterSpacing: 1,
  },

  // Thin warm-light strip at top of the "room"
  ambientLight: {
    height: 3,
    backgroundColor: '#4A2E10',
    opacity: 0.6,
  },

  scrollContent: {},

  shelfWrapper: {
    marginBottom: 30,
  },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BOOK_GAP,
  },

  // Three-layer wooden plank
  shelfPlank: {
    width: '100%',
    marginTop: 1,
  },
  plankHighlight: {
    height: 2,
    backgroundColor: '#D4903A',
  },
  plankFace: {
    height: 16,
    backgroundColor: '#8A4E20',
    borderTopWidth: 1, borderTopColor: '#B07030',
    borderBottomWidth: 1, borderBottomColor: '#5A2E08',
  },
  plankEdge: {
    height: 8,
    backgroundColor: '#5A2808',
  },
  plankShadow: {
    height: 10,
    backgroundColor: '#0D0700',
    opacity: 0.85,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18, color: '#7A5A30',
    fontWeight: '600', textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13, color: '#4A3A20',
    marginTop: 8, textAlign: 'center', lineHeight: 20,
  },
});
