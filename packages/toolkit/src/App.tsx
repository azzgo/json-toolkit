import { BrowserRouter as Router, Route, Routes } from "react-router";
import JsonEditor from "./pages/JsonEditor";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout";

function JsonDiff() {
  return <div>JSON Diff Page</div>;
}

function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<JsonEditor />} />
          <Route path="/diff" element={<JsonDiff />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </Layout>
  );
}

export default App;
