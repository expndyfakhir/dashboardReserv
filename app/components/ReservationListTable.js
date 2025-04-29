'use client';

export default function ReservationListTable({ reservations = [], onStatusChange }) {
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
              {['Customer', 'Contact', 'Date & Time', 'Party Size', 'Table', 'Type', 'Status'].map((header) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}