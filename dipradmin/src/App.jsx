import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BaseLayout from "./components/layout/BaseLayout";
import DashboardPage from "./screens/dashboard/DashboardPage";
import ManageUsers from "./screens/manageusers/ManageUsers";
import ArticlePage from "./screens/articles/ArticlePage";
import AddArticlePage from "./screens/articles/AddArticlePage";
import EditArticlesPage from "./screens/articles/EditArticlesPage";
import MagazinesPage from "./screens/magazines/MagazinesPage";
import AddMagazinePage from "./screens/magazines/AddMagazines";
import UpdateMagazinePage from "./screens/magazines/EditMagazine2.jsx";
import BannersPage from "./screens/banners/BannersPage";
import ShortVideosPage from "./screens/shortVideos/ShortVideos";
import AddVideoPage from "./screens/shortVideos/addShortvideos";
import LongVideos from "./screens/longVideos/Long-Videos";
import AddLongVideos from "./screens/longVideos/AddLongVideos";
import ModerationPage from "./screens/moderation/ModerationPage";
import LoginPage from "./screens/auth/LoginPage";
import { PrivateRoute, PublicRoute } from "./PrivateRoute.jsx"; // Import PrivateRoute and PublicRoute
import Cookies from "js-cookie"; // Import js-cookie for accessing cookies
import Notifications from "./screens/notifications/Notifications.jsx";
import CategoryPage from "./screens/category/categoryPage.jsx";
import MagazinesPage2 from "./screens/magazines2/MagazinesPage2.jsx";
import AddMagazinePage2 from "./screens/magazines2/AddMagazine2.jsx";
import UpdateMagazinePage2 from "./screens/magazines/EditMagazine2.jsx";
// import UpdateMagazinePage1 from "./screens/magazines/EditMagazine2.jsx";
import ArticleHistoryPage from "./screens/articles/ArticleHistoryPage.jsx";
import MagazineHistoryPage2 from "./screens/magazines2/MagazineHistoryPage2.jsx";
import UpdateMagazinePage1 from "./screens/magazines2/EditMagazine1.jsx";
import MagazineHistoryPage from "./screens/magazines/MagazineHistoryPage1.jsx";
import EditShortVideo from "./screens/shortVideos/EditShortVideo.jsx";
import ShortVideoHistoryPage from "./screens/shortVideos/ShortVideoHistory.jsx";
import EditLongVideos from "./screens/longVideos/EditLongVideos.jsx";
import LongVideoHistoryPage from "./screens/longVideos/LongVideoHistory.jsx";
import AddBannerPage from "./screens/banners/AddBanner.jsx";
import EditBannerPage from "./screens/banners/EditBanner.jsx";
import PhtotosPage from "./screens/photos/Photos.jsx";
import AddPhotos from "./screens/photos/Addphotos.jsx";
import EditPhotos from "./screens/photos/EditPhotos.jsx";
import StaticPage from "./screens/static/Static.jsx";
import AddStaticPage from "./screens/static/addStatic.jsx";
import AddCategory from "./screens/category/AddCategory.jsx";
import LatestNotification from "./screens/latestnotifications/LatestNotification.jsx";
import AddLatestNotification from "./screens/latestnotifications/AddlatestNotification.jsx";
import ServiceNotification from "./screens/servicenotification/ServiceNotification.jsx";
import AddNotication from "./components/services-notification/modules/addnotification/AddNotication.jsx";
import UpdateNotication from "./components/services-notification/modules/updatenotification/UpdateNotication.jsx";
import AddVideoCategory from "./screens/videoCategory/AddVideoCategory.jsx";
import EditVideoCategory from "./screens/videoCategory/EditVideoCategory.jsx";
import VideoCategoryPage from "./screens/videoCategory/VideoCategoryPage.jsx";
import AddPhotoCategory from "./screens/photoCategory/AddPhotoCategory.jsx";
import EditPhotoCategory from "./screens/photoCategory/EditPhotoCategory.jsx";
import PhotoCategoryPage from "./screens/photoCategory/PhotoCategoryPage.jsx";
import AddDistrict from "./screens/districts/AddDistrict.jsx";
import EditDistrict from "./screens/districts/EditDistrict.jsx";
import DistrictsPage from "./screens/districts/DistrictsPage.jsx";
import LiveTvPage from "./screens/liveTv/LiveTvPage.jsx";
import KarnatakaDiprIntegrationPage from "./screens/settings/KarnatakaDiprIntegrationPage.jsx";
import KarnatakaNewsPage from "./screens/karnatakaNews/KarnatakaNewsPage.jsx";
import AddKarnatakaNewsPage from "./screens/karnatakaNews/AddKarnatakaNewsPage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Get the role from localStorage instead of cookies
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    // console.log("Token from localStorage:", token);
    // console.log("Stored Role from localStorage:", storedRole);
    if (storedRole && token) {
      setRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const storedRole = localStorage.getItem("role");
    // console.log("Role after login:", storedRole);
    setRole(storedRole);
  };

  return (
      <Router>
        <Routes>
          {/* Redirect root path to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login Route wrapped with PublicRoute */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage onLogin={handleLogin} />
              </PublicRoute>
            }
          />

          {/* Protected Routes wrapped with BaseLayout and PrivateRoute */}
          <Route path="/" element={<BaseLayout />}>
            <Route
              path="dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <PrivateRoute>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-articles"
              element={
                <PrivateRoute>
                  <ArticlePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-article"
              element={
                <PrivateRoute>
                  <AddArticlePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/karnataka-public-news"
              element={
                <PrivateRoute>
                  <KarnatakaNewsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/karnataka-public-news/create"
              element={
                <PrivateRoute>
                  <AddKarnatakaNewsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-Notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />

            {/* March of karnartaka */}
            <Route
              path="/manage-marchofkarnataka"
              element={
                <PrivateRoute>
                  <MagazinesPage />
                </PrivateRoute>
              }
            />

            {/* Vartha janapada */}
            <Route
              path="/manage-varthajanapada"
              element={
                <PrivateRoute>
                  <MagazinesPage2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-banners"
              element={
                <PrivateRoute>
                  <BannersPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/banners/add"
              element={
                <PrivateRoute>
                  <AddBannerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/banners/edit/:id"
              element={
                <PrivateRoute>
                  <EditBannerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/add-varthajanapada"
              element={
                <PrivateRoute>
                  <AddMagazinePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-magazine2"
              element={
                <PrivateRoute>
                  <AddMagazinePage2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-shortvideos"
              element={
                <PrivateRoute>
                  <ShortVideosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-shortvideo"
              element={
                <PrivateRoute>
                  <AddVideoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-category"
              element={
                <PrivateRoute>
                  <CategoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-longvideo"
              element={
                <PrivateRoute>
                  <LongVideos />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-longvideo"
              element={
                <PrivateRoute>
                  <AddLongVideos />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-long-video/:videoId"
              element={
                <PrivateRoute>
                  <EditLongVideos />
                </PrivateRoute>
              }
            />

            <Route
              path="/long-video-history/:videoId"
              element={
                <PrivateRoute>
                  {" "}
                  <LongVideoHistoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/add-shortVideos"
              element={
                <PrivateRoute>
                  <AddVideoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-short-video/:videoId"
              element={
                <PrivateRoute>
                  <EditShortVideo />
                </PrivateRoute>
              }
            />
            <Route
              path="/short-video-history/:videoId"
              element={
                <PrivateRoute>
                  <ShortVideoHistoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/manage-moderation"
              element={
                <PrivateRoute>
                  <ModerationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-article/:articleId"
              element={
                <PrivateRoute>
                  <EditArticlesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/article-history/:articleId"
              element={
                <PrivateRoute>
                  <ArticleHistoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-varthajanapada/:magazineId"
              element={
                <PrivateRoute>
                  <UpdateMagazinePage1 />
                </PrivateRoute>
              }
            />
            <Route
              path="/varthajanapada-history/:magazineId"
              element={
                <PrivateRoute>
                  <MagazineHistoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-marchofkarnataka/:magazineId"
              element={
                <PrivateRoute>
                  <UpdateMagazinePage2 />
                </PrivateRoute>
              }
            />

            <Route
              path="/manage-photos"
              element={
                <PrivateRoute>
                  <PhtotosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-photos/addphotos"
              element={
                <PrivateRoute>
                  <AddPhotos />
                </PrivateRoute>
              }
            />
            <Route
              path="/photos/edit/:photoId"
              element={
                <PrivateRoute>
                  <EditPhotos />
                </PrivateRoute>
              }
            />
            <Route
              path="/magazine2-history/:magazineId"
              element={
                <PrivateRoute>
                  <MagazineHistoryPage2 />
                </PrivateRoute>
              }
            />

            <Route
              path="/website-pages"
              element={
                <PrivateRoute>
                  <StaticPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/website-pages/addpages"
              element={
                <PrivateRoute>
                  <AddStaticPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/category"
              element={
                <PrivateRoute>
                  <CategoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/category/add"
              element={
                <PrivateRoute>
                  <AddCategory />
                </PrivateRoute>
              }
            />

            <Route
              path="/ServiceNotification"
              element={
                <PrivateRoute>
                  <ServiceNotification />
                </PrivateRoute>
              }
            />
            <Route
              path="/ServiceNotification/add"
              element={
                <PrivateRoute>
                  <AddNotication />
                </PrivateRoute>
              }
            />
            <Route
              path="/ServiceNotification/edit/:notificationId"
              element={
                <PrivateRoute>
                  <UpdateNotication />
                </PrivateRoute>
              }
            />

             <Route
              path="/latestnotification"
              element={
                <PrivateRoute>
                  <LatestNotification />
                </PrivateRoute>
              }
            />
  <Route
              path="/latestnotification/add"
              element={
                <PrivateRoute>
                  <AddLatestNotification />
                </PrivateRoute>
              }
            />

            <Route
              path="/video-categories"
              element={
                <PrivateRoute>
                  <VideoCategoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/video-category/add"
              element={
                <PrivateRoute>
                  <AddVideoCategory />
                </PrivateRoute>
              }
            />
            <Route
              path="/video-category/edit/:categoryId"
              element={
                <PrivateRoute>
                  <EditVideoCategory />
                </PrivateRoute>
              }
            />

            <Route
              path="/photo-categories"
              element={
                <PrivateRoute>
                  <PhotoCategoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/photo-category/add"
              element={
                <PrivateRoute>
                  <AddPhotoCategory />
                </PrivateRoute>
              }
            />
            <Route
              path="/photo-category/edit/:categoryId"
              element={
                <PrivateRoute>
                  <EditPhotoCategory />
                </PrivateRoute>
              }
            />

            <Route
              path="/districts"
              element={
                <PrivateRoute>
                  <DistrictsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/districts/add"
              element={
                <PrivateRoute>
                  <AddDistrict />
                </PrivateRoute>
              }
            />
            <Route
              path="/districts/edit/:districtId"
              element={
                <PrivateRoute>
                  <EditDistrict />
                </PrivateRoute>
              }
            />

            <Route
              path="/live-tv"
              element={
                <PrivateRoute>
                  <LiveTvPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings/karnataka-dipr-integration"
              element={
                <PrivateRoute>
                  <KarnatakaDiprIntegrationPage />
                </PrivateRoute>
              }
            />
          </Route>
          
          

          
        </Routes>
      </Router>
  );
}

export default App;
