import { type Client, type InsertClient, type Service, type InsertService, type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  getClientByRtn(rtn: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  getAllClients(): Promise<Client[]>;

  // Service operations
  getService(id: string): Promise<Service | undefined>;
  getServiceByCode(code: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Invoice operations
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<{ invoice: Invoice; items: InvoiceItem[] }>;
  getInvoice(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  getNextInvoiceNumber(): Promise<string>;
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client>;
  private services: Map<string, Service>;
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem[]>;
  private invoiceCounter: number;

  constructor() {
    this.clients = new Map();
    this.services = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.invoiceCounter = 1;
    
    // Initialize with default car wash services
    this.initializeDefaultServices();
  }

  private initializeDefaultServices() {
    const defaultServices: InsertService[] = [
      {
        code: "LAV001",
        description: "Lavado Completo Premium",
        price: "250.00",
        category: "Lavado",
        taxable: true,
        stock: -1
      },
      {
        code: "LAV002",
        description: "Lavado Básico",
        price: "150.00",
        category: "Lavado",
        taxable: true,
        stock: -1
      },
      {
        code: "ENC001",
        description: "Encerado y Brillado",
        price: "150.00",
        category: "Detailing",
        taxable: true,
        stock: -1
      },
      {
        code: "INT001",
        description: "Limpieza Interior",
        price: "100.00",
        category: "Interior",
        taxable: true,
        stock: -1
      }
    ];

    defaultServices.forEach(service => {
      const id = randomUUID();
      const serviceWithId: Service = {
        ...service,
        id,
        createdAt: new Date(),
        stock: service.stock ?? -1
      };
      this.services.set(id, serviceWithId);
    });
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByRtn(rtn: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.rtn === rtn);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date()
    };
    this.clients.set(id, client);
    return client;
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServiceByCode(code: string): Promise<Service | undefined> {
    return Array.from(this.services.values()).find(service => service.code === code);
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      ...insertService, 
      id,
      createdAt: new Date(),
      stock: insertService.stock ?? -1
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;

    const updatedService: Service = { ...service, ...updateData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoiceId = randomUUID();
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      clientId: randomUUID(), // In real implementation, this would be properly linked
      clientRtn: insertInvoice.clientRtn,
      clientName: insertInvoice.clientName,
      subtotalExempt: insertInvoice.subtotalExempt ?? "0.00",
      subtotalTaxable: insertInvoice.subtotalTaxable ?? "0.00",
      isv: insertInvoice.isv ?? "0.00",
      total: insertInvoice.total,
      createdAt: new Date()
    };

    const invoiceItems: InvoiceItem[] = items.map(item => ({
      id: randomUUID(),
      invoiceId,
      serviceId: item.serviceId,
      description: item.description,
      price: item.price,
      quantity: item.quantity ?? 1,
      subtotal: item.subtotal,
      taxable: item.taxable ?? true
    }));

    this.invoices.set(invoiceId, invoice);
    this.invoiceItems.set(invoiceId, invoiceItems);

    return { invoice, items: invoiceItems };
  }

  async getInvoice(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const items = this.invoiceItems.get(id) || [];
    return { invoice, items };
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getNextInvoiceNumber(): Promise<string> {
    const paddedNumber = this.invoiceCounter.toString().padStart(9, '0');
    this.invoiceCounter++;
    return `001-001-01-${paddedNumber}`;
  }
}

export const storage = new MemStorage();
