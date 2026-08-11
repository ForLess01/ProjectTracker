import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { items } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Update allowed fields
    const updatedData: Record<string, any> = {
      updatedAt: new Date(),
    };

    const allowedKeys = [
      'title', 'context', 'location', 'severity',
      'impact', 'effort', 'priority', 'sprint',
      'status', 'notes', 'assigneeId'
    ];

    for (const key of allowedKeys) {
      if (key in body) {
        updatedData[key] = body[key];
      }
    }

    const [updatedItem] = await db.update(items)
      .set(updatedData)
      .where(eq(items.id, id))
      .returning();

    return new Response(JSON.stringify({ item: updatedItem }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    await db.delete(items).where(eq(items.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting item:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar' }), { status: 500 });
  }
};
