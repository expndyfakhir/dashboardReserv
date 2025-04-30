'use client';

export default function ReservationListTable({ reservations = [], onStatusChange, onDelete }) {
  const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700';
      case 'completed':
        return 'bg-slate-50 text-slate-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="mb-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-[#316160]">All Reservations</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#316160]/5">
            <tr>
              {['Customer', 'Contact', 'Date & Time', 'Party Size', 'Table', 'Type', 'Status', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-sm font-semibold text-[#316160]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{reservation.customerName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{reservation.customerEmail}</div>
                  <div>{reservation.customerPhone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{new Date(reservation.date).toLocaleDateString()}</div>
                  <div>{reservation.time}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{reservation.partySize}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {reservation.table?.tableNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className={`badge ${reservation.reservationType}`}>
                    {reservation.reservationType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={reservation.status}
                    onChange={(e) => onStatusChange(reservation.id, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(reservation.status)} border border-current cursor-pointer transition-colors hover:bg-opacity-80`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onDelete(reservation.id)}
                    className="text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}