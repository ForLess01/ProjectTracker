import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { attachments } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const [att] = await db.select().from(attachments).where(eq(attachments.id, id));
    if (!att) {
      return new Response(JSON.stringify({ error: 'Adjunto no encontrado' }), { status: 404 });
    }

    // Delete record from database
    await db.delete(attachments).where(eq(attachments.id, id));

    // If local file, attempt cleanup
    if (att.url && att.url.startsWith('/uploads/')) {
      const filename = path.basename(att.url);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      fs.unlink(filePath).catch(() => {});
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar adjunto' }), { status: 500 });
  }
};
