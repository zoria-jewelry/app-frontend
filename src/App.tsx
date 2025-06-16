import { useState } from 'react';
import logoTemp from '/logo-temp.png';
import logo from '/logo.jpg';
import { Box, Paper } from '@mui/material';

function App() {
    const [count, setCount] = useState(0);
    return (
        <Box width="100%">
            <Paper style={{ width: '80%' }}></Paper>

            <div>
                <img src={logo} alt="Application logo" />
                <img src={logoTemp} alt="Temporary logo" />
            </div>
            <h1>Treasury application Zoriia</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
        </Box>
    );
}

export default App;
