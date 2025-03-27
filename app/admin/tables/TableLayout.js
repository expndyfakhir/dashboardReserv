'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

const TableLayout = () => {
  const [tables, setTables] = useState([
    { id: 1, number: 1, type: 'round', seats: 4, x: 100, y: 100, status: 'available' },
    { id: 2, number: 2, type: 'square', seats: 2, x: 300, y: 100, status: 'reserved' },
    { id: 3, number: 3, type: 'rectangular', seats: 6, x: 500, y: 100, status: 'occupied' },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);

  const handleDragStart = (tableId) => {
    setIsDragging(true);
    setCurrentTable(tableId);
  };

  const handleDrag = (x, y, tableId) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        const newPosition = { x, y };
        return {
          ...table,
          x: newPosition.x,
          y: newPosition.y
        };
      }
      return table;
    });
    setTables(updatedTables);
  };

  const checkCollision = (currentId, x, y) => {
    const currentTable = tables.find(t => t.id === currentId);
    const collision = tables.find(t => 
      t.id !== currentId &&
      x < t.x + 100 &&
      x + 100 > t.x &&
      y < t.y + 100 &&
      y + 100 > t.y
    );
    return collision ? { x: currentTable.x, y: currentTable.y } : { x, y };
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentTable(null);
    // Here you would typically save the new table positions to your backend
  };

  const getTableStyle = (type) => {
    switch (type) {
      case 'round':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'rectangular':
        return 'rounded-lg w-32';
      default:
        return 'rounded-lg';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 border-emerald-500 text-emerald-700';
      case 'reserved':
        return 'bg-amber-100 border-amber-500 text-amber-700';
      case 'occupied':
        return 'bg-rose-100 border-rose-500 text-rose-700';
      default:
        return 'bg-slate-100 border-slate-500 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Table Layout</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={() => {
            // Add new table functionality
          }}
        >
          <PlusIcon className="h-5 w-5" />
          Add Table
        </button>
      </div>

      <div className="relative w-full h-[600px] bg-white rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-4 p-4 pointer-events-none">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-slate-100 rounded-md"></div>
          ))}
        </div>

        {/* Tables */}
        {tables.map((table) => (
          <motion.div
            key={table.id}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
              left: 0,
              right: 800,
              top: 0,
              bottom: 600
            }}
            dragTransition={{ power: 0.2, timeConstant: 200 }}
            onDrag={(_, info) => handleDrag(info.point.x, info.point.y, table.id)}
            onDragStart={() => handleDragStart(table.id)}
            onDragEnd={handleDragEnd}
            initial={{ x: table.x, y: table.y }}
            animate={{ x: table.x, y: table.y }}
            className={`absolute cursor-move select-none
              ${getTableStyle(table.type)}
              ${getStatusStyle(table.status)}
              h-24 w-24 flex items-center justify-center
              border-2 shadow-lg transition-shadow
              ${isDragging && currentTable === table.id ? 'shadow-xl ring-2 ring-indigo-500 ring-offset-2' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-lg font-bold">Table {table.number}</div>
              <div className="text-sm">{table.seats} seats</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500"></div>
          <span className="text-sm text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-500"></div>
          <span className="text-sm text-slate-600">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-rose-100 border-2 border-rose-500"></div>
          <span className="text-sm text-slate-600">Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;