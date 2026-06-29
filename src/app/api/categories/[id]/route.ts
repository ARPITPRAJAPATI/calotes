import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection helper
import Category from '@/models/Category'; // Import Category schema model
import { auth } from '@/auth'; // Import NextAuth session helper

// DELETE handler: deletes a Category from database collections (Admin protected)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Asynchronous route parameters
) {
  try {
    // 1. Confirm session credentials role authorization
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard endpoint
    }

    // 2. Establish connection to MongoDB database
    await connectDB();
    // 3. Resolve parameters promise to retrieve category ID
    const { id } = await params;
    
    // 4. Execute findByIdAndDelete query in DB Category collections
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

