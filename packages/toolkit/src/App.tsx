import { BrowserRouter as Router, Route, Routes } from "react-router";
import JsonEditor from "./pages/JsonEditor";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout";
import JsonDiff from "./pages/DiffPage";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JsonEditor />} />
          <Route path="/diff" element={<JsonDiff />} />
        </Routes>
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;
