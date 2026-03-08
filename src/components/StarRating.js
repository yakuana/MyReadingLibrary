import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

// Displays a row of filled/empty stars based on a numeric rating (1-5).
// Props:
//   rating  — number (1–5)
//   size    — optional font size for the stars (default 16)
export default function StarRating({ rating, size = 16 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={[styles.star, { fontSize: size, color: star <= rating ? colors.star : colors.border }]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
});
