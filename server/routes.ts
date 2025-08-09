import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertServiceSchema, insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import { z } from "zod";

const createInvoiceSchema = z.object({
  clientRtn: z.string(),
  clientName: z.string(),
  items: z.array(z.object({
    serviceId: z.string(),
    description: z.string(),
    price: z.union([z.string(), z.number()]),
    quantity: z.number().default(1),
    subtotal: z.union([z.string(), z.number()]),
    taxable: z.boolean().default(true)
  }))
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.get("/api/clients/rtn/:rtn", async (req, res) => {
    try {
      const { rtn } = req.params;
      const client = await storage.getClientByRtn(rtn);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      
      // Check if client with this RTN already exists
      const existingClient = await storage.getClientByRtn(clientData.rtn);
      if (existingClient) {
        return res.status(400).json({ message: "Client with this RTN already exists" });
      }
      
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating client" });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      
      // Check if service with this code already exists
      const existingService = await storage.getServiceByCode(serviceData.code);
      if (existingService) {
        return res.status(400).json({ message: "Service with this code already exists" });
      }
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertServiceSchema.partial().parse(req.body);
      
      const service = await storage.updateService(id, updateData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting service" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });

  app.get("/api/invoices/next-number", async (req, res) => {
    try {
      const nextNumber = await storage.getNextInvoiceNumber();
      res.json({ invoiceNumber: nextNumber });
    } catch (error) {
      res.status(500).json({ message: "Error generating invoice number" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      console.log("Received invoice data:", JSON.stringify(req.body, null, 2));
      const invoiceData = createInvoiceSchema.parse(req.body);
      
      // Ensure client exists or create new one
      let existingClient = await storage.getClientByRtn(invoiceData.clientRtn);
      if (!existingClient) {
        existingClient = await storage.createClient({
          rtn: invoiceData.clientRtn,
          name: invoiceData.clientName
        });
      }

      // Calculate totals
      let subtotalExempt = 0;
      let subtotalTaxableBeforeISV = 0;
      let totalISV = 0;
      
      // Get service details and calculate subtotals
      const processedItems = [];
      for (const item of invoiceData.items) {
        const service = await storage.getService(item.serviceId);
        if (!service) {
          return res.status(400).json({ message: `Service with ID ${item.serviceId} not found` });
        }
        
        const subtotal = parseFloat(service.price) * (item.quantity ?? 1);
        
        if (service.taxable) {
          // El precio ya incluye ISV, calculamos el precio sin ISV
          const priceWithoutISV = subtotal / 1.15;
          const isvAmount = subtotal - priceWithoutISV;
          
          subtotalTaxableBeforeISV += priceWithoutISV;
          totalISV += isvAmount;
        } else {
          subtotalExempt += subtotal;
        }

        processedItems.push({
          ...item,
          description: service.description,
          price: service.price,
          subtotal: subtotal.toFixed(2),
          taxable: service.taxable
        });
      }

      const total = subtotalExempt + subtotalTaxableBeforeISV + totalISV;

      const invoice = await storage.createInvoice({
        clientRtn: existingClient.rtn,
        clientName: existingClient.name,
        subtotalExempt: subtotalExempt.toFixed(2),
        subtotalTaxable: subtotalTaxableBeforeISV.toFixed(2),
        isv: totalISV.toFixed(2),
        total: total.toFixed(2)
      }, processedItems);

      res.status(201).json(invoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating invoice" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoice" });
    }
  });

  // RTN validation endpoint
  app.post("/api/validate-rtn", async (req, res) => {
    try {
      const { rtn } = req.body;
      
      // Basic Honduras RTN format validation
      if (!/^\d{14}$/.test(rtn)) {
        return res.status(400).json({ 
          valid: false, 
          message: "RTN debe tener exactamente 14 dígitos" 
        });
      }

      res.json({ valid: true, message: "RTN válido" });
    } catch (error) {
      res.status(500).json({ message: "Error validating RTN" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
