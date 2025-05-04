import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'PATCH') {
    try {
      const { db } = await connectToDatabase();
      
      // Reset all table positions to default
      const result = await db.collection('tables').updateMany(
        {},
        { $set: { x: 100, y: 100 } }
      );

      // Fetch updated tables
      const tables = await db.collection('tables').find({}).toArray();

      res.status(200).json(tables.map(table => ({
        ...table,
        _id: table._id.toString(),
        x: table.x || 100,
        y: table.y || 100
      })));

    } catch (error) {
      console.error('Reset positions error:', error);
      res.status(500).json({ message: 'Failed to reset table positions' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}