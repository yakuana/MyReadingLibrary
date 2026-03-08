import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBooks } from '../context/BooksContext';

export default function EditBookScreen({ navigation, route }) {
  const { book } = route.params;
  const { updateBook } = useBooks();

  const [rating, setRating] = useState(book.rating);
  const [notes, setNotes] = useState(book.notes ?? '');
  const [favorite, setFavorite] = useState(book.favorite);

  function handleSave() {
    updateBook({ ...book, rating, notes, favorite });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Review</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>

          {/* Star rating picker */}
          <Text style={styles.label}>Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.star, star <= rating && styles.starFilled]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingValue}>{rating} / 5</Text>
          </View>

          {/* Notes */}
          <Text style={styles.label}>My Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write your thoughts about this book..."
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
          />

          {/* Favourite toggle */}
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
  },
  save: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
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
    minHeight: 140,
    marginBottom: 28,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
