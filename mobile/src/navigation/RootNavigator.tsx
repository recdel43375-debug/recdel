import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { settingsStore } from '../store/settingsStore';
import DisclaimerScreen from '../screens/Disclaimer/DisclaimerScreen';
import OnboardingCarousel from '../screens/Onboarding/OnboardingCarousel';
import MainTabs from './MainTabs';

type Stage = 'disclaimer' | 'onboarding' | 'main';

function initialStage(): Stage {
  if (!settingsStore.getHasAcceptedDisclaimer()) return 'disclaimer';
  if (!settingsStore.getHasSeenOnboarding()) return 'onboarding';
  return 'main';
}

// Mirrors the spec's RootStack (Disclaimer -> Onboarding -> MainTabs), shown
// once each. These two gates don't need their own navigator state, so we
// drive them with local component state and only mount NavigationContainer
// once we reach MainTabs.
export default function RootNavigator() {
  const [stage, setStage] = useState<Stage>(initialStage);

  if (stage === 'disclaimer') {
    return <DisclaimerScreen onAccepted={() => setStage(settingsStore.getHasSeenOnboarding() ? 'main' : 'onboarding')} />;
  }

  if (stage === 'onboarding') {
    return <OnboardingCarousel onDone={() => setStage('main')} />;
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
