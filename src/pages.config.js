/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import Community from './pages/Community';
import EditorDashboard from './pages/EditorDashboard';
import Home from './pages/Home';
import MilestoneChallenges from './pages/MilestoneChallenges';
import MindfulnessStudio from './pages/MindfulnessStudio';
import ModeratorDashboard from './pages/ModeratorDashboard';
import Onboarding from './pages/Onboarding';
import PrepToolkit from './pages/PrepToolkit';
import Privacy from './pages/Privacy';
import ProfileSettings from './pages/ProfileSettings';
import Progress from './pages/Progress';
import RecoveryConnector from './pages/RecoveryConnector';
import Resources from './pages/Resources';
import StudyLibrary from './pages/StudyLibrary';
import TesterFeedback from './pages/TesterFeedback';
import WellnessPlanner from './pages/WellnessPlanner';
import CoachChat from './pages/CoachChat';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Community": Community,
    "EditorDashboard": EditorDashboard,
    "Home": Home,
    "MilestoneChallenges": MilestoneChallenges,
    "MindfulnessStudio": MindfulnessStudio,
    "ModeratorDashboard": ModeratorDashboard,
    "Onboarding": Onboarding,
    "PrepToolkit": PrepToolkit,
    "Privacy": Privacy,
    "ProfileSettings": ProfileSettings,
    "Progress": Progress,
    "RecoveryConnector": RecoveryConnector,
    "Resources": Resources,
    "StudyLibrary": StudyLibrary,
    "TesterFeedback": TesterFeedback,
    "WellnessPlanner": WellnessPlanner,
    "CoachChat": CoachChat,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};