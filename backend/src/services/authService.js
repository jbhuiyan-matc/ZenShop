import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const login = async (email, password) => {
  const user = await getPrismaClient().user.findUnique({ where: { email } });
  
  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '400d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

export const register = async (name, email, password) => {
  const existingUser = await getPrismaClient().user.findUnique({ where: { email } });
  
  if (existingUser) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await getPrismaClient().user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'USER'
    }
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '400d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

export const getProfile = async (userId) => {
  const user = await getPrismaClient().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user;
};
