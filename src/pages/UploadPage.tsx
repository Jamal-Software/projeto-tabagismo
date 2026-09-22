import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseODS } from '../lib/odsUtils';
import { useAppContext } from '../lib/AppContext';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loadODSData } = useAppContext();

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.endsWith('.ods')) {
      setError('Por favor, envie um arquivo .ods válido.');
      return;
    }

    setIsLoading(true);
    try {
      const workbook = await parseODS(file);
      // Validar se tem a aba ATENDIMENTOS
      if (!workbook.Sheets['ATENDIMENTOS']) {
        throw new Error('Aba "ATENDIMENTOS" não encontrada. Tem certeza de que é a planilha do INCA?');
      }
      
      loadODSData(workbook);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[var(--color-primary-dark)] mb-4">Gestão de Tabagismo</h2>
        <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
          Faça upload da planilha oficial do INCA (.ods) para começar a gerenciar os pacientes pelo navegador. Seus dados não são enviados para a internet.
        </p>
      </div>

      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 transition-colors flex flex-col items-center justify-center cursor-pointer ${
          isDragging ? 'border-[var(--color-primary)] bg-blue-50' : 'border-gray-300 bg-white hover:border-[var(--color-primary)] hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          accept=".ods" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium text-[var(--color-text)]">Processando planilha...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-blue-100 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6">
              <FileSpreadsheet size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Clique ou arraste a planilha aqui</h3>
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Modelo INCA 2023 V1.1 (.ods)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 flex items-center space-x-2 text-[var(--color-danger)] bg-red-50 p-4 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
