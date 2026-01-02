export const MOCK_FILES = [
    {
        id: 'mock-1',
        file_name: 'Service Agreement v3.0.pdf',
        file_size: 2500000,
        status: 'parsed',
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-2',
        file_name: 'Technical Specification v2.0.pdf',
        file_size: 4800000,
        status: 'parsed',
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-3',
        file_name: 'Safety Analysis Report.pdf',
        file_size: 1024000,
        status: 'uploaded', // Needs parsing
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-4',
        file_name: 'Compliance Checklist.pdf',
        file_size: 512000,
        status: 'parsing', // processing
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-5',
        file_name: 'Vendor Guidelines 2024.pdf',
        file_size: 3200000,
        status: 'failed',
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-6',
        file_name: 'Architecture Diagram v5.pdf',
        file_size: 1560000,
        status: 'parsed',
        updated_at: new Date().toISOString()
    }
];
