import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Potvrdit',
        cancelText: 'Zrušit',
        type: 'warning',
        onConfirm: () => {},
    });

    const confirm = useCallback(({ title, message, confirmText, cancelText, type = 'warning' }) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                confirmText: confirmText || 'Potvrdit',
                cancelText: cancelText || 'Zrušit',
                type,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        modalState.onCancel?.();
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, [modalState]);

    const handleConfirm = useCallback(() => {
        modalState.onConfirm?.();
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, [modalState]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                type={modalState.type}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
}
