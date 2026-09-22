import * as XLSX from 'xlsx';

export const parseODS = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellFormula: true, cellStyles: true });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportODS = (workbook: any, filename: string = '2026 - Tabagismo_Atualizado.ods') => {
  XLSX.writeFile(workbook, filename, { bookType: 'ods' });
};

// As linhas de paciente começam no index 6 (Row 7 do Excel)
export const PATIENT_START_ROW = 6; 

export const getAtendimentos = (workbook: any) => {
  if (!workbook || !workbook.Sheets['ATENDIMENTOS']) return [];
  return XLSX.utils.sheet_to_json(workbook.Sheets['ATENDIMENTOS'], { header: 1, defval: '' });
};

export const colMap = {
  nome: 0,
  tel: 1,
  raca: 2,
  sexo: 3,
  idade: 4,
  tipoTabaco: 5,
  tempoFuma: 6,
  comorb1: 7,
  comorb2: 8,
  comorb3: 9,
  ativFisica: 10,
  participouAntes: 11,
  fagerstrom: 12,
  
  dataAvaliacao: 13,
  
  sit1: 14,
  atend1: 15,
  data1: 16,
  
  sit2: 17,
  atend2: 18,
  data2: 19,
  
  sit3: 20,
  atend3: 21,
  data3: 22,
  
  sit4: 23,
  atend4: 24,
  data4: 25,
  
  sit5: 26,
  atend5: 27,
  data5: 28,
  
  dataInicioMed: 29,
  apoioMed: 30,
  pic1: 31,
  pic2: 32,
  
  dataManutQ1: 33, sitManutQ1: 34, atendManutQ1: 35,
  dataManutQ2: 36, sitManutQ2: 37, atendManutQ2: 38,
  
  dataManutM1: 39, sitManutM1: 40, atendManutM1: 41, // 3º mês
  dataManutM2: 42, sitManutM2: 43, atendManutM2: 44,
  dataManutM3: 45, sitManutM3: 46, atendManutM3: 47,
  dataManutM4: 48, sitManutM4: 49, atendManutM4: 50, // 6º mês
  dataManutM5: 51, sitManutM5: 52, atendManutM5: 53,
  dataManutM6: 54, sitManutM6: 55, atendManutM6: 56,
  dataManutM7: 57, sitManutM7: 58, atendManutM7: 59,
  dataManutM8: 60, sitManutM8: 61, atendManutM8: 62,
  dataManutM9: 63, sitManutM9: 64, atendManutM9: 65,
  dataManutM10: 66, sitManutM10: 67, atendManutM10: 68 // 12º mês
};

// Funcao utilitaria para ler datas do Excel (numero serial para string DD/MM/YYYY)
export const excelDateToStr = (excelDate: any) => {
  if (!excelDate) return '';
  if (typeof excelDate === 'string') return excelDate; // Ja formatado ou digitado
  const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD para inputs HTML
};

// Formatar de YYYY-MM-DD para Excel Serial ou DD/MM/YYYY
export const strToExcelDate = (str: string) => {
  if (!str) return '';
  const parts = str.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // A planilha original le DD/MM/YYYY melhor que numero puro se não tiver formato configurado
  }
  return str;
};
