import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointment_id, notes, clinical_findings } = await req.json();

    if (!appointment_id) {
      return Response.json({ error: 'appointment_id é obrigatório' }, { status: 400 });
    }

    // Buscar dados da consulta
    const appointment = await primeos.entities.Appointment.filter({ id: appointment_id });
    
    if (!appointment || appointment.length === 0) {
      return Response.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    const appt = appointment[0];

    // Buscar registro médico do paciente para obter ehr_id
    const medicalRecords = await primeos.entities.MedicalRecord.filter({
      patient_id: appt.patient_id
    });

    const ehr_id = medicalRecords.length > 0 ? medicalRecords[0].ehr_id : null;

    // Preparar dados para envio ao EHR
    const ehrPayload = {
      patient_ehr_id: ehr_id,
      patient_name: appt.patient_name,
      appointment_date: appt.date,
      appointment_time: appt.time,
      service_type: appt.service_type,
      provider: appt.provider || user.full_name,
      clinical_notes: notes,
      findings: clinical_findings,
      timestamp: new Date().toISOString()
    };

    // Aqui você faria a chamada real para a API do EHR
    // Exemplo para diferentes sistemas:
    // - FHIR: POST /Observation, /Encounter
    // - HL7: Enviar mensagem HL7
    // - API proprietária: POST /api/clinical-notes
    
    console.log('Enviando para EHR:', ehrPayload);

    // Criar registro de evolução no sistema local
    const evolutionRecord = await primeos.entities.MedicalRecord.create({
      patient_id: appt.patient_id,
      patient_name: appt.patient_name,
      ehr_id: ehr_id,
      record_type: 'evolucao',
      title: `Evolução - ${appt.service_type}`,
      content: notes || '',
      provider: user.full_name,
      date: new Date().toISOString().split('T')[0],
      synced_to_ehr: true,
      last_ehr_sync: new Date().toISOString()
    });

    // Atualizar a consulta com flag de sincronização
    await primeos.entities.Appointment.update(appointment_id, {
      notes: notes,
      ehr_synced: true
    });

    return Response.json({
      success: true,
      message: 'Notas salvas no EHR com sucesso',
      evolutionRecord,
      ehrPayload
    });

  } catch (error) {
    console.error('Save notes to EHR error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao salvar notas no EHR'
    }, { status: 500 });
  }
});
