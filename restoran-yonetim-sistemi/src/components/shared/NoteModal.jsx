import React, { useState, useEffect } from 'react';
import './NoteModal.css';

const NoteModal = ({ isOpen, onClose, onSave, currentNote, quickNotes = [] }) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        setNote(currentNote || '');
    }, [currentNote, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    const addQuickNote = (quickNote) => {
        setNote(prev => prev ? `${prev}, ${quickNote}` : quickNote);
    };

    return (
        <div className="note-modal-overlay">
            <div className="note-modal-content">
                <h2>Sipariş Notu Ekle/Düzenle</h2>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ürünle ilgili özel isteklerinizi buraya yazın..."
                    rows="5"
                />
                {quickNotes.length > 0 && (
                    <div className="quick-notes-container">
                        <p>Hızlı Notlar:</p>
                        {quickNotes.map((qNote, index) => (
                            <button key={index} onClick={() => addQuickNote(qNote)} className="quick-note-btn">
                                {qNote}
                            </button>
                        ))}
                    </div>
                )}
                <div className="note-modal-actions">
                    <button onClick={onClose} className="btn-cancel">Vazgeç</button>
                    <button onClick={handleSave} className="btn-save">Kaydet</button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;


