import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Tentando fazer login...');
      const { access, user } = await login(email, password);
      console.log('Login bem-sucedido:', { access, user });
      if (user && user.email && user.role) {
        authLogin(access, {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username || '',
          clinica: user.clinica || null
        });
        console.log('AuthLogin chamado');
        navigate('/doctor-selection');
      } else {
        throw new Error('User information incomplete or not available');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('login')}</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          autoComplete="current-password"
        />
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {t('loginButton')}
        </button>
      </form>
    </div>
  );
};

export default Login;
