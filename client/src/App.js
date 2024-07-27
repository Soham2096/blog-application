
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Post from './post';
import Layout from './Layout';
import IndexPage from './pages/Indexpage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserCotextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from "./pages/EditPost";

function App() {
  return (
    <UserCotextProvider>
    <Routes>
      <Route path='/'element={<Layout/>}>
        <Route index element={<IndexPage/>}/>
        <Route path={'/login'} element={<LoginPage/>}/>
        <Route path={'/register'} element={<RegisterPage/>}/>
        <Route path={'/create'} element={<CreatePost/>}/>
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Route>
  </Routes>
  </UserCotextProvider>
  );
}

export default App;
