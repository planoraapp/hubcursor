import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Marketplace } from './pages/Marketplace';
import { Console } from './pages/Console';
import { Console2 } from './pages/Console2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConsoleProfile } from './pages/ConsoleProfile';
import { ConsoleLikes } from './pages/ConsoleLikes';
import { ConsoleFollowers } from './pages/ConsoleFollowers';
import { ConsoleFollowing } from './pages/ConsoleFollowing';
import { ConsoleComments } from './pages/ConsoleComments';
import { ConsolePhotos } from './pages/ConsolePhotos';
import { ConsoleSettings } from './pages/ConsoleSettings';
import { ConsoleAdmin } from './pages/ConsoleAdmin';
import { ConsoleAdminUsers } from './pages/ConsoleAdminUsers';
import { ConsoleAdminRooms } from './pages/ConsoleAdminRooms';
import { ConsoleAdminGroups } from './pages/ConsoleAdminGroups';
import { ConsoleAdminBadges } from './pages/ConsoleAdminBadges';
import { ConsoleAdminArticles } from './pages/ConsoleAdminArticles';
import { ConsoleAdminSettings } from './pages/ConsoleAdminSettings';
import { ConsoleAdminLogs } from './pages/ConsoleAdminLogs';
import { ConsoleAdminMarketplace } from './pages/ConsoleAdminMarketplace';
import { ConsoleAdminCommunity } from './pages/ConsoleAdminCommunity';
import { ConsoleAdminStaff } from './pages/ConsoleAdminStaff';
import { ConsoleAdminShop } from './pages/ConsoleAdminShop';
import { ConsoleAdminEvents } from './pages/ConsoleAdminEvents';
import { ConsoleAdminCommands } from './pages/ConsoleAdminCommands';
import { ConsoleAdminWordfilter } from './pages/ConsoleAdminWordfilter';
import { ConsoleAdminRanks } from './pages/ConsoleAdminRanks';
import { ConsoleAdminNews } from './pages/ConsoleAdminNews';
import { ConsoleAdminBans } from './pages/ConsoleAdminBans';
import { ConsoleAdminAlerts } from './pages/ConsoleAdminAlerts';
import { ConsoleAdminTickets } from './pages/ConsoleAdminTickets';
import { ConsoleAdminReferrals } from './pages/ConsoleAdminReferrals';
import { ConsoleAdminRewards } from './pages/ConsoleAdminRewards';
import { ConsoleAdminQuests } from './pages/ConsoleAdminQuests';
import { ConsoleAdminPlugins } from './pages/ConsoleAdminPlugins';
import { ConsoleAdminNavigator } from './pages/ConsoleAdminNavigator';
import { ConsoleAdminEmulator } from './pages/ConsoleAdminEmulator';
import { ConsoleAdminDiscord } from './pages/ConsoleAdminDiscord';
import { ConsoleAdminDashboard } from './pages/ConsoleAdminDashboard';
import { ConsoleAdminCatalog } from './pages/ConsoleAdminCatalog';
import { ConsoleAdminBots } from './pages/ConsoleAdminBots';
import { ConsoleAdminVouchers } from './pages/ConsoleAdminVouchers';
import { ConsoleAdminWebsite } from './pages/ConsoleAdminWebsite';
import { ConsoleAdminSecurity } from './pages/ConsoleAdminSecurity';
import { ConsoleAdminIntegration } from './pages/ConsoleAdminIntegration';
import { ConsoleAdminAdvertising } from './pages/ConsoleAdminAdvertising';
import { ConsoleAdminApi } from './pages/ConsoleAdminApi';
import { ConsoleAdminChat } from './pages/ConsoleAdminChat';
import { ConsoleAdminModeration } from './pages/ConsoleAdminModeration';
import { ConsoleAdminManagement } from './pages/ConsoleAdminManagement';
import { ConsoleAdminSettingsWebsite } from './pages/ConsoleAdminSettingsWebsite';
import { ConsoleAdminSettingsSecurity } from './pages/ConsoleAdminSettingsSecurity';
import { ConsoleAdminSettingsIntegration } from './pages/ConsoleAdminSettingsIntegration';
import { ConsoleAdminSettingsAdvertising } from './pages/ConsoleAdminSettingsAdvertising';
import { ConsoleAdminSettingsApi } from './pages/ConsoleAdminSettingsApi';
import { ConsoleAdminSettingsChat } from './pages/ConsoleAdminSettingsChat';
import { ConsoleAdminSettingsModeration } from './pages/ConsoleAdminSettingsModeration';
import { ConsoleAdminSettingsManagement } from './pages/ConsoleAdminSettingsManagement';
import { ConsoleAdminSettingsDiscord } from './pages/ConsoleAdminSettingsDiscord';
import { ConsoleAdminSettingsEmulator } from './pages/ConsoleAdminSettingsEmulator';
import { ConsoleAdminSettingsNavigator } from './pages/ConsoleAdminSettingsNavigator';
import { ConsoleAdminSettingsPlugins } from './pages/ConsoleAdminSettingsPlugins';
import { ConsoleAdminSettingsQuests } from './pages/ConsoleAdminSettingsQuests';
import { ConsoleAdminSettingsRewards } from './pages/ConsoleAdminSettingsRewards';
import { ConsoleAdminSettingsReferrals } from './pages/ConsoleAdminSettingsReferrals';
import { ConsoleAdminSettingsTickets } from './pages/ConsoleAdminSettingsTickets';
import { ConsoleAdminSettingsAlerts } from './pages/ConsoleAdminSettingsAlerts';
import { ConsoleAdminSettingsBans } from './pages/ConsoleAdminSettingsBans';
import { ConsoleAdminSettingsNews } from './pages/ConsoleAdminSettingsNews';
import { ConsoleAdminSettingsRanks } from './pages/ConsoleAdminSettingsRanks';
import { ConsoleAdminSettingsWordfilter } from './pages/ConsoleAdminSettingsWordfilter';
import { ConsoleAdminSettingsCommands } from './pages/ConsoleAdminSettingsCommands';
import { ConsoleAdminSettingsEvents } from './pages/ConsoleAdminSettingsEvents';
import { ConsoleAdminSettingsShop } from './pages/ConsoleAdminSettingsShop';
import { ConsoleAdminSettingsStaff } from './pages/ConsoleAdminSettingsStaff';
import { ConsoleAdminSettingsCommunity } from './pages/ConsoleAdminSettingsCommunity';
import { ConsoleAdminSettingsMarketplace } from './pages/ConsoleAdminSettingsMarketplace';
import { ConsoleAdminSettingsLogs } from './pages/ConsoleAdminSettingsLogs';
import { ConsoleAdminSettingsCatalog } from './pages/ConsoleAdminSettingsCatalog';
import { ConsoleAdminSettingsBots } from './pages/ConsoleAdminSettingsBots';
import { ConsoleAdminSettingsVouchers } from './pages/ConsoleAdminSettingsVouchers';
import { ConsoleStaff } from './pages/ConsoleStaff';
import { ConsoleStaffDashboard } from './pages/ConsoleStaffDashboard';
import { ConsoleStaffTickets } from './pages/ConsoleStaffTickets';
import { ConsoleStaffLogs } from './pages/ConsoleStaffLogs';
import { ConsoleStaffChatlogs } from './pages/ConsoleStaffChatlogs';
import { ConsoleStaffBans } from './pages/ConsoleStaffBans';
import { ConsoleStaffAlerts } from './pages/ConsoleStaffAlerts';
import { ConsoleStaffReferrals } from './pages/ConsoleStaffReferrals';
import { ConsoleStaffRewards } from './pages/ConsoleStaffRewards';
import { ConsoleStaffQuests } from './pages/ConsoleStaffQuests';
import { ConsoleStaffNavigator } from './pages/ConsoleStaffNavigator';
import { ConsoleStaffWordfilter } from './pages/ConsoleStaffWordfilter';
import { ConsoleStaffRanks } from './pages/ConsoleStaffRanks';
import { ConsoleStaffNews } from './pages/ConsoleStaffNews';
import { ConsoleStaffEvents } from './pages/ConsoleStaffEvents';
import { ConsoleStaffShop } from './pages/ConsoleStaffShop';
import { ConsoleStaffManagement } from './pages/ConsoleStaffManagement';
import { ConsoleStaffModeration } from './pages/ConsoleStaffModeration';
import { ConsoleStaffSettings } from './pages/ConsoleStaffSettings';
import { ConsoleStaffSettingsManagement } from './pages/ConsoleStaffSettingsManagement';
import { ConsoleStaffSettingsModeration } from './pages/ConsoleStaffSettingsModeration';
import { ConsoleStaffSettingsNavigator } from './pages/ConsoleStaffSettingsNavigator';
import { ConsoleStaffSettingsQuests } from './pages/ConsoleStaffSettingsQuests';
import { ConsoleStaffSettingsRewards } from './pages/ConsoleStaffSettingsRewards';
import { ConsoleStaffSettingsReferrals } from './pages/ConsoleStaffSettingsReferrals';
import { ConsoleStaffSettingsAlerts } from './pages/ConsoleStaffSettingsAlerts';
import { ConsoleStaffSettingsBans } from './pages/ConsoleStaffSettingsBans';
import { ConsoleStaffSettingsChatlogs } from './pages/ConsoleStaffSettingsChatlogs';
import { ConsoleStaffSettingsLogs } from './pages/ConsoleStaffSettingsLogs';
import { ConsoleStaffSettingsNews } from './pages/ConsoleStaffSettingsNews';
import { ConsoleStaffSettingsRanks } from './pages/ConsoleStaffSettingsRanks';
import { ConsoleStaffSettingsShop } from './pages/ConsoleStaffSettingsShop';
import { ConsoleStaffSettingsEvents } from './pages/ConsoleStaffSettingsEvents';
import { ConsoleStaffSettingsWordfilter } from './pages/ConsoleStaffSettingsWordfilter';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/marketplace",
    element: <Marketplace />,
  },
  {
    path: "/console",
    element: <Console />,
  },
  {
    path: "/console2", 
    element: <Console2 />,
  },
  {
    path: "/console/profile",
    element: <ConsoleProfile />,
  },
  {
    path: "/console/likes",
    element: <ConsoleLikes />,
  },
  {
    path: "/console/followers",
    element: <ConsoleFollowers />,
  },
  {
    path: "/console/following",
    element: <ConsoleFollowing />,
  },
  {
    path: "/console/comments",
    element: <ConsoleComments />,
  },
  {
    path: "/console/photos",
    element: <ConsolePhotos />,
  },
  {
    path: "/console/settings",
    element: <ConsoleSettings />,
  },
  {
    path: "/console/staff",
    element: <ConsoleStaff />,
    children: [
      {
        path: "dashboard",
        element: <ConsoleStaffDashboard />,
      },
      {
        path: "tickets",
        element: <ConsoleStaffTickets />,
      },
      {
        path: "logs",
        element: <ConsoleStaffLogs />,
      },
      {
        path: "chatlogs",
        element: <ConsoleStaffChatlogs />,
      },
      {
        path: "bans",
        element: <ConsoleStaffBans />,
      },
      {
        path: "alerts",
        element: <ConsoleStaffAlerts />,
      },
      {
        path: "referrals",
        element: <ConsoleStaffReferrals />,
      },
      {
        path: "rewards",
        element: <ConsoleStaffRewards />,
      },
      {
        path: "quests",
        element: <ConsoleStaffQuests />,
      },
      {
        path: "navigator",
        element: <ConsoleStaffNavigator />,
      },
      {
        path: "wordfilter",
        element: <ConsoleStaffWordfilter />,
      },
      {
        path: "ranks",
        element: <ConsoleStaffRanks />,
      },
      {
        path: "news",
        element: <ConsoleStaffNews />,
      },
      {
        path: "events",
        element: <ConsoleStaffEvents />,
      },
      {
        path: "shop",
        element: <ConsoleStaffShop />,
      },
      {
        path: "management",
        element: <ConsoleStaffManagement />,
      },
      {
        path: "moderation",
        element: <ConsoleStaffModeration />,
      },
      {
        path: "settings",
        element: <ConsoleStaffSettings />,
      },
      {
        path: "settings/management",
        element: <ConsoleStaffSettingsManagement />,
      },
      {
        path: "settings/moderation",
        element: <ConsoleStaffSettingsModeration />,
      },
      {
        path: "settings/navigator",
        element: <ConsoleStaffSettingsNavigator />,
      },
      {
        path: "settings/quests",
        element: <ConsoleStaffSettingsQuests />,
      },
      {
        path: "settings/rewards",
        element: <ConsoleStaffSettingsRewards />,
      },
      {
        path: "settings/referrals",
        element: <ConsoleStaffSettingsReferrals />,
      },
      {
        path: "settings/alerts",
        element: <ConsoleStaffSettingsAlerts />,
      },
      {
        path: "settings/bans",
        element: <ConsoleStaffSettingsBans />,
      },
      {
        path: "settings/chatlogs",
        element: <ConsoleStaffSettingsChatlogs />,
      },
      {
        path: "settings/logs",
        element: <ConsoleStaffSettingsLogs />,
      },
      {
        path: "settings/news",
        element: <ConsoleStaffSettingsNews />,
      },
      {
        path: "settings/ranks",
        element: <ConsoleStaffSettingsRanks />,
      },
      {
        path: "settings/shop",
        element: <ConsoleStaffSettingsShop />,
      },
      {
        path: "settings/events",
        element: <ConsoleStaffSettingsEvents />,
      },
      {
        path: "settings/wordfilter",
        element: <ConsoleStaffSettingsWordfilter />,
      },
    ]
  },
  {
    path: "/console/admin",
    element: <ConsoleAdmin />,
    children: [
      {
        path: "dashboard",
        element: <ConsoleAdminDashboard />,
      },
      {
        path: "users",
        element: <ConsoleAdminUsers />,
      },
      {
        path: "rooms",
        element: <ConsoleAdminRooms />,
      },
      {
        path: "groups",
        element: <ConsoleAdminGroups />,
      },
      {
        path: "badges",
        element: <ConsoleAdminBadges />,
      },
      {
        path: "articles",
        element: <ConsoleAdminArticles />,
      },
      {
        path: "settings",
        element: <ConsoleAdminSettings />,
      },
      {
        path: "logs",
        element: <ConsoleAdminLogs />,
      },
      {
        path: "marketplace",
        element: <ConsoleAdminMarketplace />,
      },
      {
        path: "community",
        element: <ConsoleAdminCommunity />,
      },
      {
        path: "staff",
        element: <ConsoleAdminStaff />,
      },
      {
        path: "shop",
        element: <ConsoleAdminShop />,
      },
      {
        path: "events",
        element: <ConsoleAdminEvents />,
      },
      {
        path: "commands",
        element: <ConsoleAdminCommands />,
      },
      {
        path: "wordfilter",
        element: <ConsoleAdminWordfilter />,
      },
      {
        path: "ranks",
        element: <ConsoleAdminRanks />,
      },
      {
        path: "news",
        element: <ConsoleAdminNews />,
      },
      {
        path: "bans",
        element: <ConsoleAdminBans />,
      },
      {
        path: "alerts",
        element: <ConsoleAdminAlerts />,
      },
      {
        path: "tickets",
        element: <ConsoleAdminTickets />,
      },
      {
        path: "referrals",
        element: <ConsoleAdminReferrals />,
      },
      {
        path: "rewards",
        element: <ConsoleAdminRewards />,
      },
      {
        path: "quests",
        element: <ConsoleAdminQuests />,
      },
      {
        path: "plugins",
        element: <ConsoleAdminPlugins />,
      },
      {
        path: "navigator",
        element: <ConsoleAdminNavigator />,
      },
      {
        path: "emulator",
        element: <ConsoleAdminEmulator />,
      },
      {
        path: "discord",
        element: <ConsoleAdminDiscord />,
      },
      {
        path: "catalog",
        element: <ConsoleAdminCatalog />,
      },
      {
        path: "bots",
        element: <ConsoleAdminBots />,
      },
      {
        path: "vouchers",
        element: <ConsoleAdminVouchers />,
      },
      {
        path: "website",
        element: <ConsoleAdminWebsite />,
      },
      {
        path: "security",
        element: <ConsoleAdminSecurity />,
      },
      {
        path: "integration",
        element: <ConsoleAdminIntegration />,
      },
      {
        path: "advertising",
        element: <ConsoleAdminAdvertising />,
      },
      {
        path: "api",
        element: <ConsoleAdminApi />,
      },
      {
        path: "chat",
        element: <ConsoleAdminChat />,
      },
      {
        path: "moderation",
        element: <ConsoleAdminModeration />,
      },
      {
        path: "management",
        element: <ConsoleAdminManagement />,
      },
      {
        path: "settings/website",
        element: <ConsoleAdminSettingsWebsite />,
      },
      {
        path: "settings/security",
        element: <ConsoleAdminSettingsSecurity />,
      },
      {
        path: "settings/integration",
        element: <ConsoleAdminSettingsIntegration />,
      },
      {
        path: "settings/advertising",
        element: <ConsoleAdminSettingsAdvertising />,
      },
      {
        path: "settings/api",
        element: <ConsoleAdminSettingsApi />,
      },
      {
        path: "settings/chat",
        element: <ConsoleAdminSettingsChat />,
      },
      {
        path: "settings/moderation",
        element: <ConsoleAdminSettingsModeration />,
      },
      {
        path: "settings/management",
        element: <ConsoleAdminSettingsManagement />,
      },
            {
        path: "settings/discord",
        element: <ConsoleAdminSettingsDiscord />,
      },
      {
        path: "settings/emulator",
        element: <ConsoleAdminSettingsEmulator />,
      },
      {
        path: "settings/navigator",
        element: <ConsoleAdminSettingsNavigator />,
      },
      {
        path: "settings/plugins",
        element: <ConsoleAdminSettingsPlugins />,
      },
      {
        path: "settings/quests",
        element: <ConsoleAdminSettingsQuests />,
      },
      {
        path: "settings/rewards",
        element: <ConsoleAdminSettingsRewards />,
      },
      {
        path: "settings/referrals",
        element: <ConsoleAdminSettingsReferrals />,
      },
      {
        path: "settings/tickets",
        element: <ConsoleAdminSettingsTickets />,
      },
      {
        path: "settings/alerts",
        element: <ConsoleAdminSettingsAlerts />,
      },
      {
        path: "settings/bans",
        element: <ConsoleAdminSettingsBans />,
      },
      {
        path: "settings/news",
        element: <ConsoleAdminSettingsNews />,
      },
      {
        path: "settings/ranks",
        element: <ConsoleAdminSettingsRanks />,
      },
      {
        path: "settings/wordfilter",
        element: <ConsoleAdminSettingsWordfilter />,
      },
      {
        path: "settings/commands",
        element: <ConsoleAdminSettingsCommands />,
      },
      {
        path: "settings/events",
        element: <ConsoleAdminSettingsEvents />,
      },
      {
        path: "settings/shop",
        element: <ConsoleAdminSettingsShop />,
      },
      {
        path: "settings/staff",
        element: <ConsoleAdminSettingsStaff />,
      },
      {
        path: "settings/community",
        element: <ConsoleAdminSettingsCommunity />,
      },
      {
        path: "settings/marketplace",
        element: <ConsoleAdminSettingsMarketplace />,
      },
      {
        path: "settings/logs",
        element: <ConsoleAdminSettingsLogs />,
      },
      {
        path: "settings/catalog",
        element: <ConsoleAdminSettingsCatalog />,
      },
      {
        path: "settings/bots",
        element: <ConsoleAdminSettingsBots />,
      },
      {
        path: "settings/vouchers",
        element: <ConsoleAdminSettingsVouchers />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
