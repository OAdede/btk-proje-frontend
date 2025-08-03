import React, { useState, useContext } from 'react';
import { TableContext } from '../../context/TableContext.jsx';
import { Button, TextField, Paper, Typography, List, ListItem, ListItemText, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function MasaYonetimi() {
    const { tables, addTable, deleteTable } = useContext(TableContext);
    const [newTableName, setNewTableName] = useState('');

    const handleAddTable = () => {
        if (newTableName.trim() === '') {
            alert('Masa adı boş olamaz.');
            return;
        }
        addTable(newTableName);
        setNewTableName('');
    };

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Yeni Masa Ekle
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Masa Adı (Örn: Masa 10, Bahçe 2)"
                        variant="outlined"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" onClick={handleAddTable} sx={{ py: '15px' }}>
                        Ekle
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Mevcut Masalar
                </Typography>
                <List>
                    {tables.map((table) => (
                        <ListItem
                            key={table.id}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => deleteTable(table.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                            sx={{ borderBottom: '1px solid #eee' }}
                        >
                            <ListItemText primary={table.name} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}

export default MasaYonetimi;
