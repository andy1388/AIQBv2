import 'module-alias/register';
import express from 'express';
import path from 'path';
import cors from 'cors';
import questionRoutes from './routes/questionRoutes';
import solverRoutes from './solver/routes/solverRoutes';

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api/questions', questionRoutes);
app.use('/api/solver', solverRoutes);

// 页面路由
app.get('/practice', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/solver', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/solver.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 处理其他所有路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Server URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`}`);
}); 