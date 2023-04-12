import React, { useState, useCallback, useEffect, FC } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  TextStyle,
  View,
  LayoutChangeEvent,
} from 'react-native';

import { usePrevious } from './hooks/usePrevious';
import MaskedView from '@react-native-masked-view/masked-view';
import { transparentize } from 'polished';
import Reanimated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { windowWidth } from './constants/Sizes';
import { Colors } from './constants/Colors';

const START_POINT = { x: 0, y: 0 };
const END_POINT = { x: 1, y: 0 };
const DELAY = 4000;

interface IProps {
  children: string;
  delayMs?: number;
  marginLeft?: number;
  speed?: number;
  textColor?: string;
  fontStyle?: StyleProp<
    Pick<TextStyle, 'fontFamily' | 'fontSize' | 'fontWeight'>
  >;
}

export const RevolvingText: FC<IProps> = ({
  children,
  delayMs,
  speed = 50,
  fontStyle,
  textColor,
  marginLeft = 0,
}) => {
  const xOffset = useSharedValue(0);

  const [viewWidth, setViewWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [textHeight, setTextHeight] = useState<number>(0);
  const [shouldReset, setShouldReset] = useState(false);

  const prevTextWidth = usePrevious(textWidth);

  const widthsDefined = textWidth && viewWidth;
  const textOverflowing = textWidth > viewWidth;
  const textWidthChanged = prevTextWidth !== textWidth;

  const color = textColor ?? Colors.white;

  const colors = [
    transparentize(1, color),
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    transparentize(1, color),
  ];

  const animateText = useCallback((): void => {
    const delay = delayMs ?? DELAY;
    const viewWidthRatio = viewWidth ? viewWidth / windowWidth : 1;
    const distance1 = textWidth;
    const distance2 = viewWidth + textWidth;
    xOffset.value = withDelay(
      delay,
      withSequence(
        withTiming(-textWidth - marginLeft, {
          duration: distance1 * speed * viewWidthRatio,
          easing: Easing.linear,
        }),
        withRepeat(
          withSequence(
            withTiming(viewWidth ?? 0, {
              duration: 0,
              easing: Easing.linear,
            }),
            withTiming(-textWidth - marginLeft, {
              duration: distance2 * speed * viewWidthRatio,
              easing: Easing.linear,
            })
          ),
          -1
        )
      )
    );
  }, [delayMs, marginLeft, speed, textWidth, viewWidth, xOffset]);

  useEffect(() => {
    if (widthsDefined && textOverflowing) {
      animateText();
    }
  }, [animateText, textOverflowing, widthsDefined]);

  useEffect(() => {
    if (shouldReset) {
      cancelAnimation(xOffset);
      xOffset.value = 0;
      if (widthsDefined && textOverflowing && textWidthChanged) {
        animateText();
      }
      setShouldReset(false);
    }
  }, [
    animateText,
    shouldReset,
    textWidth,
    xOffset,
    widthsDefined,
    textOverflowing,
    textWidthChanged,
  ]);

  const checkShouldReset = (
    newString: string,
    oldString: string | null
  ): void => {
    if (oldString !== null && oldString !== newString) {
      setShouldReset(true);
    }
  };

  useAnimatedReaction(
    () => children,
    (newString: string, oldString: string | null) => {
      runOnJS(checkShouldReset)(newString, oldString);
    },
    [children]
  );

  const onViewLayout = (e: LayoutChangeEvent): void => {
    setViewWidth(e.nativeEvent.layout.width);
  };

  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>): void => {
    if (e.nativeEvent.lines.length) {
      const lineWidth = e.nativeEvent.lines[0]?.width ?? 0;
      const lineheight = e.nativeEvent.lines[0]?.height ?? 0;
      setTextWidth(lineWidth);
      setTextHeight(lineheight);
    }
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: xOffset.value }],
  }));

  return (
    <View style={{ overflow: 'hidden' }} onLayout={onViewLayout}>
      <MaskedView
        maskElement={
          <Reanimated.View
            style={[animStyle, { width: textWidth, marginLeft }]}
          >
            <Text
              numberOfLines={1}
              style={[fontStyle]}
              onTextLayout={onTextLayout}
            >
              {children}
            </Text>
          </Reanimated.View>
        }
      >
        <Reanimated.View>
          <LinearGradient
            colors={colors}
            end={END_POINT}
            start={START_POINT}
            style={{ height: textHeight, width: viewWidth }}
          >
            <Text style={styles.zeroOpacity} />
          </LinearGradient>
        </Reanimated.View>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  zeroOpacity: {
    opacity: 0,
  },
});
