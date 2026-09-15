import React from 'react';
import LocationDiscovery from './LocationDiscovery';
import AchievementNotification from './AchievementNotification';

interface DiscoveryNotificationsProps {
  showLocationDiscovery: boolean;
  showProjectStudioDiscovery: boolean;
  showLearningOutcomesDiscovery: boolean;
  showArtworkDiscovery: boolean;
  showWorkDiscovery: boolean;
  handleLocationDiscoveryComplete: () => void;
  handleProjectStudioDiscoveryComplete: () => void;
  handleLearningOutcomesDiscoveryComplete: () => void;
  handleArtworkDiscoveryComplete: () => void;
  handleWorkDiscoveryComplete: () => void;
  showAchievementNotification: boolean;
  achievementTitle: string;
  onAchievementNotificationComplete: () => void;
}

// "Location discovered" banners and the achievement toast
const DiscoveryNotifications: React.FC<DiscoveryNotificationsProps> = React.memo(props => (
  <>
    {/* Location Discovery Notification */}
    <LocationDiscovery
      isVisible={props.showLocationDiscovery}
      onComplete={props.handleLocationDiscoveryComplete}
    />

    {/* Socials & Passion Discovery Notification */}
    <LocationDiscovery
      isVisible={props.showProjectStudioDiscovery}
      onComplete={props.handleProjectStudioDiscoveryComplete}
      locationName="Socials & Passion"
    />

    {/* Past Portfolios Discovery Notification */}
    <LocationDiscovery
      isVisible={props.showLearningOutcomesDiscovery}
      onComplete={props.handleLearningOutcomesDiscoveryComplete}
      locationName="Past Portfolios"
    />

    {/* Artwork Discovery Notification */}
    <LocationDiscovery
      isVisible={props.showArtworkDiscovery}
      onComplete={props.handleArtworkDiscoveryComplete}
      locationName="Artwork"
    />

    {/* Work Discovery Notification */}
    <LocationDiscovery
      isVisible={props.showWorkDiscovery}
      onComplete={props.handleWorkDiscoveryComplete}
      locationName="Work"
    />

    {/* Achievement Notification */}
    <AchievementNotification
      isVisible={props.showAchievementNotification}
      onComplete={props.onAchievementNotificationComplete}
      achievementTitle={props.achievementTitle}
    />
  </>
));

export default DiscoveryNotifications;
