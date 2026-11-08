import { Router } from 'express';
import userRouter from './users.route.js';
import authRouter from './auth.route.js';
import uploadRouter from './upload.route.js';
import classRouter from './classes.route.js';
import lessonRouter from './lessons.route.js';
import assignmentRouter from './assignments.route.js';
import submissionRouter from './submissions.route.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/classes', classRouter);
router.use('/lessons', lessonRouter);
router.use('/assignments', assignmentRouter);
router.use('/submissions', submissionRouter);
router.use('/upload', uploadRouter);

export default router;
