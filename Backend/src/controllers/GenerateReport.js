import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import express from 'express'
import { connectDatabase } from '../config/database.js'
const router = express.Router()

router.get('/generateReport', async (req, res) => {
    try {
        const { Module, From, To, Id } = req.query
        const db = await connectDatabase()
        console.log("Got to report Generation")
        let query = `SELECT s.Student_id, s.Student_name,aa.Section_id, m.Module_Name, m.Module_id, c.Class_id, c.Class_Type, 
                            DATE_FORMAT(c.Class_Date, '%b %d, %Y') AS Class_Date, 
                            a.Attendance_Time, 
                            a.Attendance_Status 
                     FROM attendance a 
                     JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id
                     JOIN module m ON aa.Module_id = m.Module_id 
                     JOIN class c ON aa.Class_Id = c.Class_Id  
                     JOIN Student s on aa.student_id=s.Student_id
                     WHERE aa.Student_ID = ?`

        if (Module !== "All") query += ` AND m.Module_id = ?`
        query += ` AND c.Class_Date BETWEEN ? AND ?`
        query += ` ORDER BY m.Module_Name, c.Class_Date`

        let queryResult;
        if (Module === "All") {
            queryResult = await db.query(query, [Id, From, To])
        } else {
            queryResult = await db.query(query, [Id, Module, From, To])
        }
        const allRecords = queryResult[0]
        
        if (allRecords.length === 0) {
            return res.status(404).json({ success: false, message: "No data found for the given criteria." })
        }
        console.log(allRecords)

        const doc = new PDFDocument({ margin: 40, size: 'A4' })
        let pdfBuffer = []

        // Stream the PDF to a buffer
        doc.on('data', chunk => {
            pdfBuffer.push(chunk);
        });

        doc.on('end', () => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=Attendance_Report.pdf');
            res.send(Buffer.concat(pdfBuffer));
        });

        // Group records by module
        const moduleGroups = {};
        allRecords.forEach(record => {
            const moduleId = record.Module_id;
            if (!moduleGroups[moduleId]) {
                moduleGroups[moduleId] = {
                    name: record.Module_Name,
                    records: []
                };
            }
            moduleGroups[moduleId].records.push(record);
        });

        // Table settings
        const startX = 30;
        const colWidths = [100, 100, 100, 80, 80, 80];
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const rowHeight = 30;
        
        // Generate a separate table for each module
        let firstModule = true;
        
        for (const moduleId in moduleGroups) {
            const moduleData = moduleGroups[moduleId];
            const moduleName = moduleData.name;
            const records = moduleData.records;
            let Student_id=records[0].Student_id
            let Student_name=records[0].Student_name
            
            // If not the first module, add a page break
            if (!firstModule) {
                doc.addPage();
            }
            firstModule = false;
            
            // Calculate total pages for this module
            const recordsPerPage = 20;
            const totalPages = Math.ceil(records.length / recordsPerPage);

            
            doc.fontSize(14).text(`Student Name- ${Student_id} `, { align: "center" });
            doc.moveDown();
            doc.fontSize(14).text(`Student Id - ${Student_name}`, { align: "center" });
            doc.moveDown();
            
            // Module header
            doc.fontSize(14).text(`Module Name - ${moduleName} [Page 1/${totalPages}]`, { align: "center" });
            doc.moveDown();
            
            let startY = doc.y;
            let currentY = startY;
            let currentPage = 1;
            
            // Draw header
            
            drawTableHeader(doc, startX, currentY, colWidths, rowHeight);
            currentY += rowHeight;
            
            // Draw records for this module
            records.forEach((record, index) => {
                // Check if we need a new page
                if (currentY + rowHeight > doc.page.height - 50) {
                    doc.addPage()
                    currentPage++

                    // Draw header on new page
                    doc.fontSize(14).text(`Module Name - ${moduleName} [Page ${currentPage}/${totalPages}]`, { align: "center" });
                    doc.moveDown();
                    
                    currentY = doc.y;
                    drawTableHeader(doc, startX, currentY, colWidths, rowHeight);
                    currentY += rowHeight;
                }
                
                drawTableRow(doc, startX, currentY, colWidths, rowHeight, [
                    record.Class_Date,
                    record.Class_Type,
                    record.Attendance_Time || "-",
                    record.Attendance_Status === 'Present' ? 'X' : '',
                    record.Attendance_Status === 'Late' ? 'X' : '',
                    record.Attendance_Status === 'Absent' ? 'X' : ''
                ]);
                
                currentY += rowHeight;
            });
        }

        doc.end();

    } catch (err) {
        console.error("Attendance Report error:", err);
        res.status(500).json({ success: false, message: "Failed to generate attendance report" });
    }
});

// Function to draw the table header
function drawTableHeader(doc, x, y, colWidths, rowHeight) {
    const headers = ["Date", "Class Type", "Punch-In", "Present", "Late", "Absent"];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    
    // Draw header row background and border
    doc.rect(x, y, tableWidth, rowHeight).stroke();
    
    // Draw column headers
    let currentX = x;
    doc.font('Helvetica');
    
    headers.forEach((header, i) => {
        // Draw the text
        doc.text(
            header,
            currentX + 5,
            y + 10,
            { width: colWidths[i] - 10, align: 'center' }
        );
        
        // Draw vertical line (if not the last column)
        if (i < headers.length - 1) {
            doc.moveTo(currentX + colWidths[i], y)
               .lineTo(currentX + colWidths[i], y + rowHeight)
               .stroke();
        }
        
        currentX += colWidths[i];
    });
    
    doc.font('Helvetica');
}

// Function to draw a table row
function drawTableRow(doc, x, y, colWidths, rowHeight, rowData) {
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    
    // Draw row border
    doc.rect(x, y, tableWidth, rowHeight).stroke();
    
    let currentX = x;
    
    rowData.forEach((cellData, i) => {
        // Draw the cell content
        doc.text(
            cellData,
            currentX + 4,
            y + 10,
            { width: colWidths[i] - 10, align: 'center' }
        );
        
        // Draw vertical line (if not the last column)
        if (i < rowData.length - 1) {
            doc.moveTo(currentX + colWidths[i], y)
               .lineTo(currentX + colWidths[i], y + rowHeight)
               .stroke();
        }
        
        currentX += colWidths[i];
    });
}

export default router;