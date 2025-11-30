import { HashRouter as Router, Route, Routes } from "react-router";
import JsonEditor from "./pages/JsonEditor";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout";
import JsonDiff from "./pages/DiffPage";
import JwtDecoder from "./pages/JwtDecoder";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JsonEditor />} />
          <Route path="/diff" element={<JsonDiff />} />
          <Route path="/jwt" element={<JwtDecoder />} />
        </Routes>
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;
