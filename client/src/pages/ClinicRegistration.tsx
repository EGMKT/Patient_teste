import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ClinicRegistration: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    pipedrive_api_token: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/clinicas/', formData);
      alert(t('clinicRegisteredSuccessfully'));
      setFormData({ nome: '', email: '', pipedrive_api_token: '' });
    } catch (error) {
      console.error('Error registering clinic:', error);
      alert(t('errorRegisteringClinic'));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('registerClinic')}</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="nome" className="block mb-2">{t('clinicName')}</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">{t('email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="pipedrive_api_token" className="block mb-2">{t('pipedriveApiToken')}</label>
          <input
            type="text"
            id="pipedrive_api_token"
            name="pipedrive_api_token"
            value={formData.pipedrive_api_token}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {t('register')}
        </button>
      </form>
    </div>
  );
};

export default ClinicRegistration;