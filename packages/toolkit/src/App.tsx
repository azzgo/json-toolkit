import { HashRouter as Router, Route, Routes } from "react-router";
import JsonEditor from "./pages/JsonEditor";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout";
import JsonDiff from "./pages/DiffPage";
import JwtDecoder from "./pages/JwtDecoder";
import UrlParamsConverter from "./pages/UrlParamsConverter";
import { MockDataGenerator } from "./pages/MockDataGenerator";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JsonEditor />} />
          <Route path="/diff" element={<JsonDiff />} />
          <Route path="/jwt" element={<JwtDecoder />} />
          <Route path="/url-params" element={<UrlParamsConverter />} />
          <Route path="/mock-data" element={<MockDataGenerator />} />
        </Routes>
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;
