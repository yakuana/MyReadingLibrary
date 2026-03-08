import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooks } from '../context/BooksContext';

const SHELF_H_PADDING = 16;
const BOOK_GAP = 3;
const BOOKS_PER_SHELF = 5;
const MIN_SHELVES = 5;

// Rich jewel-tone and earth-tone spine colors
const SPINE_COLORS = [
  '#8B2635', // crimson
  '#1B3D72', // navy
  '#1C5631', // forest green
  '#7A5C08', // dark olive
  '#5C2200', // burnt sienna
  '#4A2A5C', // deep purple
  '#1A4A6A', // dark teal
  '#6A3C12', // warm brown
  '#2A2A2A', // near black
  '#3A1A50', // plum
  '#A02020', // deep red
  '#1E5C8A', // slate blue
  '#0E6E5C', // dark teal green
  '#8A6010', // amber
  '#7A2C00', // rust
  '#503070', // violet
  '#2E5018', // dark olive green
  '#6B1A3A', // burgundy
];

// Varying heights (px) — tall art books, slim novellas, average novels
const HEIGHT_VARIANTS = [148, 128, 160, 118, 143, 133, 156, 122, 140, 150, 124, 158, 136, 144, 120, 152];

// Varying widths (px) — thick tomes, slim books
const WIDTH_VARIANTS = [42, 36, 50, 38, 48, 40, 54, 34, 44, 46, 37, 52, 39, 47, 55, 33, 43, 49];

const MAX_BOOK_HEIGHT = Math.max(...HEIGHT_VARIANTS);

function getBookProps(index) {
  return {
    bookHeight: HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length],
    bookWidth: WIDTH_VARIANTS[index % WIDTH_VARIANTS.length],
    spineColor: SPINE_COLORS[index % SPINE_COLORS.length],
  };
}

function BookSpine({ book, globalIndex, onPress }) {
  const { bookHeight, bookWidth, spineColor } = getBookProps(globalIndex);

  // Inner rotated text container dimensions
  const innerW = bookHeight - 24;
  const innerH = bookWidth - 10;
  const innerLeft = (bookWidth - innerW) / 2;
  const innerTop = (bookHeight - innerH) / 2;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72} style={{ alignSelf: 'flex-end' }}>
      <View
        style={{
          width: bookWidth,
          height: bookHeight,
          backgroundColor: spineColor,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        {/* Left edge highlight — simulates rounded spine */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 6,
            height: bookHeight,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        />

        {/* Right edge shadow */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 4,
            height: bookHeight,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        />

        {/* Top decorative band */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.15)',
          }}
        />

        {/* Bottom decorative band */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: 'rgba(0,0,0,0.22)',
          }}
        />

        {/* Rotated title + author, reading bottom-to-top */}
        <View
          style={{
            position: 'absolute',
            width: innerW,
            height: innerH,
            left: innerLeft,
            top: innerTop,
            transform: [{ rotate: '-90deg' }],
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: 0.4,
              textAlign: 'center',
            }}
          >
            {book.title}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 2,
              textAlign: 'center',
            }}
          >
            {book.author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Shelf({ shelfBooks, shelfIndex, onBookPress }) {
  return (
    <View style={styles.shelfWrapper}>
      {/* Books sit on shelf, aligned to bottom */}
      <View style={[styles.booksRow, { minHeight: MAX_BOOK_HEIGHT }]}>
        {shelfBooks.map((book, i) =>
          book ? (
            <BookSpine
              key={book.id}
              book={book}
              globalIndex={shelfIndex * BOOKS_PER_SHELF + i}
              onPress={() => onBookPress(book)}
            />
          ) : null
        )}
      </View>

      {/* Wooden shelf plank with depth layers */}
      <View style={styles.shelfPlank}>
        <View style={styles.plankFace} />
        <View style={styles.plankEdge} />
        <View style={styles.plankShadow} />
      </View>
    </View>
  );
}

export default function BookshelfScreen({ navigation }) {
  const { books } = useBooks();
  const readBooks = useMemo(() => books.filter((b) => b.status === 'read'), [books]);

  const shelves = useMemo(() => {
    const result = [];
    for (let i = 0; i < readBooks.length; i += BOOKS_PER_SHELF) {
      result.push(readBooks.slice(i, i + BOOKS_PER_SHELF));
    }
    while (result.length < MIN_SHELVES) {
      result.push([]);
    }
    return result;
  }, [readBooks]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark walnut header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Bookshelf</Text>
          <Text style={styles.headerSubtitle}>{readBooks.length} books read</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 28 }} />
        {shelves.map((shelfBooks, index) => (
          <Shelf
            key={index}
            shelfBooks={shelfBooks}
            shelfIndex={index}
            onBookPress={(book) => navigation.navigate('BookDetail', { book })}
          />
        ))}
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Warm parchment library wall
  container: {
    flex: 1,
    backgroundColor: '#C9B99A',
  },

  // Dark walnut header bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#2C1A0E',
    borderBottomWidth: 3,
    borderBottomColor: '#1A0E06',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: '#D4A86A',
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0DDB0',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A08860',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  scrollContent: {
    paddingHorizontal: SHELF_H_PADDING,
  },

  // Each shelf unit (books + plank)
  shelfWrapper: {
    marginBottom: 36,
  },

  // Row of book spines, bottom-aligned
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BOOK_GAP,
  },

  // Three-layer wooden shelf plank
  shelfPlank: {
    width: '100%',
    marginTop: 1,
  },
  plankFace: {
    height: 14,
    backgroundColor: '#9A6432',
    // Subtle horizontal grain lines via border
    borderTopWidth: 1,
    borderTopColor: '#B87840',
    borderBottomWidth: 1,
    borderBottomColor: '#7A4A20',
  },
  plankEdge: {
    height: 8,
    backgroundColor: '#6A3E18',
  },
  plankShadow: {
    height: 6,
    backgroundColor: '#2E160A',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    // Drop shadow below shelf
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});
