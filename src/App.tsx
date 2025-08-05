import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Gallery from './components/Gallery';
import BlogPost from './components/BlogPost';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import PostList from './components/admin/PostList';
import PostForm from './components/admin/PostForm';
import ImageManager from './components/admin/ImageManager';
import SubscriberManager from './components/admin/SubscriberManager';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/post/:id" element={<BlogPost />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <PostList />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/new" element={
            <ProtectedRoute>
              <AdminLayout>
                <PostForm />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <PostForm />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/images" element={
            <ProtectedRoute>
              <AdminLayout>
                <ImageManager />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/subscribers" element={
            <ProtectedRoute>
              <AdminLayout>
                <SubscriberManager />
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;