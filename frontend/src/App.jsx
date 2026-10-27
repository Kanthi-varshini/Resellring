import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Market from './pages/Market.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyRing from './pages/MyRing.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import NotFound from './pages/NotFound.jsx';
import Guide from './pages/Guide.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/market" element={<Market />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/sellers/:id" element={<SellerProfile />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/my-ring" element={<MyRing />} />
      </Route>
      <Route path="/guide" element={<Guide />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
