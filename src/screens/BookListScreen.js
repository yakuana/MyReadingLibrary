import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBooks } from '../context/BooksContext';
import BookCard from '../components/BookCard';

export default function BookListScreen({ navigation }) {
  const { books } = useBooks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Books</Text>
        <Text style={styles.count}>{books.length} books read</Text>
      </View>

      {/* Book list */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No books yet.</Text>
            <Text style={styles.emptySubtext}>Start adding books you've read!</Text>
          </View>
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
  list: {
    paddingVertical: 12,
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
