import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Phone, User, Activity } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { getAtendimentos, PATIENT_START_ROW } from '../lib/odsUtils';

export default function PatientsList() {
  const { odsData } = useAppContext();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (odsData) {
      const atendimentos = getAtendimentos(odsData);
      
      const data = atendimentos.slice(PATIENT_START_ROW).map((row: any, index: number) => ({
        originalIndex: index + PATIENT_START_ROW,
        nome: row[0] || '',
        telefone: row[1] || '',
        raca: row[2] || '',
        sexo: row[3] || '',
        idade: row[4] || '',
        tipoTabaco: row[5] || '',
        tempoFuma: row[6] || '',
        comorbidade1: row[7] || '',
        id: `PCT-${String(index + 1).padStart(4, '0')}`,
        displayName: row[0] ? row[0] : (row[1] ? `Tel: ${row[1]}` : `Paciente ${index + 1}`)
      })).filter((p: any) => p.nome || p.telefone || p.sexo || p.idade); 
      
      setPatients(data);
    }
  }, [odsData]);

  const filteredPatients = patients.filter(p => 
    p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.idade).includes(searchTerm) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[var(--color-primary-dark)]">Atendimentos</h2>
        
        <Link 
          to="/patients/new" 
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center space-x-2 w-full md:w-auto justify-center shadow hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Novo Atendimento</span>
        </Link>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)] mb-6 flex items-center">
        <Search className="text-[var(--color-text-muted)] mr-3" />
        <input 
          type="text" 
          placeholder="Buscar paciente por nome, telefone ou ID..." 
          className="w-full outline-none bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Visão Mobile (Cards) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredPatients.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--color-border)] flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-white bg-blue-500 px-2 py-1 rounded-full mb-2 inline-block shadow-sm tracking-wide">{p.id}</span>
                <h3 className="font-bold text-lg text-gray-800">{p.displayName}</h3>
              </div>
              <button onClick={() => navigate(`/patients/${p.originalIndex}`)} className="text-[var(--color-primary)] p-2 bg-blue-50 hover:bg-blue-100 transition-colors rounded-full shrink-0">
                <Edit2 size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-muted)] mt-2">
              <div className="flex items-center"><User size={14} className="mr-1.5 text-gray-400" /> {p.sexo || '-'}   {p.idade ? `${p.idade} anos` : ''}</div>
              <div className="flex items-center"><Activity size={14} className="mr-1.5 text-gray-400" /> {p.tipoTabaco || '-'}</div>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-[var(--color-text-muted)] mb-2">Nenhum paciente encontrado.</div>
          </div>
        )}
      </div>

      {/* Visão Desktop (Tabela) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-[var(--color-border)]">
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">ID / Identificação</th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">Sexo/Idade</th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">Raça/Cor</th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">Tipo de Tabaco</th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)] text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(p => (
              <tr key={p.id} className="border-b border-[var(--color-border)] hover:bg-blue-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{p.displayName}</div>
                  <div className="text-xs text-gray-500 mt-1">{p.id}</div>
                </td>
                <td className="p-4 text-gray-600">{p.sexo}   {p.idade ? `${p.idade} anos` : ''}</td>
                <td className="p-4 text-gray-600">{p.raca}</td>
                <td className="p-4 text-gray-600">{p.tipoTabaco}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => navigate(`/patients/${p.originalIndex}`)} 
                    className="text-[var(--color-primary)] hover:bg-blue-100 p-2 rounded-xl transition-colors inline-flex"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-[var(--color-text-muted)] border-dashed">Nenhum paciente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
