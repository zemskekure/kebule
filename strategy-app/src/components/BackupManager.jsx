import React, { useState, useEffect } from 'react';
import { Archive, Download, Upload, Trash2, RotateCcw, Clock, Save, AlertCircle } from 'lucide-react';

const BACKUP_STORAGE_KEY = 'strategieAmbiente_backups';
const MAX_AUTO_BACKUPS = 10;

export function BackupManager({ data, onRestore, theme = 'light' }) {
    const isDark = theme === 'dark';
    const [backups, setBackups] = useState([]);
    const [backupName, setBackupName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
    const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa';

    // Load backups from localStorage
    useEffect(() => {
        loadBackups();
    }, []);

    // Auto-backup on data changes
    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            createAutoBackup();
        }
    }, [data]);

    const loadBackups = () => {
        try {
            const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setBackups(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error('Error loading backups:', error);
        }
    };

    const saveBackups = (newBackups) => {
        try {
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(newBackups));
            setBackups(newBackups);
        } catch (error) {
            console.error('Error saving backups:', error);
            alert('Chyba při ukládání zálohy. Možná je úložiště plné.');
        }
    };

    const createAutoBackup = () => {
        const autoBackups = backups.filter(b => b.isAuto);

        // Only create auto backup if data has changed
        if (autoBackups.length > 0) {
            const lastBackup = autoBackups[0];
            if (JSON.stringify(lastBackup.data) === JSON.stringify(data)) {
                return; // No changes, skip backup
            }
        }

        const newBackup = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: null,
            data: data,
            isAuto: true
        };

        // Keep only last MAX_AUTO_BACKUPS auto backups
        const manualBackups = backups.filter(b => !b.isAuto);
        const updatedAutoBackups = [newBackup, ...autoBackups].slice(0, MAX_AUTO_BACKUPS);

        saveBackups([...updatedAutoBackups, ...manualBackups]);
    };

    const createManualBackup = () => {
        const newBackup = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: backupName.trim() || null,
            data: data,
            isAuto: false
        };

        saveBackups([newBackup, ...backups]);
        setBackupName('');
        setShowNameInput(false);
    };

    const deleteBackup = (id) => {
        if (window.confirm('Opravdu chcete smazat tuto zálohu?')) {
            saveBackups(backups.filter(b => b.id !== id));
        }
    };

    const restoreBackup = (backup) => {
        if (window.confirm('Opravdu chcete obnovit tato data? Současná data budou přepsána.')) {
            onRestore(backup.data);
            alert('Data byla úspěšně obnovena.');
        }
    };

    const exportBackup = (backup) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup.data));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const fileName = backup.name
            ? `backup_${backup.name.replace(/\s+/g, '_')}.json`
            : `backup_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importBackup = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.brands && importedData.years) {
                    const newBackup = {
                        id: Date.now().toString(),
                        timestamp: new Date().toISOString(),
                        name: `Import: ${file.name}`,
                        data: importedData,
                        isAuto: false
                    };
                    saveBackups([newBackup, ...backups]);
                    alert('Záloha byla úspěšně importována.');
                } else {
                    alert('Chyba: Neplatný formát zálohy.');
                }
            } catch (err) {
                alert('Chyba při čtení souboru.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('cs-CZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const autoBackups = backups.filter(b => b.isAuto);
    const manualBackups = backups.filter(b => !b.isAuto);

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Zálohy</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Upload size={16} />
                            Importovat
                            <input type="file" style={{ display: 'none' }} onChange={importBackup} accept=".json" />
                        </label>
                        <button
                            onClick={() => setShowNameInput(!showNameInput)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#00b4d8',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Save size={16} />
                            Vytvořit zálohu
                        </button>
                    </div>
                </div>

                {/* Info Alert */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(0, 180, 216, 0.3)' : 'rgba(0, 180, 216, 0.2)'}`,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: textSecondary
                }}>
                    <AlertCircle size={18} style={{ color: '#00b4d8', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong style={{ color: textColor }}>Vaše data jsou v bezpečí!</strong>
                        <p style={{ margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                            Data jsou uložena v prohlížeči (localStorage) a nepřijdete o ně při aktualizaci kódu z GitHubu.
                            Automatické zálohy se vytváří při každé změně (max. {MAX_AUTO_BACKUPS}).
                            Pro dlouhodobé uložení doporučujeme exportovat zálohu jako soubor.
                        </p>
                    </div>
                </div>

                {/* Manual Backup Name Input */}
                {showNameInput && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: cardBg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px'
                    }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: textColor, fontWeight: 500 }}>
                            Název zálohy (volitelné)
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={backupName}
                                onChange={(e) => setBackupName(e.target.value)}
                                placeholder="např. Před velkou změnou"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: inputBg,
                                    color: textColor,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '6px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={createManualBackup}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#00b4d8',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Uložit
                            </button>
                            <button
                                onClick={() => { setShowNameInput(false); setBackupName(''); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'transparent',
                                    color: textSecondary,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Zrušit
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Backups */}
            {manualBackups.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        color: textColor,
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Archive size={20} style={{ color: '#00b4d8' }} />
                        Manuální zálohy ({manualBackups.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {manualBackups.map(backup => (
                            <BackupCard
                                key={backup.id}
                                backup={backup}
                                onRestore={restoreBackup}
                                onExport={exportBackup}
                                onDelete={deleteBackup}
                                formatDate={formatDate}
                                theme={theme}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Auto Backups */}
            {autoBackups.length > 0 && (
                <div>
                    <h3 style={{
                        color: textColor,
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Clock size={20} style={{ color: '#6c757d' }} />
                        Automatické zálohy ({autoBackups.length}/{MAX_AUTO_BACKUPS})
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {autoBackups.map(backup => (
                            <BackupCard
                                key={backup.id}
                                backup={backup}
                                onRestore={restoreBackup}
                                onExport={exportBackup}
                                onDelete={deleteBackup}
                                formatDate={formatDate}
                                theme={theme}
                                isAuto
                            />
                        ))}
                    </div>
                </div>
            )}

            {backups.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: textSecondary,
                    backgroundColor: cardBg,
                    borderRadius: '12px',
                    border: `1px dashed ${borderColor}`
                }}>
                    <Archive size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>Zatím žádné zálohy</p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                        Zálohy se vytvoří automaticky při změnách dat
                    </p>
                </div>
            )}
        </div>
    );
}

function BackupCard({ backup, onRestore, onExport, onDelete, formatDate, theme, isAuto = false }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    return (
        <div style={{
            padding: '1rem',
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {backup.name || (isAuto ? 'Automatická záloha' : 'Záloha bez názvu')}
                    {isAuto && (
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: isDark ? 'rgba(108, 117, 125, 0.2)' : '#f1f3f5',
                            color: textSecondary
                        }}>
                            AUTO
                        </span>
                    )}
                </div>
                <div style={{ fontSize: '0.85rem', color: textSecondary }}>
                    {formatDate(backup.timestamp)}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onRestore(backup)}
                    title="Obnovit tuto zálohu"
                    style={{
                        padding: '0.5rem',
                        backgroundColor: isDark ? 'rgba(25, 135, 84, 0.2)' : 'rgba(25, 135, 84, 0.1)',
                        color: '#198754',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <RotateCcw size={16} />
                </button>
                <button
                    onClick={() => onExport(backup)}
                    title="Exportovat jako soubor"
                    style={{
                        padding: '0.5rem',
                        backgroundColor: isDark ? 'rgba(0, 180, 216, 0.2)' : 'rgba(0, 180, 216, 0.1)',
                        color: '#00b4d8',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Download size={16} />
                </button>
                <button
                    onClick={() => onDelete(backup.id)}
                    title="Smazat zálohu"
                    style={{
                        padding: '0.5rem',
                        backgroundColor: isDark ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
