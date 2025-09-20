import { Router } from 'express';
import { registerUser } from '../controllers/user.controller';
import { upload } from '../middleware/upload';

const router = Router();

// For upload mode, client should send multipart/form-data with files
router.post('/register', upload, registerUser);

export default router;
