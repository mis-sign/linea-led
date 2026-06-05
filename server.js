const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
app.use(express.json());
app.use(cors()); // Global Cross-origin access handle karne ke liye taaki GitHub se request block na ho

// ==========================================
// 1. LIGHTWEIGHT DATABASE ENGINE (db.json)
// ==========================================
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ complaints: [] }).write();

// ==========================================
// 2. CENTRAL EMAIL ACCOUNT PIPELINE
// ==========================================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Aap apna enterprise dynamic mail provider configure kar sakte hain
    port: 465,
    secure: true, 
    auth: {
        user: "mis@hi-sign.com", // Sudhanshu Bhai aapki admin console listed mail id
        pass: "YOUR_GMAIL_APP_PASSWORD" // Yahan apna Gmail application token id key daalna
    }
});

// Mock Function for Global WhatsApp API Infrastructure
async function triggerWhatsAppGateway(number, msg) {
    console.log(`[Cloud Routing System Logs -> WhatsApp Outgoing Alert Sent to ${number}]: ${msg}`);
    return true;
}

// ==========================================
// 3. SECURE BACKEND STORAGE ROUTING LOGIC
// ==========================================

// GET API: Live Dashboard Tracker
app.get('/api/get-complaints', (req, res) => {
    const records = db.get('complaints').value();
    return res.status(200).json({ success: true, data: records });
});

// POST API: Complaint Registration & Immediate Dispatch Flow
app.post('/api/register-complaint', async (req, res) => {
    try {
        const { warrantyId, clientName, contactName, contactPhone, issueReported } = req.body;
        const uniqueTicketId = Math.floor(100000 + Math.random() * 900000);

        const newComplaintRecord = {
            id: uniqueTicketId,
            warrantyId,
            clientName,
            contactName,
            contactPhone,
            issueReported,
            status: "Open Fault",
            createdAt: new Date().toISOString()
        };

        // Permanent Database Commit Logic
        db.get('complaints').unshift(newComplaintRecord).write();

        // Admin Notification Constants
        const enterpriseAdminMail = "mis@hi-sign.com";
        const enterpriseAdminPhone = "8698755608"; // Sudhanshu Shekhar Fixed Contact Parameters

        // --- ENTERPRISE ALERTS TRANSLATION (PROFESSIONAL ENGLISH ONLY) ---
        
        // Customer View Outgoing Elements
        const customerEmailSubject = `Complaint Service Ticket Logged - Ticket ID #${uniqueTicketId}`;
        const customerEmailBody = `Dear ${contactName},\n\nThank you for reaching out to Linea LED Support. Your equipment service complaint has been successfully registered in our automation pipeline.\n\n**Service Parameters:**\n- Reference Ticket ID: #${uniqueTicketId}\n- Signage Location/Client: ${clientName}\n- Warranty Serial Reference: ${warrantyId}\n- System Fault Diagnostics: ${issueReported}\n\nOur service operations team has queued your ticket. An field executive will contact you shortly.\n\nBest Regards,\nOperations Desk\nLinea LED Signage Networks`;
        
        const customerWhatsAppMessage = `Dear ${contactName}, your Linea LED service request has been logged. Ticket Reference: #${uniqueTicketId}. Our maintenance team is analyzing the payload parameters. Thank you.`;

        // Administration View Outgoing Elements
        const adminEmailSubject = `[URGENT INCIDENT LOG] Priority Ticket Dispatched - #${uniqueTicketId}`;
        const adminEmailBody = `Attention Administration Desk,\n\nA new operational defect incident has been registered by an end-user interface node.\n\n**Incident Blueprint:**\n- Ticket Reference: #${uniqueTicketId}\n- Site/Branch: ${clientName}\n- Node Contact Name: ${contactName}\n- Mobile Line: ${contactPhone}\n- Defect Vectors: ${issueReported}\n\nPlease access the Central Management Admin Console to route this incident payload to a field engineer immediately.\n\nSystem Core Automation,\nLinea LED Network Node`;

        const adminWhatsAppMessage = `Enterprise Dispatch Alert: New high priority signage ticket (#${uniqueTicketId}) generated for ${clientName}. Diagnostic Issue: ${issueReported}. Check your active system terminal immediately.`;

        // Execute Transporter Processes Securely
        try {
            await transporter.sendMail({ from: '"Linea LED Automated Portal" <mis@hi-sign.com>', to: enterpriseAdminMail, subject: adminEmailSubject, text: adminEmailBody });
            await transporter.sendMail({ from: '"Linea LED Networks" <mis@hi-sign.com>', to: enterpriseAdminMail, subject: customerEmailSubject, text: customerEmailBody });
        } catch (mailError) {
            console.log("Email Dispatch Process Delayed. Check active SMTP authentication credentials:", mailError.message);
        }

        // WhatsApp Integrations Trigger Routing
        await triggerWhatsAppGateway(contactPhone, customerWhatsAppMessage);
        await triggerWhatsAppGateway(enterpriseAdminPhone, adminWhatsAppMessage);

        return res.status(201).json({ success: true, message: "Incident logged successfully on Cloud Storage Node.", data: newComplaintRecord });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Critical Server Crash Error Context", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Linea System Live Backend Core Running Smoothly on Port ${PORT}`));