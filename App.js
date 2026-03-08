import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/constants/colors';
import { BooksProvider } from './src/context/BooksContext';
import { AuthProvider } from './src/context/AuthContext';
import BookListScreen from './src/screens/BookListScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import SignInScreen from './src/screens/SignInScreen';
import EditBookScreen from './src/screens/EditBookScreen';
import AddBookScreen from './src/screens/AddBookScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
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
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="EditBook" component={EditBookScreen} />
            <Stack.Screen name="AddBook" component={AddBookScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </BooksProvider>
    </AuthProvider>
  );
}
