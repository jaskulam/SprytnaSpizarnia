import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftIcon?: string;
  rightIcon?: string;
  leftColor?: string;
  rightColor?: string;
  leftText?: string;
  rightText?: string;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftIcon = 'check',
  rightIcon = 'delete',
  leftColor = '#4CAF50',
  rightColor = '#F44336',
  leftText = '',
  rightText = '',
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const actionThreshold = screenWidth * 0.3;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        
        if (dx > actionThreshold && onSwipeRight) {
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
            translateX.setValue(0);
          });
        } else if (dx < -actionThreshold && onSwipeLeft) {
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const leftActionOpacity = translateX.interpolate({
    inputRange: [0, actionThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = translateX.interpolate({
    inputRange: [-actionThreshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {onSwipeRight && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            { backgroundColor: leftColor, opacity: leftActionOpacity },
          ]}
        >
          <Icon name={leftIcon} size={24} color="#FFFFFF" />
          {leftText ? <Text style={styles.actionText}>{leftText}</Text> : null}
        </Animated.View>
      )}
      
      {onSwipeLeft && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            { backgroundColor: rightColor, opacity: rightActionOpacity },
          ]}
        >
          {rightText ? <Text style={styles.actionText}>{rightText}</Text> : null}
          <Icon name={rightIcon} size={24} color="#FFFFFF" />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    backgroundColor: '#FFFFFF',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  leftAction: {
    left: 0,
    justifyContent: 'flex-start',
  },
  rightAction: {
    right: 0,
    justifyContent: 'flex-end',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default SwipeableListItem;
