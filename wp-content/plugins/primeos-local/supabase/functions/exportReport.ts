import { createPrimeosClientFromRequest } from './primeosClient.ts';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format, reportData, reportTitle, filters } = await req.json();

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(reportData[0] || {});
      const csvContent = [
        [reportTitle],
        [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
        [`Filtros: ${JSON.stringify(filters)}`],
        [],
        headers.join(','),
        ...reportData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${reportTitle}_${Date.now()}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text(reportTitle, 20, yPos);
      yPos += 10;

      // Date and Filters
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPos);
      yPos += 7;
      doc.text(`Período: ${filters.startDate} até ${filters.endDate}`, 20, yPos);
      yPos += 10;

      // Table headers
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      
      const headers = Object.keys(reportData[0] || {});
      const colWidth = (pageWidth - 40) / headers.length;
      
      headers.forEach((header, idx) => {
        doc.text(header, 20 + idx * colWidth, yPos);
      });
      yPos += 10;

      // Table data
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      reportData.forEach(row => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        headers.forEach((header, idx) => {
          const value = String(row[header] || '');
          doc.text(value.substring(0, 20), 20 + idx * colWidth, yPos);
        });
        yPos += 7;
      });

      const pdfBytes = doc.output('arraybuffer');
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportTitle}_${Date.now()}.pdf"`
        }
      });
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Export Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
