import * as authService from '../services/authService.js';
import { logger } from '../utils/logger.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    logger.info(`User logged in: ${email}`);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
    } else {
      logger.error('Login error:', error);
      next(error);
    }
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    logger.info(`New user registered: ${email}`);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      logger.error('Registration error:', error);
      next(error);
    }
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userProfile = await authService.getProfile(req.user.id);
    res.json(userProfile);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error fetching user profile:', error);
      next(error);
    }
  }
};
