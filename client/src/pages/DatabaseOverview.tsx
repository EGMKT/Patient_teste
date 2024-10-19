import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDatabaseOverview } from '../api';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField } from '@mui/material';

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
  const [searchTerm, setSearchTerm] = useState('');
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

    const filteredData = tableData.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const headers = Object.keys(tableData[0]);

    return (
      <TableContainer component={Paper}>
        <TextField
          label={t('search')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{t(header)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>{row[header]?.toString() || ''}</TableCell>
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
          <Button
            key={tableName}
            onClick={() => setSelectedTable(tableName as keyof DatabaseData)}
            variant={selectedTable === tableName ? "contained" : "outlined"}
            className="mr-2 mb-2"
          >
            {t(tableName)}
          </Button>
        ))}
      </div>
      {selectedTable && renderTable(selectedTable)}
    </div>
  );
};

export default DatabaseOverview;
