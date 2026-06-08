const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser'); // <-- 1. Naya package import kiya

const app = express();

// ==========================================
// STRICT CORE OVERRIDE FOR LARGE PAYLOADS (FIXED)
// ==========================================
app.use(cors());

// Express ke purane tarike hata kar strict body-parser lagaya
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));

// Iske Niche Aapka Baaki Saara Code (db.json, nodemailer, app.post) Bilkul Same Rahega...

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
    host: "smtp.gmail.com", 
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

// POST API: Complaint Registration (UPDATED ROUTE PATH TO MATCH FRONTEND)
app.post('/submit', async (req, res) => {
    try {
        // Frontend payload ke hisab se exact fields nikaal rahe hain
        const { warrantyId, client, contactName, contactPhone, issue, photoUrl, gps, matchStatus, source } = req.body;
        
        const uniqueTicketId = Math.floor(100000 + Math.random() * 900000);

        const newComplaintRecord = {
            id: uniqueTicketId,
            warrantyId: warrantyId || "UNKNOWN",
            clientName: client || "Anonymous Client",
            contactName: contactName || "No Name",
            contactPhone: contactPhone || "No Phone",
            issueReported: issue || "Diagnostic Evaluation",
            photoUrl: photoUrl || "",
            gps: gps || "No GPS Telemetry",
            matchStatus: matchStatus || "Manual Network Registration",
            source: source || "Portal Direct Form",
            status: "Open Fault",
            createdAt: new Date().toISOString()
        };

        // Permanent Database Commit Logic
        db.get('complaints').unshift(newComplaintRecord).write();

        // Admin Notification Constants
        const enterpriseAdminMail = "mis@hi-sign.com";
        const enterpriseAdminPhone = "8698755608"; // Sudhanshu Shekhar Fixed Contact Parameters

        // --- ENTERPRISE ALERTS TRANSLATION ---
        const customerEmailSubject = `Complaint Service Ticket Logged - Ticket ID #${uniqueTicketId}`;
        const customerEmailBody = `Dear ${newComplaintRecord.contactName},\n\nThank you for reaching out to Linea LED Support. Your equipment service complaint has been successfully registered in our automation pipeline.\n\n**Service Parameters:**\n- Reference Ticket ID: #${uniqueTicketId}\n- Signage Location/Client: ${newComplaintRecord.clientName}\n- Warranty Serial Reference: ${newComplaintRecord.warrantyId}\n- System Fault Diagnostics: ${newComplaintRecord.issueReported}\n\nOur service operations team has queued your ticket. An field executive will contact you shortly.\n\nBest Regards,\nOperations Desk\nLinea LED Signage Networks`;
        
        const customerWhatsAppMessage = `Dear ${newComplaintRecord.contactName}, your Linea LED service request has been logged. Ticket Reference: #${uniqueTicketId}. Our maintenance team is analyzing the payload parameters. Thank you.`;

        const adminEmailSubject = `[URGENT INCIDENT LOG] Priority Ticket Dispatched - #${uniqueTicketId}`;
        const adminEmailBody = `Attention Administration Desk,\n\nA new operational defect incident has been registered by an end-user interface node.\n\n**Incident Blueprint:**\n- Ticket Reference: #${uniqueTicketId}\n- Site/Branch: ${newComplaintRecord.clientName}\n- Node Contact Name: ${newComplaintRecord.contactName}\n- Mobile Line: ${newComplaintRecord.contactPhone}\n- Defect Vectors: ${newComplaintRecord.issueReported}\n\nPlease access the Central Management Admin Console to route this incident payload to a field engineer immediately.\n\nSystem Core Automation,\nLinea LED Network Node`;

        const adminWhatsAppMessage = `Enterprise Dispatch Alert: New high priority signage ticket (#${uniqueTicketId}) generated for ${newComplaintRecord.clientName}. Diagnostic Issue: ${newComplaintRecord.issueReported}. Check your active system terminal immediately.`;

        // Execute Transporter Processes Securely
        try {
            await transporter.sendMail({ from: '"Linea LED Automated Portal" <mis@hi-sign.com>', to: enterpriseAdminMail, subject: adminEmailSubject, text: adminEmailBody });
            await transporter.sendMail({ from: '"Linea LED Networks" <mis@hi-sign.com>', to: enterpriseAdminMail, subject: customerEmailSubject, text: customerEmailBody });
        } catch (mailError) {
            console.log("Email Dispatch Process Delayed. Check active SMTP authentication credentials:", mailError.message);
        }

        // WhatsApp Integrations Trigger Routing
        await triggerWhatsAppGateway(newComplaintRecord.contactPhone, customerWhatsAppMessage);
        await triggerWhatsAppGateway(enterpriseAdminPhone, adminWhatsAppMessage);

        return res.status(201).json({ success: true, message: "Incident logged successfully on Cloud Storage Node.", data: newComplaintRecord });

    } catch (error) {
        console.error("Critical Server Crash Error Context:", error);
        return res.status(500).json({ success: false, message: "Critical Server Crash Error Context", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Linea System Live Backend Core Running Smoothly on Port ${PORT}`));