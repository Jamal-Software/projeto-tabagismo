import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Pill, Clock } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { colMap, PATIENT_START_ROW, excelDateToStr, strToExcelDate } from '../lib/odsUtils';
import * as XLSX from 'xlsx';

export default function PatientForm() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { odsData, updateODSData } = useAppContext();
  
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (odsData && odsData.Sheets['ATENDIMENTOS']) {
      const sheet = odsData.Sheets['ATENDIMENTOS'];
      
      const getCellValue = (rIndex: number, col: number) => {
        const address = XLSX.utils.encode_cell({ r: rIndex, c: col });
        return sheet[address] ? sheet[address].v : '';
      };
      
      if (id) {
        const rowIndex = parseInt(id);
        const data: any = {};
        Object.keys(colMap).forEach((key) => {
          const colIndex = colMap[key as keyof typeof colMap];
          let val = getCellValue(rowIndex, colIndex);
          if (key.startsWith('data')) {
            val = excelDateToStr(val);
          }
          data[key] = val || '';
        });
        setFormData(data);
      } else {
        // Novo paciente
        const initData: any = {};
        Object.keys(colMap).forEach((key) => initData[key] = '');
        setFormData(initData);
      }
    }
  }, [id, odsData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!odsData) return;
    
    const sheet = odsData.Sheets['ATENDIMENTOS'];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z1000');
    
    let rowIndex = id ? parseInt(id) : -1;
    
    if (!id) {
      // Procurar linha vazia
      rowIndex = range.e.r + 1;
      for (let R = PATIENT_START_ROW; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: colMap.nome })]; 
        if (!cell || !cell.v) {
          rowIndex = R;
          break;
        }
      }
      if (rowIndex > range.e.r) {
        sheet['!ref'] = XLSX.utils.encode_range({ s: range.s, e: { r: rowIndex, c: range.e.c } });
      }
    }
    
    const updateCell = (col: number, key: string, value: any) => {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      if (!sheet[address]) sheet[address] = { t: 's', v: '' }; 
      
      if (value === '') {
        sheet[address].v = '';
      } else if (key.startsWith('data')) {
        // Datas
        sheet[address].t = 's'; // Salvando como string DD/MM/YYYY para compatibilidade simples
        sheet[address].v = strToExcelDate(value);
      } else if (typeof value === 'number' || (!isNaN(Number(value)) && String(value).trim() !== '')) {
        sheet[address].t = 'n';
        sheet[address].v = Number(value);
      } else {
        sheet[address].t = 's';
        sheet[address].v = String(value);
      }
    };
    
    Object.keys(colMap).forEach((key) => {
      updateCell(colMap[key as keyof typeof colMap], key, formData[key] || '');
    });
    
    updateODSData(odsData); 
    navigate('/patients');
  };

  const tabs = [
    { id: 0, label: 'Perfil', icon: <User size={18} /> },
    { id: 1, label: 'Mês 1 (Sessões)', icon: <Calendar size={18} /> },
    { id: 2, label: 'Terapêutica', icon: <Pill size={18} /> },
    { id: 3, label: 'Manutenção', icon: <Clock size={18} /> },
  ];

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">{id ? 'Editar Paciente' : 'Novo Paciente'}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        
        {/* Navegação por Abas */}
        <div className="flex border-b border-[var(--color-border)] overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-4 px-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-muted)] hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          
          {/* ABA 0: PERFIL E HISTÓRICO */}
          {activeTab === 0 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 text-[var(--color-primary-dark)]">Dados Demográficos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Nome Completo</label>
                  <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Telefone</label>
                  <input type="text" name="tel" value={formData.tel || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Raça / Cor</label>
                  <select name="raca" value={formData.raca || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="Branca">Branca</option><option value="Preta">Preta</option><option value="Parda">Parda</option>
                    <option value="Amarela">Amarela</option><option value="Indígena">Indígena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Sexo</label>
                  <select name="sexo" value={formData.sexo || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option><option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Idade</label>
                  <input type="number" name="idade" value={formData.idade || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 text-[var(--color-primary-dark)]">Histórico Clínico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Tipo de Tabaco</label>
                  <select name="tipoTabaco" value={formData.tipoTabaco || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="Convencional">Convencional</option><option value="Palha">Palha</option>
                    <option value="Cigarro Eletrônico">Cigarro Eletrônico</option><option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Fagerström (Grau 0-10)</label>
                  <select name="fagerstrom" value={formData.fagerstrom || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="0-2: Muito Baixa">0-2: Muito Baixa</option><option value="3-4: Baixa">3-4: Baixa</option>
                    <option value="5: Média">5: Média</option><option value="6-7: Elevada">6-7: Elevada</option><option value="8-10: Muito Elevada">8-10: Muito Elevada</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Comorbidades (Selecione até 3)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" name="comorb1" placeholder="Comorbidade 1" value={formData.comorb1 || ''} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl outline-none" />
                    <input type="text" name="comorb2" placeholder="Comorbidade 2" value={formData.comorb2 || ''} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl outline-none" />
                    <input type="text" name="comorb3" placeholder="Comorbidade 3" value={formData.comorb3 || ''} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 1: SESSÕES 1º MÊS */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <label className="block text-sm font-bold text-blue-900 mb-1">Data da Avaliação Clínica (Ancoragem)</label>
                <input type="date" name="dataAvaliacao" value={formData.dataAvaliacao || ''} onChange={handleChange} className="w-full p-3 border border-blue-200 rounded-xl outline-none" />
              </div>

              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`sessao${i}`} className="border rounded-xl p-4 mb-4 bg-gray-50">
                  <h4 className="font-bold mb-3">{i}ª Sessão {i === 1 ? '(Obrigatório)' : i === 5 ? '(Opcional)' : ''}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
                      <input type="date" name={`data${i}`} value={formData[`data${i}`] || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Situação</label>
                      <select name={`sit${i}`} value={formData[`sit${i}`] || ''} onChange={handleChange} className={`w-full p-2 border border-gray-300 rounded-lg outline-none text-sm bg-white ${formData[`sit${i}`] === 'SF' ? 'text-green-600 font-bold' : formData[`sit${i}`] === 'FUM' ? 'text-red-600 font-bold' : ''}`}>
                        <option value="">--</option>
                        <option value="SF">SF (Sem Fumar)</option>
                        <option value="SFM">SFM (Sem Fumar c/ Med)</option>
                        <option value="FUM">FUM (Fumando)</option>
                        <option value="FAL">FAL (Faltou)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Modalidade</label>
                      <select name={`atend${i}`} value={formData[`atend${i}`] || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none text-sm bg-white">
                        <option value="">--</option>
                        <option value="Presencial (Individual)">Presencial (Individual)</option>
                        <option value="Presencial (Grupo)">Presencial (Grupo)</option>
                        <option value="À distancia (Individ)">À distância (Individual)</option>
                        <option value="À distancia (Grupo)">À distância (Grupo)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA 2: TERAPÊUTICA */}
          {activeTab === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 text-[var(--color-primary-dark)]">Apoio Medicamentoso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Início da Medicação</label>
                  <input type="date" name="dataInicioMed" value={formData.dataInicioMed || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Medicamento Utilizado</label>
                  <select name="apoioMed" value={formData.apoioMed || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="Nenhum">Nenhum</option>
                    <option value="Adesivo">Adesivos</option>
                    <option value="Goma">Gomas</option>
                    <option value="Bupropiona">Bupropiona</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 text-[var(--color-primary-dark)]">Práticas Integrativas (PICs)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">PIC 1</label>
                  <select name="pic1" value={formData.pic1 || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Nenhuma</option>
                    <option value="Acupuntura">Acupuntura</option>
                    <option value="Auriculoterapia">Auriculoterapia</option>
                    <option value="Meditação">Meditação</option>
                    <option value="Fitoterapia">Fitoterapia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">PIC 2</label>
                  <select name="pic2" value={formData.pic2 || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white">
                    <option value="">Nenhuma</option>
                    <option value="Acupuntura">Acupuntura</option>
                    <option value="Auriculoterapia">Auriculoterapia</option>
                    <option value="Meditação">Meditação</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: MANUTENÇÃO */}
          {activeTab === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 text-sm text-orange-800">
                Lembrete: Só preencha se o paciente não tiver situação "ABD" (Abandono) ou "FAL" persistente. Registre "REC" se ele recair.
              </div>

              {/* Exemplo para Quinzenais e Primeiras 3 Mensais */}
              <h4 className="font-bold text-gray-700">Encontros Quinzenais</h4>
              {[1, 2].map((i) => (
                <div key={`quinz${i}`} className="border rounded-xl p-3 mb-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <div className="font-medium text-sm">{i}º Quinzenal</div>
                  <input type="date" name={`dataManutQ${i}`} value={formData[`dataManutQ${i}`] || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg outline-none text-sm" />
                  <select name={`sitManutQ${i}`} value={formData[`sitManutQ${i}`] || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg outline-none text-sm bg-white">
                    <option value="">Situação</option><option value="SF">SF</option><option value="SFM">SFM</option><option value="REC">REC</option><option value="ABD">ABD</option>
                  </select>
                </div>
              ))}

              <h4 className="font-bold text-gray-700 mt-6">Encontros Mensais</h4>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                let badge = '';
                if (i === 1) badge = '3º Mês';
                if (i === 4) badge = '6º Mês';
                if (i === 10) badge = '12º Mês';
                
                return (
                  <div key={`mensal${i}`} className="border rounded-xl p-3 mb-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="font-medium text-sm flex items-center justify-between pr-2">
                      {i}º Mensal {badge && <span className="bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded-full ml-2">{badge}</span>}
                    </div>
                    <input type="date" name={`dataManutM${i}`} value={formData[`dataManutM${i}`] || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg outline-none text-sm" />
                    <select name={`sitManutM${i}`} value={formData[`sitManutM${i}`] || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg outline-none text-sm bg-white">
                      <option value="">Situação</option><option value="SF">SF</option><option value="SFM">SFM</option><option value="REC">REC</option><option value="ABD">ABD</option>
                    </select>
                  </div>
                )
              })}
            </div>
          )}

        </div>
        
        {/* FOOTER FIXO NO FORM */}
        <div className="bg-gray-50 p-4 border-t border-[var(--color-border)] flex justify-between items-center fixed bottom-0 left-0 right-0 md:static z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none pb-safe">
          <div className="hidden md:block text-sm text-[var(--color-text-muted)]">
            Aba {activeTab + 1} de 4
          </div>
          <div className="flex w-full md:w-auto space-x-2">
            {activeTab > 0 && (
              <button onClick={() => setActiveTab(a => a - 1)} className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium w-full md:w-auto">
                Anterior
              </button>
            )}
            {activeTab < 3 ? (
              <button onClick={() => setActiveTab(a => a + 1)} className="px-6 py-3 bg-blue-100 text-[var(--color-primary-dark)] rounded-xl font-bold w-full md:w-auto">
                Próximo
              </button>
            ) : (
              <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 w-full shadow-lg hover:bg-[var(--color-primary-dark)]">
                <Save size={20} />
                <span>Salvar</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
