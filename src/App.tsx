import { useState } from 'react';
import logoTemp from '/logo-temp.png';
import logo from '/logo.jpg';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div>
                <img src={logo} className="logo" alt="Application logo" />
                <img src={logoTemp} className="logo react" alt="Temporary logo" />
            </div>
            <h1>Treasury application Zoriia</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
        </>
    );
}

export default App;
