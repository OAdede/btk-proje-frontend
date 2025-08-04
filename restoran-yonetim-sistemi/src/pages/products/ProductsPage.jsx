import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Örnek ürün verileri
const sampleProducts = [
    { id: 1, name: 'Adana Kebap', category: 'Ana Yemek', price: 250, stock: 50 },
    { id: 2, name: 'Mercimek Çorbası', category: 'Çorba', price: 80, stock: 100 },
    { id: 3, name: 'Baklava', category: 'Tatlı', price: 120, stock: 75 },
    { id: 4, name: 'Ayran', category: 'İçecek', price: 30, stock: 200 },
];

const ProductsPage = () => {
    const [products, setProducts] = useState(sampleProducts);
    // TODO: Add state for modal and editing product

    const handleAddProduct = () => {
        // TODO: Modal'ı açacak fonksiyon
        console.log('Yeni ürün ekleme formu açılacak.');
    };

    const handleEditProduct = (id) => {
        // TODO: Düzenleme formu açılacak
        console.log(`Ürün ${id} düzenlenecek.`);
    };

    const handleDeleteProduct = (id) => {
        // TODO: Silme onayı ve işlemi
        setProducts(products.filter(p => p.id !== id));
        console.log(`Ürün ${id} silindi.`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Ürün Yönetimi</Typography>
                <Button variant="contained" onClick={handleAddProduct}>
                    Yeni Ürün Ekle
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Ürün Adı</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell align="right">Fiyat (₺)</TableCell>
                            <TableCell align="right">Stok Adedi</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {product.name}
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                                <TableCell align="right">{product.stock}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEditProduct(product.id)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteProduct(product.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ProductsPage;
