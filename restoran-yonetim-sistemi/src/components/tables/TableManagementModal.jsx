import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { ThemeContext } from '../../context/ThemeContext';
import { TableContext } from '../../context/TableContext';

const TableManagementModal = ({ show, onHide, table }) => {
  const { colors } = useContext(ThemeContext);
  const { updateTable, deleteTable } = useContext(TableContext);
  
  const [tableName, setTableName] = useState(table?.name || '');
  const [capacity, setCapacity] = useState(table?.capacity || 4);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal açıldığında verileri resetle
  React.useEffect(() => {
    if (show && table) {
      setTableName(table.name || '');
      setCapacity(table.capacity || 4);
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [show, table]);

  const handleSave = async () => {
    if (!tableName.trim()) {
      setError('Masa ismi boş olamaz');
      return;
    }

    if (capacity < 1 || capacity > 20) {
      setError('Kişi sayısı 1-20 arasında olmalıdır');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (updateTable) {
        await updateTable(table.id, {
          name: tableName.trim(),
          capacity: parseInt(capacity)
        });
      }
      onHide();
    } catch (err) {
      setError(err.message || 'Güncelleme sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (deleteTable) {
        await deleteTable(table.id);
      }
      onHide();
    } catch (err) {
      setError(err.message || 'Silme sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!table) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
    >
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: colors.cardBackground, 
          borderColor: colors.border,
          color: colors.text 
        }}
      >
        <Modal.Title style={{ color: colors.text }}>
          🏷️ Masa Yönetimi - {table.name || `Masa ${table.id}`}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body 
        style={{ 
          backgroundColor: colors.cardBackground,
          color: colors.text 
        }}
      >
        {error && (
          <Alert 
            variant="danger" 
            style={{ 
              backgroundColor: colors.isDarkMode ? '#8b2635' : '#f8d7da',
              borderColor: colors.isDarkMode ? '#a94442' : '#f5c6cb',
              color: colors.isDarkMode ? '#ffffff' : '#721c24'
            }}
          >
            {error}
          </Alert>
        )}

        {!showDeleteConfirm ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.text, fontWeight: '600' }}>
                Masa İsmi
              </Form.Label>
              <Form.Control
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Masa ismi girin..."
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text
                }}
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.text, fontWeight: '600' }}>
                Kişi Sayısı
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text
                }}
                disabled={isLoading}
              />
              <Form.Text style={{ color: colors.textSecondary }}>
                1-20 kişi arasında bir değer girin
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                style={{
                  borderColor: colors.isDarkMode ? '#dc3545' : '#dc3545',
                  color: colors.isDarkMode ? '#dc3545' : '#dc3545'
                }}
              >
                🗑️ Masayı Sil
              </Button>
              
              <div>
                <Button
                  variant="outline-secondary"
                  onClick={onHide}
                  className="me-2"
                  disabled={isLoading}
                  style={{
                    borderColor: colors.border,
                    color: colors.textSecondary
                  }}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.primary,
                    borderColor: colors.primary
                  }}
                >
                  {isLoading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h5 style={{ color: colors.text, marginBottom: '15px' }}>
              Masayı Silmek İstediğinize Emin misiniz?
            </h5>
            <p style={{ color: colors.textSecondary, marginBottom: '25px' }}>
              <strong>{table.name || `Masa ${table.id}`}</strong> kalıcı olarak silinecek. 
              Bu işlem geri alınamaz.
            </p>
            
            <div>
              <Button
                variant="outline-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="me-3"
                disabled={isLoading}
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545'
                }}
              >
                {isLoading ? '⏳ Siliniyor...' : '🗑️ Evet, Sil'}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TableManagementModal;
