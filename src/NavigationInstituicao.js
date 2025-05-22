import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

import HomeScreen from './screens/screensInstituicao/Home';
import EventosScreen from './screens/screensInstituicao/EventosInstitution';
import ProfessoresStack from './stacks/ProfessoresStack';
import NotasStack from './stacks/EditarTurmasStack';

import { useTheme } from './path/ThemeContext';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// Animações para botão da tab (mantidas)
Animatable.initializeRegistryWithDefinitions({
  slideUpBackground: {
    from: { transform: [{ scaleY: 0 }], opacity: 0 },
    to: { transform: [{ scaleY: 1 }], opacity: 1 },
  },
});

// Wrapper animado para cada tela da tab
const TabScreenWrapper = ({ children, index, currentIndex }) => {
  const { isDarkMode } = useTheme();
  const translateX = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Anima a opacidade para não ficar transparente demais (evita corte branco)
    Animated.timing(opacity, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(translateX, {
        toValue: (index - currentIndex) * width,
        useNativeDriver: true,
        tension: 1000,
        friction: 100,
      }).start(() => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    });
  }, [currentIndex]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
        transform: [{ translateX }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

const TabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.tabButtonContainer}
    >
      <View style={[styles.animatedButton, focused && styles.focusedButton]}>
        {focused && (
          <Animatable.View
            animation="slideUpBackground"
            duration={400}
            style={styles.backgroundOverlay}
          />
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default function NavigationDocente() {
  const { isDarkMode } = useTheme();
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0);

  const getTabIndex = (routeName) => {
    const routes = ['Home', 'Turmas', 'Eventos', 'FeedbackTab'];
    return routes.indexOf(routeName);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
      <Tab.Navigator
        sceneContainerStyle={{
          backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
        }}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#000' : '#F7F9FC',
            height: 55,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            position: 'absolute',
            borderTopWidth: 0,
          },
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarIcon: ({ focused }) => {
            let iconName;
            let color = focused ? '#0077FF' : '#A0A0A0';

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Turmas':
                iconName = 'users';
                break;
              case 'Eventos':
                iconName = 'calendar';
                break;
              case 'FeedbackTab':
                iconName = 'message-circle';
                break;
              default:
                iconName = 'help-circle';
            }

            return (
              <Animatable.View
                animation={focused ? 'pulse' : undefined}
                duration={8000}
                useNativeDriver
              >
                <Icon name={iconName} size={26} color={color} />
              </Animatable.View>
            );
          },
        })}
        screenListeners={{
          tabPress: (e) => {
            const routeName = e.target.split('-')[0];
            setCurrentTabIndex(getTabIndex(routeName));
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          children={(props) => (
            <TabScreenWrapper index={0} currentIndex={currentTabIndex}>
              <HomeScreen {...props} />
            </TabScreenWrapper>
          )}
        />
        <Tab.Screen 
          name="Turmas" 
          children={(props) => (
            <TabScreenWrapper index={1} currentIndex={currentTabIndex}>
              <NotasStack {...props} />
            </TabScreenWrapper>
          )}
        />
        <Tab.Screen 
          name="Eventos" 
          children={(props) => (
            <TabScreenWrapper index={2} currentIndex={currentTabIndex}>
              <EventosScreen {...props} />
            </TabScreenWrapper>
          )}
        />
        <Tab.Screen 
          name="FeedbackTab" 
          children={(props) => (
            <TabScreenWrapper index={3} currentIndex={currentTabIndex}>
              <ProfessoresStack {...props} />
            </TabScreenWrapper>
          )}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
  },
  animatedButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  focusedButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#0077FF',
  },
  backgroundOverlay: {
    backgroundColor: 'rgba(0, 119, 255, 0.1)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    height: '100%',
    width: '100%',
  },
});
