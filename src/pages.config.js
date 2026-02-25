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
import Privacy from './pages/Privacy';
import TesterFeedback from './pages/TesterFeedback';
import Admin from './pages/Admin';
import PrepToolkit from './pages/PrepToolkit';
import EditorDashboard from './pages/EditorDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import Onboarding from './pages/Onboarding';
import WellnessPlanner from './pages/WellnessPlanner';
import Community from './pages/Community';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import StudyLibrary from './pages/StudyLibrary';
import ProfileSettings from './pages/ProfileSettings';
import CoachChat from './pages/CoachChat';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Privacy": Privacy,
    "TesterFeedback": TesterFeedback,
    "Admin": Admin,
    "PrepToolkit": PrepToolkit,
    "EditorDashboard": EditorDashboard,
    "ModeratorDashboard": ModeratorDashboard,
    "Onboarding": Onboarding,
    "WellnessPlanner": WellnessPlanner,
    "Community": Community,
    "Progress": Progress,
    "Resources": Resources,
    "StudyLibrary": StudyLibrary,
    "ProfileSettings": ProfileSettings,
    "CoachChat": CoachChat,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};