// ... imports anteriores
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { getReports, getNewClinicsData } from '../api';
import NewClinicsChart from '../components/NewClinicsChart';

interface Report {
  id: number;
  clinicName: string;
  totalPatients: number;
  newPatients: number;
  totalConsultations: number;
  averageConsultationTime: number;
}

const ViewReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [newClinicsData, setNewClinicsData] = useState<{ month: string; count: number }[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsData = await getReports();
        setReports(reportsData);

        const clinicsData = await getNewClinicsData();
        setNewClinicsData(clinicsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('viewReports')}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('clinicName')}</TableCell>
              <TableCell>{t('totalPatients')}</TableCell>
              <TableCell>{t('newPatients')}</TableCell>
              <TableCell>{t('totalConsultations')}</TableCell>
              <TableCell>{t('averageConsultationTime')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.clinicName}</TableCell>
                <TableCell>{report.totalPatients}</TableCell>
                <TableCell>{report.newPatients}</TableCell>
                <TableCell>{report.totalConsultations}</TableCell>
                <TableCell>{report.averageConsultationTime} min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="h2" className="mt-8 mb-4">
        {t('newClinicsOverTime')}
      </Typography>
      <NewClinicsChart data={newClinicsData} />
    </div>
  );
};

export default ViewReports;
