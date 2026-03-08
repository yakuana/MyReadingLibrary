import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBooks } from '../context/BooksContext';

// ── Genre colour palette ────────────────────────────────────────────────────
const GENRE_COLORS = [
  '#C0714F', // terracotta
  '#4A3728', // deep brown
  '#7A9E7E', // sage green
  '#5B8DB8', // dusty blue
  '#C4A35A', // gold
  '#8B5E83', // mauve
  '#4A7C6F', // teal
  '#B5715A', // burnt sienna
  '#A0522D', // sienna
  '#6B8E6E', // fern
];

// ── Page-count categories ───────────────────────────────────────────────────
const PAGE_CATEGORIES = [
  { label: 'Picture / Early Readers', short: '≤ 40 pp', min: 0,   max: 40  },
  { label: 'Chapter / Middle Grade',  short: '41–150',  min: 41,  max: 150 },
  { label: 'Novella',                 short: '151–250', min: 151, max: 250 },
  { label: 'Standard Novel',          short: '251–400', min: 251, max: 400 },
  { label: 'Long Novel / Epic',       short: '401+ pp', min: 401, max: Infinity },
];

function daysBetween(startISO, endISO) {
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end   = new Date(ey, em - 1, ed);
  return Math.max(0, Math.round((end - start) / 86400000));
}

function categoryFor(pageCount) {
  if (!pageCount) return null;
  return PAGE_CATEGORIES.find((c) => pageCount >= c.min && pageCount <= c.max) ?? null;
}

// ── Genre breakdown bar ─────────────────────────────────────────────────────
function GenreBar({ genreCounts, total }) {
  if (total === 0) return null;
  const entries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  return (
    <View style={styles.genreBar}>
      {entries.map(([genre, count], i) => (
        <View
          key={genre}
          style={{
            flex: count,
            backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
          }}
        />
      ))}
    </View>
  );
}

export default function AnalyticsScreen({ navigation }) {
  const { books } = useBooks();

  const readBooks      = books.filter((b) => b.status === 'read');
  const readingBooks   = books.filter((b) => b.status === 'reading');
  const favoriteBooks  = books.filter((b) => b.favorite);

  // ── Genre counts (read books only) ───────────────────────────────────────
  const genreCounts = {};
  for (const book of readBooks) {
    const g = book.genre ?? 'Unknown';
    genreCounts[g] = (genreCounts[g] ?? 0) + 1;
  }
  const genreEntries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  // ── Reading pace (books with both dateStarted and dateRead) ───────────────
  const paceBooksRaw = readBooks.filter((b) => b.dateStarted && b.dateRead && b.pageCount);
  const paceByCategory = {};
  for (const book of paceBooksRaw) {
    const cat = categoryFor(book.pageCount);
    if (!cat) continue;
    const days = daysBetween(book.dateStarted, book.dateRead);
    if (!paceByCategory[cat.label]) paceByCategory[cat.label] = { total: 0, count: 0, short: cat.short };
    paceByCategory[cat.label].total += days;
    paceByCategory[cat.label].count += 1;
  }
  const paceEntries = PAGE_CATEGORIES
    .map((cat) => ({ ...cat, data: paceByCategory[cat.label] ?? null }))
    .filter((cat) => cat.data !== null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Summary stats ─────────────────────────────────────────────── */}
        <View style={styles.statRow}>
          <StatCard value={readBooks.length}    label="Books Read"        />
          <StatCard value={readingBooks.length} label="Reading Now"       />
          <StatCard value={favoriteBooks.length} label="Favourites"       />
        </View>

        {/* ── Genre breakdown ───────────────────────────────────────────── */}
        <SectionHeading title="Genres Read" />
        {genreEntries.length === 0 ? (
          <EmptyNote text="No finished books yet." />
        ) : (
          <View style={styles.card}>
            <GenreBar genreCounts={genreCounts} total={readBooks.length} />

            {/* Legend */}
            <View style={styles.legendList}>
              {genreEntries.map(([genre, count], i) => (
                <View key={genre} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }]} />
                  <Text style={styles.legendGenre} numberOfLines={1}>{genre}</Text>
                  <Text style={styles.legendCount}>{count} {count === 1 ? 'book' : 'books'}</Text>
                  <Text style={styles.legendPct}>
                    {Math.round((count / readBooks.length) * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Reading pace by book length ───────────────────────────────── */}
        <SectionHeading title="Avg. Days to Finish by Length" />
        {paceEntries.length === 0 ? (
          <EmptyNote text="No data yet — this fills in once you track books from start to finish." />
        ) : (
          <View style={styles.card}>
            {paceEntries.map((cat, i) => {
              const avg = Math.round(cat.data.total / cat.data.count);
              const isLast = i === paceEntries.length - 1;
              return (
                <View
                  key={cat.label}
                  style={[styles.paceRow, isLast && styles.paceRowLast]}
                >
                  <View style={styles.paceLeft}>
                    <Text style={styles.paceLabel}>{cat.label}</Text>
                    <Text style={styles.paceSub}>{cat.short} · {cat.data.count} {cat.data.count === 1 ? 'book' : 'books'}</Text>
                  </View>
                  <View style={styles.paceRight}>
                    <Text style={styles.paceValue}>{avg}</Text>
                    <Text style={styles.paceDaysLabel}>days</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeading({ title }) {
  return <Text style={styles.sectionHeading}>{title}</Text>;
}

function EmptyNote({ text }) {
  return (
    <View style={styles.emptyNote}>
      <Text style={styles.emptyNoteText}>{text}</Text>
    </View>
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
  back: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
    minWidth: 56,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Stat cards ──
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section heading ──
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },

  // ── Shared card ──
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 28,
  },

  // ── Genre bar ──
  genreBar: {
    width: '100%',
    height: 28,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },

  // ── Genre legend ──
  legendList: {
    marginTop: 16,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendGenre: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  legendCount: {
    fontSize: 13,
    color: colors.subtext,
    marginRight: 6,
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    width: 36,
    textAlign: 'right',
  },

  // ── Reading pace ──
  paceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paceRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  paceLeft: {
    flex: 1,
    marginRight: 12,
  },
  paceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  paceSub: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
  },
  paceRight: {
    alignItems: 'flex-end',
  },
  paceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accent,
  },
  paceDaysLabel: {
    fontSize: 11,
    color: colors.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Empty state ──
  emptyNote: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 28,
  },
  emptyNoteText: {
    fontSize: 14,
    color: colors.subtext,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
