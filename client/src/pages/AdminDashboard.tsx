import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAdminDashboard, getDashboardGeral, getDashboardClinica } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data;
        if (user?.role === 'SA') {
          data = await getDashboardGeral();
        } else if (user?.role === 'AC') {
          data = await getDashboardClinica();
        } else {
          data = await getAdminDashboard();
        }
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      }
    };
    fetchData();
  }, [user]);

  if (!dashboardData) {
    return <div>Carregando...</div>;
  }

  const renderSuperAdminDashboard = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('dashboard.overview')}</h2>
      <p>{t('dashboard.totalClinics')}: {dashboardData.total_clinicas}</p>
      <p>{t('dashboard.totalPatients')}: {dashboardData.total_pacientes}</p>
      <p>{t('dashboard.totalConsultations')}: {dashboardData.total_consultas}</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={[dashboardData]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_clinicas" fill="#8884d8" name={t('dashboard.totalClinics')} />
          <Bar dataKey="total_pacientes" fill="#82ca9d" name={t('dashboard.totalPatients')} />
          <Bar dataKey="total_consultas" fill="#ffc658" name={t('dashboard.totalConsultations')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderAdminClinicaDashboard = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('dashboard.yourClinic')}</h2>
      <p>{t('dashboard.totalPatients')}: {dashboardData.total_pacientes}</p>
      <p>{t('dashboard.totalConsultations')}: {dashboardData.total_consultas}</p>
      <p>{t('dashboard.newPatients')}: {dashboardData.pacientes_novos}</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={[dashboardData]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_pacientes" fill="#82ca9d" name={t('dashboard.totalPatients')} />
          <Bar dataKey="total_consultas" fill="#ffc658" name={t('dashboard.totalConsultations')} />
          <Bar dataKey="pacientes_novos" fill="#8884d8" name={t('dashboard.newPatients')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderClinicaDetails = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('dashboard.clinicDetails')}</h2>
      {dashboardData.map((clinica: any) => (
        <div key={clinica.nome} className="mb-4">
          <h3 className="text-lg font-semibold">{clinica.nome}</h3>
          <p>{t('dashboard.totalPatients')}: {clinica.total_pacientes}</p>
          <p>{t('dashboard.newPatients')}: {clinica.pacientes_novos}</p>
          <p>{t('dashboard.averageAttendanceTime')}: {clinica.tempo_medio_atendimento} minutos</p>
          <p>{t('dashboard.totalProcedures')}: {clinica.total_procedimentos}</p>
          <p>{t('dashboard.averageSatisfaction')}: {clinica.satisfacao_media.toFixed(2)}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[clinica]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_pacientes" fill="#82ca9d" name={t('dashboard.totalPatients')} />
              <Bar dataKey="pacientes_novos" fill="#8884d8" name={t('dashboard.newPatients')} />
              <Bar dataKey="total_procedimentos" fill="#ffc658" name={t('dashboard.totalProcedures')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">{t('dashboard.title')}</h1>
      {user?.role === 'SA' && renderSuperAdminDashboard()}
      {user?.role === 'AC' && renderAdminClinicaDashboard()}
      {user?.role === 'ME' && renderClinicaDetails()}
    </div>
  );
};

export default AdminDashboard;
