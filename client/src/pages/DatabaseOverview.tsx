import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDatabaseOverview } from '../api';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer } from '@mui/material';

interface DatabaseData {
  clinicas: any[];
  usuarios: any[];
  medicos: any[];
  pacientes: any[];
  servicos: any[];
  consultas: any[];
}

const DatabaseOverview: React.FC = () => {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [selectedTable, setSelectedTable] = useState<keyof DatabaseData | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDatabaseOverview();
        setData(response);
      } catch (error) {
        console.error('Erro ao buscar visão geral do banco de dados:', error);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return <div>{t('loading')}</div>;
  }

  const renderTable = (tableName: keyof DatabaseData) => {
    const tableData = data[tableName];
    if (!tableData || tableData.length === 0) return null;

    const headers = Object.keys(tableData[0]);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{t(header)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('databaseOverview')}</h1>
      <div className="mb-4">
        {Object.keys(data).map((tableName) => (
          <button
            key={tableName}
            onClick={() => setSelectedTable(tableName as keyof DatabaseData)}
            className="mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t(tableName)}
          </button>
        ))}
      </div>
      {selectedTable && renderTable(selectedTable)}
    </div>
  );
};

export default DatabaseOverview;
