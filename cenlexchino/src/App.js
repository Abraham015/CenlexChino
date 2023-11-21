import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/header';
import Home from './components/home/home'; // Import the Home component
import Administrador from "./components/admin/admin";

function App() {
  return (
    <Router>
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/administrador" element={<Administrador/>} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
