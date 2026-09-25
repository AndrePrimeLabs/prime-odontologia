import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patient_id, ehr_id } = await req.json();

    if (!patient_id) {
      return Response.json({ error: 'patient_id é obrigatório' }, { status: 400 });
    }

    // Buscar dados do EHR externo (exemplo genérico - adaptar para seu sistema EHR específico)
    // Aqui você integraria com APIs como:
    // - PEP (Prontuário Eletrônico do Paciente)
    // - Tasy, MV, Philips Tasy, etc.
    // - FHIR APIs
    
    // Exemplo de estrutura de dados retornada do EHR:
    const ehrData = {
      ehr_id: ehr_id || `EHR-${patient_id}`,
      patient_id: patient_id,
      allergies: ['Penicilina', 'Látex'],
      medications: [
        {
          name: 'Losartana',
          dosage: '50mg',
          frequency: '1x ao dia',
          started_date: '2025-01-15'
        },
        {
          name: 'Metformina',
          dosage: '850mg',
          frequency: '2x ao dia',
          started_date: '2024-08-10'
        }
      ],
      chronic_conditions: ['Hipertensão', 'Diabetes Tipo 2'],
      past_procedures: [
        {
          procedure: 'Extração de siso',
          date: '2024-06-15',
          tooth: '38',
          notes: 'Procedimento sem intercorrências'
        },
        {
          procedure: 'Restauração em resina',
          date: '2024-03-20',
          tooth: '46',
          notes: 'Cárie profunda'
        }
      ]
    };

    // Buscar ou criar registro médico do paciente
    const existingRecords = await primeos.entities.MedicalRecord.filter({
      patient_id: patient_id,
      record_type: 'anamnese'
    });

    let medicalRecord;
    
    if (existingRecords.length > 0) {
      // Atualizar registro existente
      medicalRecord = await primeos.entities.MedicalRecord.update(
        existingRecords[0].id,
        {
          ehr_id: ehrData.ehr_id,
          allergies: ehrData.allergies,
          medications: ehrData.medications,
          chronic_conditions: ehrData.chronic_conditions,
          past_procedures: ehrData.past_procedures,
          synced_to_ehr: true,
          last_ehr_sync: new Date().toISOString()
        }
      );
    } else {
      // Criar novo registro
      const patient = await primeos.entities.Customer.filter({ id: patient_id });
      
      medicalRecord = await primeos.entities.MedicalRecord.create({
        patient_id: patient_id,
        patient_name: patient[0]?.name || 'Paciente',
        ehr_id: ehrData.ehr_id,
        record_type: 'anamnese',
        title: 'Dados Importados do EHR',
        content: 'Histórico médico sincronizado automaticamente',
        allergies: ehrData.allergies,
        medications: ehrData.medications,
        chronic_conditions: ehrData.chronic_conditions,
        past_procedures: ehrData.past_procedures,
        provider: user.full_name,
        date: new Date().toISOString().split('T')[0],
        synced_to_ehr: true,
        last_ehr_sync: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      message: 'Dados do EHR sincronizados com sucesso',
      medicalRecord,
      ehrData
    });

  } catch (error) {
    console.error('Sync patient EHR error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao sincronizar com EHR'
    }, { status: 500 });
  }
});
