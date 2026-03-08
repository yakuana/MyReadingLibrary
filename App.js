import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/constants/colors';
import { BooksProvider } from './src/context/BooksContext';
import BookListScreen from './src/screens/BookListScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <BooksProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="BookList" component={BookListScreen} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BooksProvider>
  );
}
