import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBooks } from '../context/BooksContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BookListScreen({ navigation }) {
  const { books } = useBooks();
  const { isOwner, signOut } = useAuth();

  const currentlyReading = books.filter((b) => b.status === 'reading');
  const readBooks = books.filter((b) => b.status !== 'reading');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
          <Text style={styles.title}>My Library</Text>
          <Text style={styles.count}>{readBooks.length} books read</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.analyticsButtonText}>📊</Text>
          </TouchableOpacity>
          {isOwner ? (
            <>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddBook')}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ownerBadge} onPress={signOut}>
                <Text style={styles.ownerBadgeText}>Owner  ✓</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.lockIcon}>🔒</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={readBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          currentlyReading.length > 0 ? (
            <View style={styles.currentlyReadingSection}>
              <Text style={styles.sectionHeading}>Currently Reading</Text>
              {currentlyReading.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.currentCard}
                  onPress={() => navigation.navigate('BookDetail', { book })}
                  activeOpacity={0.8}
                >
                  {book.coverImage ? (
                    <Image source={{ uri: book.coverImage }} style={styles.currentCoverImage} />
                  ) : (
                    <View style={styles.currentCoverPlaceholder}>
                      <Text style={styles.currentCoverInitial}>{book.title[0]}</Text>
                    </View>
                  )}
                  <View style={styles.currentInfo}>
                    <Text style={styles.currentTitle} numberOfLines={2}>{book.title}</Text>
                    <Text style={styles.currentAuthor}>{book.author}</Text>
                    <View style={styles.genreBadge}>
                      <Text style={styles.genreText}>{book.genre}</Text>
                    </View>
                    <Text style={styles.startedDate}>Started {formatDate(book.dateStarted)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {readBooks.length > 0 && (
                <Text style={styles.sectionHeading}>Read</Text>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          currentlyReading.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No books yet.</Text>
              <Text style={styles.emptySubtext}>Start adding books you've read!</Text>
            </View>
          ) : null
        }
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  count: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyticsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsButtonText: {
    fontSize: 18,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 22,
    color: '#FFF',
    lineHeight: 26,
    fontWeight: '400',
  },
  ownerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ownerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  list: {
    paddingVertical: 12,
  },
  currentlyReadingSection: {
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  currentCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  currentCoverImage: {
    width: 64,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
  },
  currentCoverPlaceholder: {
    width: 64,
    height: 90,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentCoverInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  currentInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  currentAuthor: {
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
  startedDate: {
    fontSize: 12,
    color: colors.subtext,
    fontStyle: 'italic',
  },
  separator: {
    height: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.subtext,
  },
});
