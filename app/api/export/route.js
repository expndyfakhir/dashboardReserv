import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Helper function to convert data to CSV format
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  // Get headers from the first item
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different data types and escape commas
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        if (value instanceof Date) return value.toISOString();
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return String(value).replace(/"/g, '""');
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Helper function to prepare reservation data
function prepareReservationData(reservations) {
  return reservations.map(reservation => {
    // Extract table info and flatten the structure
    const tableInfo = reservation.table ? {
      tableNumber: reservation.table.tableNumber,
      tableCapacity: reservation.table.capacity,
      tableType: reservation.table.tableType
    } : { tableNumber: null, tableCapacity: null, tableType: null };
    
    // Remove the table object and add flattened table info
    const { table, ...reservationData } = reservation;
    
    // Format date
    return {
      ...reservationData,
      date: reservation.date.toISOString().split('T')[0],
      ...tableInfo
    };
  });
}

// Helper function to prepare table data
function prepareTableData(tables) {
  return tables.map(table => {
    return {
      ...table,
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString()
    };
  });
}

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'reservations';
    const format = searchParams.get('format') || 'csv';

    let data = [];
    let filename = '';
    let contentType = '';

    // Fetch data based on type
    if (type === 'reservations' || type === 'all') {
      const reservations = await prisma.reservation.findMany({
        include: {
          table: {
            select: {
              tableNumber: true,
              capacity: true,
              tableType: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      if (type === 'reservations') {
        data = prepareReservationData(reservations);
        filename = `reservations-${new Date().toISOString().split('T')[0]}`;
      } else {
        // For 'all' type, we'll store reservations data temporarily
        data = { reservations: prepareReservationData(reservations) };
      }
    }

    if (type === 'tables' || type === 'all') {
      const tables = await prisma.table.findMany({
        orderBy: {
          tableNumber: 'asc'
        }
      });
      
      if (type === 'tables') {
        data = prepareTableData(tables);
        filename = `tables-${new Date().toISOString().split('T')[0]}`;
      } else if (type === 'all') {
        // For 'all' type, add tables data to the object
        data.tables = prepareTableData(tables);
        filename = `restaurant-data-${new Date().toISOString().split('T')[0]}`;
      }
    }

    // Format data based on requested format
    let responseData;
    if (format === 'csv') {
      contentType = 'text/csv';
      filename = `${filename}.csv`;
      
      if (type === 'all') {
        // For 'all' type with CSV, we'll create separate sections
        const reservationsCSV = data.reservations.length > 0 ? 
          'RESERVATIONS\n' + convertToCSV(data.reservations) : '';
        const tablesCSV = data.tables.length > 0 ? 
          '\n\nTABLES\n' + convertToCSV(data.tables) : '';
        responseData = reservationsCSV + tablesCSV;
      } else {
        responseData = convertToCSV(data);
      }
    } else {
      // JSON format
      contentType = 'application/json';
      filename = `${filename}.json`;
      responseData = JSON.stringify(data, null, 2);
    }

    // Set response headers for file download
    const headers = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    };

    return new NextResponse(responseData, { headers });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { message: 'Error exporting data', error: error.message },
      { status: 500 }
    );
  }
}