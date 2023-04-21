import React, { useState, useCallback, useEffect, FC } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  Text,
  TextStyle,
  View,
  AccessibilityInfo,
} from 'react-native';

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
import rnTextSize from 'react-native-text-dimensions';
import { Colors } from './constants/Colors';
import { windowWidth } from './constants/Sizes';
import LinearGradient from 'react-native-linear-gradient';

const START_POINT = { x: 0, y: 0 };
const END_POINT = { x: 1, y: 0 };
const DELAY = 4000;
const COLORS_LENGTH = 16;

interface IProps {
  children: string;
  delayMs?: number;
  marginLeft?: number;
  mode?: 'revolve' | 'peek';
  speed?: number;
  textColor?: string;
  textStyle?: StyleProp<
    Pick<TextStyle, 'fontFamily' | 'fontSize' | 'fontWeight'>
  >;
}

export const RevolvingText: FC<IProps> = ({
  children,
  delayMs,
  speed = 50,
  textStyle,
  textColor,
  marginLeft = 0,
  mode,
}) => {
  const xOffset = useSharedValue(0);

  const [viewWidth, setViewWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [textHeight, setTextHeight] = useState<number>(0);
  const [shouldReset, setShouldReset] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  const widthsDefined = textWidth && viewWidth;
  const textOverflowing = textWidth > viewWidth;

  const color = textColor ?? Colors.white;

  const colors = Array.from({ length: COLORS_LENGTH }, (_, idx) => {
    if (idx === 0 || idx === COLORS_LENGTH - 1) {
      return transparentize(1, color);
    }
    return color;
  });

  const animateText = useCallback((): void => {
    const delay = delayMs ?? DELAY;
    const viewWidthRatio = viewWidth ? viewWidth / windowWidth : 1;

    switch (mode) {
      case 'revolve': {
        const distance1 = textWidth;
        const distance2 = viewWidth + textWidth;
        const velocity = 2500 / speed;
        xOffset.value = withDelay(
          delay,
          withSequence(
            withTiming(-textWidth - marginLeft, {
              duration: distance1 * velocity * viewWidthRatio,
              easing: Easing.linear,
            }),
            withRepeat(
              withSequence(
                withTiming(viewWidth ?? 0, {
                  duration: 0,
                  easing: Easing.linear,
                }),
                withTiming(-textWidth - marginLeft, {
                  duration: distance2 * velocity * viewWidthRatio,
                  easing: Easing.linear,
                })
              ),
              -1
            )
          )
        );
        break;
      }
      case 'peek':
      default: {
        const velocity = 2500 / speed;
        const duration = (textWidth * velocity * viewWidthRatio) / 4;
        xOffset.value = withDelay(
          delay,
          withSequence(
            withTiming(viewWidth - textWidth - marginLeft * 2, {
              duration,
              easing: Easing.linear,
            }),
            withRepeat(
              withSequence(
                withDelay(
                  delay / 4,
                  withTiming(0, {
                    duration,
                    easing: Easing.linear,
                  })
                ),
                withDelay(
                  delay,
                  withTiming(viewWidth - textWidth - marginLeft * 2, {
                    duration,
                    easing: Easing.linear,
                  })
                )
              ),
              -1
            )
          )
        );
      }
    }
  }, [delayMs, marginLeft, mode, speed, textWidth, viewWidth, xOffset]);

  useEffect(() => {
    const init = async (): Promise<void> => {
      const size = await rnTextSize.measure({
        allowFontScaling: true,
        fontSize: 15,
        text: children,
      });
      const isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      setIsReduceMotionEnabled(isReduceMotion);
      setTextWidth(size.width);
      setTextHeight(size.height);
    };
    init();
  }, [children]);

  useEffect(() => {
    if (widthsDefined && textOverflowing) {
      animateText();
    }
  }, [animateText, textOverflowing, widthsDefined]);

  useEffect(() => {
    if (shouldReset) {
      cancelAnimation(xOffset);
      xOffset.value = 0;
      if (widthsDefined && textOverflowing) {
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

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: xOffset.value }],
  }));

  return (
    <View style={{ overflow: 'hidden' }} onLayout={onViewLayout}>
      {textOverflowing && !isReduceMotionEnabled ? (
        <MaskedView
          androidRenderingMode={'software'}
          maskElement={
            <Reanimated.View
              style={[animStyle, { marginLeft, width: textWidth }]}
            >
              <Text style={[textStyle, { width: textWidth }]}>{children}</Text>
            </Reanimated.View>
          }
        >
          <Reanimated.View>
            <LinearGradient
              colors={colors}
              end={END_POINT}
              start={START_POINT}
              style={{
                height: textHeight,
                width: viewWidth,
              }}
            >
              <Text />
            </LinearGradient>
          </Reanimated.View>
        </MaskedView>
      ) : (
        <Text style={[textStyle, { color: textColor, marginLeft }]}>
          {children}
        </Text>
      )}
    </View>
  );
};
