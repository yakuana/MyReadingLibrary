import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import StarRating from './StarRating';

// A tappable card representing a single book in the list.
// Props:
//   book     — book object from initialBooks
//   onPress  — called when the card is tapped
export default function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Cover image — shows a placeholder if no image is available */}
      <View style={styles.cover}>
        {book.coverImage ? (
          <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverInitial}>{book.title[0]}</Text>
          </View>
        )}
      </View>

      {/* Book info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{book.genre}</Text>
        </View>
        <StarRating rating={book.rating} size={14} />
      </View>

      {/* Favorite indicator */}
      {book.favorite && <Text style={styles.favorite}>♥</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
  },
  cover: {
    marginRight: 12,
  },
  coverImage: {
    width: 64,
    height: 90,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 64,
    height: 90,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  author: {
    fontSize: 14,
    color: colors.subtext,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genreText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favorite: {
    fontSize: 16,
    color: colors.accent,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
});
