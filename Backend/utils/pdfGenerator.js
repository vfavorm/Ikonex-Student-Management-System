const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReportCard = (studentData, scores, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('STUDENT REPORT CARD', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('_'.repeat(80), { align: 'center' });
      doc.moveDown();

      doc.fontSize(11).font('Helvetica-Bold').text('STUDENT INFORMATION', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica')
        .text(`Name: ${studentData.name}`)
        .text(`Admission Number: ${studentData.admission_number}`)
        .text(`Class Stream: ${studentData.stream}`)
        .text(`Total Subjects: ${studentData.subjects_sat}`);
      doc.moveDown();

      doc.fontSize(11).font('Helvetica-Bold').text('ACADEMIC PERFORMANCE', { underline: true });
      doc.moveDown(0.3);
      
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 200;
      const col3 = 300;
      const col4 = 380;
      const col5 = 450;
      const rowHeight = 25;

      doc.fontSize(9).font('Helvetica-Bold')
        .text('Subject', col1, tableTop)
        .text('Exam', col2, tableTop)
        .text('C.A.', col3, tableTop)
        .text('Total', col4, tableTop)
        .text('Grade', col5, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let yPosition = tableTop + rowHeight;
      doc.fontSize(9).font('Helvetica');

      scores.forEach((score) => {
        doc.text(score.subject_name || 'N/A', col1, yPosition)
          .text(score.exam_score.toString(), col2, yPosition)
          .text(score.continuous_assessment.toString(), col3, yPosition)
          .text(score.total_score.toString(), col4, yPosition)
          .text(score.grade || 'N/A', col5, yPosition);
        yPosition += rowHeight;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      doc.fontSize(10).font('Helvetica-Bold')
        .text(`Total Marks: ${studentData.total_marks}`, col1, yPosition)
        .text(`Average Score: ${studentData.average_score}`, col3, yPosition);

      doc.moveDown(3);
      doc.fontSize(10).font('Helvetica').text('This is an automatically generated report. For inquiries, contact the school administration.', { align: 'center', italics: true });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

const generateClassReport = (classData, students, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text(`${classData.name} CLASS REPORT`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('_'.repeat(80), { align: 'center' });
      doc.moveDown();

      doc.fontSize(11).font('Helvetica-Bold').text('CLASS PERFORMANCE', { underline: true });
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 200;
      const col3 = 300;
      const col4 = 400;
      const rowHeight = 25;

      doc.fontSize(9).font('Helvetica-Bold')
        .text('Position', col1, tableTop)
        .text('Student Name', col2, tableTop)
        .text('Total Marks', col3, tableTop)
        .text('Average', col4, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let yPosition = tableTop + rowHeight;
      doc.fontSize(9).font('Helvetica');

      students.forEach((student) => {
        doc.text(student.position.toString(), col1, yPosition)
          .text(student.name, col2, yPosition)
          .text(student.total_marks ? student.total_marks.toString() : 'N/A', col3, yPosition)
          .text(student.average_score ? student.average_score.toString() : 'N/A', col4, yPosition);
        yPosition += rowHeight;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica').text('This is an automatically generated report. For inquiries, contact the school administration.', { align: 'center', italics: true });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReportCard,
  generateClassReport
};
