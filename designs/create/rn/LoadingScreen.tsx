import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  cancelAnimation,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Polyline,
} from 'react-native-svg';


const TOKENS = {
  surface: '#FAFAFA',
  textPrimary: '#181D27',
  textTertiary: '#717680',
  borderSecondary: 'rgba(0,0,0,0.06)',
  brand: '#406AD0',
  success: '#16B364',
  white: '#FFFFFF',
  shadow: 'rgba(10,13,18,0.08)',
  fontDisplay: Platform.select({ ios: 'Inter', android: 'Inter', default: 'System' }),
  fontBody: Platform.select({ ios: 'Geist', android: 'Geist', default: 'System' }),
};

type IconKey = 'target' | 'clock' | 'book' | 'chart' | 'circles';

type Step = {
  active: string;
  done: string;
  chip: string;
  icon: IconKey;
};

const LOADING_STEPS: Step[] = [
  { active: 'Adding your goal',           done: 'Goal added',        chip: 'General investing', icon: 'target' },
  { active: 'Noting your timeline',       done: 'Timeline set',      chip: '5 – 10 years',      icon: 'clock' },
  { active: 'Logging your experience',    done: 'Experience logged', chip: 'Knowledgeable',     icon: 'book' },
  { active: 'Applying your risk profile', done: 'Risk profile set',  chip: 'Moderate',          icon: 'chart' },
  { active: 'Finalizing allocations',     done: 'Allocations ready', chip: '12 assets matched', icon: 'circles' },
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  onComplete?: () => void;
};

export default function LoadingScreen({ onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<'active' | 'done'>('active');
  const [rmReady, setRmReady] = useState(false);
  const reducedMotion = useRef(false);

  const progress = useSharedValue(0);
  const spinnerRot = useSharedValue(0);
  const ringOpacity = useSharedValue(1);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.8);
  const labelOpacity = useSharedValue(1);
  const chipOpacity = useSharedValue(0);
  const chipTranslateY = useSharedValue(8);
  const chipScale = useSharedValue(0.92);

  // Halo animation values (run indefinitely on UI thread)
  const haloScale = useSharedValue(1);
  const haloBloomOpacity = useSharedValue(0.55);
  const haloHue = useSharedValue(0);

  // Secondary phase-offset breathers — keeps each aurora band feeling alive
  // instead of synchronised, which looked mechanical
  const auroraBlue = useSharedValue(1);
  const auroraAmber = useSharedValue(1);
  const auroraPink = useSharedValue(1);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      if (cancelled) return;
      reducedMotion.current = r;
      setRmReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rmReady) return;
    const rm = reducedMotion.current;

    // Spinner: continuous rotation, UI-thread
    if (!rm) {
      spinnerRot.value = withRepeat(
        withTiming(360, { duration: 1100, easing: Easing.linear }),
        -1,
        false,
      );
    }

    // Halo breathing: symmetric scale+opacity pulse
    if (!rm) {
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      haloBloomOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.55, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      haloHue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );

      // Phase-offset band intensities — each color peaks at a different time
      auroraBlue.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.85, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      auroraAmber.value = withDelay(
        900,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.75, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
      auroraPink.value = withDelay(
        1700,
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    }

    return () => {
      cancelAnimation(spinnerRot);
      cancelAnimation(haloScale);
      cancelAnimation(haloBloomOpacity);
      cancelAnimation(haloHue);
      cancelAnimation(auroraBlue);
      cancelAnimation(auroraAmber);
      cancelAnimation(auroraPink);
    };
  }, [rmReady]);

  // State machine
  useEffect(() => {
    if (!rmReady) return;
    let cancelled = false;
    const rm = reducedMotion.current;

    const run = async () => {
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        if (cancelled) return;

        // Transition into active
        setStepIdx(i);
        setPhase('active');
        progress.value = withTiming(i / LOADING_STEPS.length, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        ringOpacity.value = withTiming(1, { duration: 180 });
        checkOpacity.value = withTiming(0, { duration: 180 });
        checkScale.value = 0.8;
        labelOpacity.value = withSequence(
          withTiming(0, { duration: 120 }),
          withTiming(1, { duration: 180 }),
        );

        await wait(380);
        if (cancelled) return;

        // Chip in
        chipOpacity.value = withTiming(1, { duration: 260 });
        chipTranslateY.value = rm
          ? withTiming(0, { duration: 260 })
          : withSpring(0, { damping: 14, stiffness: 180, mass: 0.6 });
        chipScale.value = rm
          ? withTiming(1, { duration: 260 })
          : withSpring(1, { damping: 12, stiffness: 200, mass: 0.6 });

        await wait(1300);
        if (cancelled) return;

        // Transition to done
        setPhase('done');
        progress.value = withTiming((i + 1) / LOADING_STEPS.length, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });
        ringOpacity.value = withTiming(0, { duration: 200 });
        checkOpacity.value = withTiming(1, { duration: 220 });
        checkScale.value = rm
          ? withTiming(1, { duration: 220 })
          : withSpring(1, { damping: 10, stiffness: 260, mass: 0.5 });
        labelOpacity.value = withSequence(
          withTiming(0, { duration: 120 }),
          withTiming(1, { duration: 180 }),
        );

        await wait(200);
        if (cancelled) return;

        // Chip out
        chipOpacity.value = withTiming(0, { duration: 220 });
        chipTranslateY.value = withTiming(8, { duration: 220 });
        chipScale.value = withTiming(0.96, { duration: 220 });

        await wait(280);
      }
      if (!cancelled) onComplete?.();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [rmReady, onComplete]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRot.value}deg` }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const chipStyle = useAnimatedStyle(() => ({
    opacity: chipOpacity.value,
    transform: [
      { translateY: chipTranslateY.value },
      { scale: chipScale.value },
    ],
  }));

  const current = LOADING_STEPS[stepIdx];
  const labelText = phase === 'active' ? current.active : current.done;

  return (
    <View style={styles.screen}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <StatusBarGlyphs />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]}>
          <ProgressGradient />
        </Animated.View>
      </View>

      {/* Aurora halo */}
      <AuroraHalo
        scale={haloScale}
        bloomOpacity={haloBloomOpacity}
        hue={haloHue}
        blue={auroraBlue}
        amber={auroraAmber}
        pink={auroraPink}
      />

      {/* Copy */}
      <View style={styles.copy}>
        <Text style={styles.h1}>Here's what I've learned{'\n'}about your goals</Text>
        <Text style={styles.p}>Don't worry, you can customize{'\n'}everything later in settings.</Text>
      </View>

      {/* Spinner + action label */}
      <View style={styles.action}>
        <View style={styles.spinnerWrap}>
          <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, spinnerStyle]}>
              <SpinnerRing />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, checkStyle]}>
            <SpinnerCheck />
          </Animated.View>
        </View>
        <Animated.Text
          style={[
            styles.label,
            phase === 'done' && styles.labelDone,
            labelStyle,
          ]}
        >
          {labelText}
        </Animated.Text>
      </View>

      {/* Chip */}
      <Animated.View style={[styles.chip, chipStyle]} pointerEvents="none">
        <View style={styles.chipIcon}>
          <ChipIcon kind={current.icon} />
        </View>
        <Text style={styles.chipText}>{current.chip}</Text>
      </Animated.View>

      {/* Disclaimer pill */}
      <View style={styles.disclaimer}>
        <InfoIcon />
        <Text style={styles.disclaimerText}>
          This can take up to a minute. Please keep the app open.
        </Text>
      </View>
    </View>
  );
}

// ─── Aurora halo ─────────────────────────────────────────────────────────

type HaloProps = {
  scale: SharedValue<number>;
  bloomOpacity: SharedValue<number>;
  hue: SharedValue<number>;
  blue: SharedValue<number>;
  amber: SharedValue<number>;
  pink: SharedValue<number>;
};

function AuroraHalo({ scale, bloomOpacity, hue, blue, amber, pink }: HaloProps) {
  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Each color band's opacity is driven by its own phase-offset breather.
  // This mimics the "hue-rotate" effect from the HTML by swelling different
  // hues at different times rather than literally rotating color space.
  const blueBandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blue.value, [0.85, 1.15], [0.55, 1], Extrapolation.CLAMP),
  }));
  const amberBandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(amber.value, [0.75, 1.2], [0.45, 1], Extrapolation.CLAMP),
  }));
  const pinkBandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pink.value, [0.8, 1.1], [0.45, 1], Extrapolation.CLAMP),
  }));
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomOpacity.value,
  }));

  const HALO_W = 340;
  const HALO_H = 230;

  return (
    <View style={styles.haloContainer} pointerEvents="none">
      <Animated.View style={[styles.haloInner, wrapStyle]}>
        {/* Warm amber edge (top) */}
        <Animated.View style={[StyleSheet.absoluteFill, amberBandStyle]}>
          <Svg width={HALO_W} height={HALO_H}>
            <Defs>
              <RadialGradient
                id="amber"
                cx="50%"
                cy="35%"
                rx="70%"
                ry="40%"
                fx="50%"
                fy="35%"
              >
                <Stop offset="0%" stopColor="#E4B774" stopOpacity={0.55} />
                <Stop offset="55%" stopColor="#E4B774" stopOpacity={0.12} />
                <Stop offset="100%" stopColor="#E4B774" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={HALO_W} height={HALO_H} fill="url(#amber)" />
          </Svg>
        </Animated.View>

        {/* Cool pink off-center (lower-left) */}
        <Animated.View style={[StyleSheet.absoluteFill, pinkBandStyle]}>
          <Svg width={HALO_W} height={HALO_H}>
            <Defs>
              <RadialGradient
                id="pink"
                cx="28%"
                cy="58%"
                rx="80%"
                ry="55%"
                fx="28%"
                fy="58%"
              >
                <Stop offset="0%" stopColor="#F9A8D4" stopOpacity={0.32} />
                <Stop offset="60%" stopColor="#F9A8D4" stopOpacity={0.08} />
                <Stop offset="100%" stopColor="#F9A8D4" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={HALO_W} height={HALO_H} fill="url(#pink)" />
          </Svg>
        </Animated.View>

        {/* Sky blue off-center (right) */}
        <Animated.View style={[StyleSheet.absoluteFill, blueBandStyle]}>
          <Svg width={HALO_W} height={HALO_H}>
            <Defs>
              <RadialGradient
                id="sky"
                cx="75%"
                cy="48%"
                rx="75%"
                ry="50%"
                fx="75%"
                fy="48%"
              >
                <Stop offset="0%" stopColor="#A5C1EF" stopOpacity={0.42} />
                <Stop offset="55%" stopColor="#A5C1EF" stopOpacity={0.12} />
                <Stop offset="100%" stopColor="#A5C1EF" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={HALO_W} height={HALO_H} fill="url(#sky)" />
          </Svg>
        </Animated.View>

        {/* Core brand blue */}
        <Svg
          width={HALO_W}
          height={HALO_H}
          style={StyleSheet.absoluteFill as any}
        >
          <Defs>
            <RadialGradient
              id="core"
              cx="50%"
              cy="55%"
              rx="55%"
              ry="65%"
              fx="50%"
              fy="55%"
            >
              <Stop offset="0%" stopColor={TOKENS.brand} stopOpacity={0.42} />
              <Stop offset="45%" stopColor={TOKENS.brand} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={TOKENS.brand} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={HALO_W} height={HALO_H} fill="url(#core)" />
        </Svg>

        {/* Inner bloom (softens the logo edge) */}
        <Animated.View style={[styles.haloBloom, bloomStyle]}>
          <Svg width={180} height={180}>
            <Defs>
              <RadialGradient
                id="bloom"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop offset="0%" stopColor={TOKENS.brand} stopOpacity={0.3} />
                <Stop offset="55%" stopColor={TOKENS.brand} stopOpacity={0.08} />
                <Stop offset="100%" stopColor={TOKENS.brand} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={180} height={180} fill="url(#bloom)" />
          </Svg>
        </Animated.View>

        {/* Logo badge */}
        <View style={styles.logoBadge}>
          <SurmountLogo />
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Small visual pieces ──────────────────────────────────────────────────

function StatusBarGlyphs() {
  return (
    <Svg width={67} height={12} viewBox="0 0 67 12">
      <Rect x={0} y={7} width={3} height={5} rx={0.8} fill={TOKENS.textPrimary} />
      <Rect x={4.5} y={5} width={3} height={7} rx={0.8} fill={TOKENS.textPrimary} />
      <Rect x={9} y={3} width={3} height={9} rx={0.8} fill={TOKENS.textPrimary} />
      <Rect x={13.5} y={1} width={3} height={11} rx={0.8} fill={TOKENS.textPrimary} />
      <Path d="M27.5 9.8a2.8 2.8 0 0 1 4 0" stroke={TOKENS.textPrimary} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Path d="M25 7.2a6.3 6.3 0 0 1 9 0" stroke={TOKENS.textPrimary} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Circle cx={29.5} cy={12} r={1.3} fill={TOKENS.textPrimary} />
      <Rect x={42} y={1.5} width={21} height={9} rx={2} stroke={TOKENS.textPrimary} strokeWidth={1} fill="none" />
      <Path d="M63.5 4v4a2 2 0 0 0 0-4z" fill={TOKENS.textPrimary} />
      <Rect x={43.5} y={3} width={14} height={6} rx={1.2} fill={TOKENS.textPrimary} />
    </Svg>
  );
}

function ProgressGradient() {
  return (
    <Svg width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#E4B774" />
          <Stop offset="55%" stopColor="#A5C1EF" />
          <Stop offset="100%" stopColor={TOKENS.brand} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" rx={2} ry={2} fill="url(#pg)" />
    </Svg>
  );
}

function SpinnerRing() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 256 256">
      <Circle cx={128} cy={128} r={96} fill={TOKENS.brand} opacity={0.2} />
      <Path
        d="M168,40a97,97,0,0,1,56,88,96,96,0,0,1-192,0A97,97,0,0,1,88,40"
        fill="none"
        stroke={TOKENS.brand}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
    </Svg>
  );
}

function SpinnerCheck() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 256 256">
      <Circle cx={128} cy={128} r={96} fill={TOKENS.success} opacity={0.2} />
      <Circle
        cx={128}
        cy={128}
        r={96}
        fill="none"
        stroke={TOKENS.success}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <Polyline
        points="88,136 112,160 168,104"
        fill="none"
        stroke={TOKENS.success}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 256 256">
      <Circle cx={128} cy={128} r={96} fill={TOKENS.textTertiary} opacity={0.2} />
      <Circle cx={128} cy={128} r={96} fill="none" stroke={TOKENS.textTertiary} strokeWidth={16} />
      <Path
        d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8"
        fill="none"
        stroke={TOKENS.textTertiary}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={124} cy={84} r={12} fill={TOKENS.textTertiary} />
    </Svg>
  );
}

function SurmountLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 38 38">
      <Defs>
        <LinearGradient id="dl1" x1="9" y1="15" x2="19" y2="15.1">
          <Stop offset="0%" stopColor="#34A6ED" />
          <Stop offset="100%" stopColor="#1047D2" />
        </LinearGradient>
        <LinearGradient id="dl2" x1="9" y1="20.3" x2="23.7" y2="20.5">
          <Stop offset="0%" stopColor="#34A6ED" />
          <Stop offset="100%" stopColor="#54E3DF" />
        </LinearGradient>
        <LinearGradient id="dl3" x1="14.2" y1="15.6" x2="29" y2="15.8">
          <Stop offset="0%" stopColor="#54E3DF" />
          <Stop offset="100%" stopColor="#34A6ED" />
        </LinearGradient>
        <LinearGradient id="dl4" x1="19" y1="21" x2="29" y2="21.1">
          <Stop offset="0%" stopColor="#1047D2" />
          <Stop offset="100%" stopColor="#34A6ED" />
        </LinearGradient>
      </Defs>
      <Path
        d="M19 13.14a8.7 8.7 0 00-1.76 1.6l-1.19 1.13c-.54-.28-1.14-.42-1.74-.42-1 0-1.94.34-2.66 1.03A3.54 3.54 0 009 19c0-1.6.65-3.11 1.85-4.24 2.22-2.11 5.69-2.32 8.15-.62z"
        fill="url(#dl1)"
      />
      <Path
        d="M23.37 18.81l-2.42 2.3-1.19 1.13c-.24.23-.5.43-.77.62-1.1.76-2.4 1.14-3.69 1.14-1.61 0-3.23-.59-4.46-1.76A5.52 5.52 0 019 18h2.6c0 .94.38 1.83 1.08 2.49 1.23 1.17 3.13 1.35 4.56.52.24-.14.47-.31.68-.52l1.31-1.24 2.3-2.19c.51-.49 1.33-.49 1.84 0 .51.49.51 1.27 0 1.75z"
        fill="url(#dl2)"
      />
      <Path
        d="M29 18h-2.6c0-.94-.38-1.83-1.08-2.5-.72-.68-1.67-1.02-2.62-1.02-.67 0-1.34.17-1.93.52-.24.14-.47.31-.68.52l-1.31 1.24-2.3 2.18a1.29 1.29 0 01-1.84 0 1.28 1.28 0 010-1.75l2.42-2.3 1.19-1.13c.24-.23.5-.43.77-.62 2.46-1.7 5.94-1.5 8.15.62A7.49 7.49 0 0129 18z"
        fill="url(#dl3)"
      />
      <Path
        d="M29 18c0 1.6-.65 3.11-1.85 4.24-1.23 1.17-2.84 1.76-4.46 1.76-1.3 0-2.6-.38-3.67-1.14.27-.18.53-.39.77-.62l1.19-1.13c.54.28 1.14.42 1.74.42.95 0 1.9-.34 2.62-1.02.7-.67 1.08-1.55 1.08-2.5H29z"
        fill="url(#dl4)"
      />
    </Svg>
  );
}

function ChipIcon({ kind }: { kind: IconKey }) {
  const c = TOKENS.white;
  switch (kind) {
    case 'target':
      return (
        <Svg width={12} height={12} viewBox="0 0 256 256">
          <Circle cx={128} cy={128} r={40} fill={c} opacity={0.25} />
          <Circle cx={128} cy={128} r={40} fill="none" stroke={c} strokeWidth={16} />
          <Circle cx={128} cy={128} r={88} fill="none" stroke={c} strokeWidth={16} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={12} height={12} viewBox="0 0 256 256">
          <Circle cx={128} cy={128} r={96} fill={c} opacity={0.25} />
          <Circle cx={128} cy={128} r={96} fill="none" stroke={c} strokeWidth={16} />
          <Polyline points="128,72 128,128 176,152" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={12} height={12} viewBox="0 0 256 256">
          <Path d="M24,200V56a8,8,0,0,1,8-8H96a40,40,0,0,1,40,40V200a32,32,0,0,0-32-32H32A8,8,0,0,1,24,200Z" fill={c} opacity={0.25} />
          <Path d="M24,200V56a8,8,0,0,1,8-8H96a40,40,0,0,1,40,40V200a32,32,0,0,0-32-32H32A8,8,0,0,1,24,200Z" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M232,200V56a8,8,0,0,0-8-8H160a40,40,0,0,0-40,40V200a32,32,0,0,1,32-32h72A8,8,0,0,0,232,200Z" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'chart':
      return (
        <Svg width={12} height={12} viewBox="0 0 256 256">
          <Path d="M224,208H32V48" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points="208,80 160,128 112,96 64,144" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points="208,128 208,80 160,80" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'circles':
      return (
        <Svg width={12} height={12} viewBox="0 0 256 256">
          <Circle cx={80} cy={80} r={40} fill={c} opacity={0.25} />
          <Circle cx={176} cy={80} r={40} fill={c} opacity={0.25} />
          <Circle cx={80} cy={176} r={40} fill={c} opacity={0.25} />
          <Circle cx={176} cy={176} r={40} fill={c} opacity={0.25} />
          <Circle cx={80} cy={80} r={40} fill="none" stroke={c} strokeWidth={16} />
          <Circle cx={176} cy={80} r={40} fill="none" stroke={c} strokeWidth={16} />
          <Circle cx={80} cy={176} r={40} fill="none" stroke={c} strokeWidth={16} />
          <Circle cx={176} cy={176} r={40} fill="none" stroke={c} strokeWidth={16} />
        </Svg>
      );
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.surface,
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  statusTime: {
    fontFamily: TOKENS.fontDisplay,
    fontSize: 14,
    fontWeight: '600',
    color: TOKENS.textPrimary,
    letterSpacing: -0.2,
  },
  progressTrack: {
    position: 'absolute',
    top: 52,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(10,13,18,0.06)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  haloContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloInner: {
    width: 340,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloBloom: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TOKENS.brand,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 5,
  },
  copy: {
    position: 'absolute',
    top: 336,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  h1: {
    fontFamily: TOKENS.fontDisplay,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
    color: TOKENS.textPrimary,
    textAlign: 'center',
  },
  p: {
    fontFamily: TOKENS.fontBody,
    fontSize: 14,
    lineHeight: 20,
    color: TOKENS.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.2,
  },
  action: {
    position: 'absolute',
    top: 468,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  spinnerWrap: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  label: {
    fontFamily: TOKENS.fontDisplay,
    fontSize: 16,
    fontWeight: '600',
    color: TOKENS.textPrimary,
    letterSpacing: -0.2,
  },
  labelDone: {
    color: TOKENS.textTertiary,
    fontWeight: '500',
  },
  chip: {
    position: 'absolute',
    top: 512,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 14,
    backgroundColor: TOKENS.white,
    borderWidth: 1,
    borderColor: TOKENS.borderSecondary,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chipIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#6F53D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipText: {
    fontFamily: TOKENS.fontBody,
    fontSize: 13,
    fontWeight: '500',
    color: TOKENS.textPrimary,
    letterSpacing: -0.1,
  },
  disclaimer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: TOKENS.white,
    borderWidth: 1,
    borderColor: TOKENS.borderSecondary,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: TOKENS.fontBody,
    fontSize: 13,
    lineHeight: 18,
    color: TOKENS.textTertiary,
    letterSpacing: -0.1,
  },
});
