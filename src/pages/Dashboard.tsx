import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Activity, HeartPulse, Pill } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { getAtendimentos, colMap, PATIENT_START_ROW } from '../lib/odsUtils';

export default function Dashboard() {
  const { odsData } = useAppContext();
  const [stats, setStats] = useState({
    total: 0,
    adesao: 0,
    abst1Mes: 0,
    abst6MesesRel: 0,
    cessacao6Meses: 0,
    usoMed: 0
  });

  useEffect(() => {
    if (odsData) {
      const atendimentos = getAtendimentos(odsData);
      const dataRows = atendimentos.slice(PATIENT_START_ROW).filter((row: any) => row && (row[colMap.nome] || row[colMap.tel]));
      
      const total = dataRows.length;
      let presentes1Sessao = 0;
      let presentes4Sessao = 0;
      let abstinentes4Sessao = 0;
      let abstinentes6Meses = 0;
      let usaramMed = 0;

      dataRows.forEach((row: any) => {
        const sit1 = row[colMap.sit1];
        const sit4 = row[colMap.sit4];
        const sit6M = row[colMap.sitManutM4]; // M4 é o 6º mês
        const med = row[colMap.apoioMed];

        const isPresent = (s: string) => ['SF', 'SFM', 'FUM', 'REC'].includes(s);
        const isAbstinent = (s: string) => ['SF', 'SFM'].includes(s);

        if (sit1 && isPresent(sit1)) presentes1Sessao++;
        if (sit4 && isPresent(sit4)) presentes4Sessao++;
        
        if (sit4 && isAbstinent(sit4)) abstinentes4Sessao++;
        if (sit6M && isAbstinent(sit6M)) abstinentes6Meses++;

        if (med && med !== 'Nenhum' && med !== '') usaramMed++;
      });
      
      setStats({
        total,
        adesao: presentes1Sessao ? Math.round((presentes4Sessao / presentes1Sessao) * 100) : 0,
        abst1Mes: presentes1Sessao ? Math.round((abstinentes4Sessao / presentes1Sessao) * 100) : 0,
        abst6MesesRel: abstinentes4Sessao ? Math.round((abstinentes6Meses / abstinentes4Sessao) * 100) : 0,
        cessacao6Meses: presentes1Sessao ? Math.round((abstinentes6Meses / presentes1Sessao) * 100) : 0,
        usoMed: total ? Math.round((usaramMed / total) * 100) : 0
      });
    }
  }, [odsData]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary-dark)]">Indicadores Epidemiológicos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-[var(--color-primary)] flex items-center justify-center mr-4">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Pacientes Acompanhados</p>
            <p className="text-3xl font-bold text-[var(--color-text)]">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Adesão ao Tratamento</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-[var(--color-text)]">{stats.adesao}%</p>
              <p className="text-xs text-[var(--color-text-muted)] pb-1">(4ª vs 1ª Sessão)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center">
          <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-4">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Abstinência 1º Mês</p>
            <p className="text-3xl font-bold text-[var(--color-text)]">{stats.abst1Mes}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center">
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
            <HeartPulse size={28} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Taxa de Cessação Geral (6 Meses)</p>
            <p className="text-3xl font-bold text-[var(--color-text)]">{stats.cessacao6Meses}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
            <Pill size={28} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Uso de Medicação</p>
            <p className="text-3xl font-bold text-[var(--color-text)]">{stats.usoMed}%</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold text-[var(--color-primary-dark)] mb-2">Sincronização com o INCA</h3>
        <p className="text-[var(--color-text-muted)]">
          As estatísticas acima são uma prévia calculada em tempo real baseada nos atendimentos (Fases do PNCT). 
          Para gerar os relatórios oficiais completos do Ministério da Saúde para envio quadrimestral, 
          clique em <strong>Salvar e Baixar</strong> e abra o arquivo atualizado no LibreOffice ou Excel — 
          a aba <strong>RESULTADOS</strong> será recalculada automaticamente com todos os gráficos!
        </p>
      </div>
    </div>
  );
}
