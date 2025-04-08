import { BrowserRouter as Router, Route, Routes } from "react-router";
import JsonEditor from './pages/JsonEditor';
      
function JsonDiff() {
  return <div>JSON Diff Page</div>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JsonEditor />} />
        <Route path="/diff" element={<JsonDiff />} />
      </Routes>
    </Router>
  );
}

export default App;
