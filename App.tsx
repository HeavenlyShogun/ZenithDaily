import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './src/screens/DashboardScreen';
import TodoScreen from './src/screens/TodoScreen';
import JournalScreen from './src/screens/JournalScreen';
import { Colors } from './src/theme/colors';
import { RootTabParamList } from './src/types/navigation';
import { LayoutDashboard, ListTodo, BookHeart } from 'lucide-react-native';
import { initDatabase } from './src/database/db';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  // 當 App 啟動時自動初始化 SQLite 資料庫與資料表
  useEffect(() => {
    async function setupDB() {
      try {
        await initDatabase();
        console.log('🎉 SQLite 資料庫初始化成功！');
      } catch (error) {
        console.error('SQLite 資料庫初始化失敗:', error);
      }
    }
    setupDB();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              const iconSize = 22;
              if (route.name === 'Dashboard') {
                return <LayoutDashboard size={iconSize} color={color} />;
              } else if (route.name === 'Todo') {
                return <ListTodo size={iconSize} color={color} />;
              } else if (route.name === 'Journal') {
                return <BookHeart size={iconSize} color={color} />;
              }
              return null;
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.secondary,
            tabBarStyle: {
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: '今日律動' }}
          />
          <Tab.Screen 
            name="Todo" 
            component={TodoScreen} 
            options={{ title: '智慧待辦' }}
          />
          <Tab.Screen 
            name="Journal" 
            component={JournalScreen} 
            options={{ title: '反思手帳' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
