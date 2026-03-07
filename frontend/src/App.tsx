import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ArtistProfile from './pages/ArtistProfile';
import SavedArtworks from './pages/SavedArtworks';
import ActivityFeed from './pages/ActivityFeed';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      } />
      <Route path="/artist/:username" element={
        <ProtectedRoute>
          <ArtistProfile />
        </ProtectedRoute>
      } />
      <Route path="/saved" element={
        <ProtectedRoute>
          <SavedArtworks />
        </ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute>
          <ActivityFeed />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
