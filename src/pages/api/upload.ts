import type { APIRoute } from 'astro';
import { getStorageProvider } from '../../lib/storage';
import { db } from '../../db';
import { attachments } from '../../db/schema';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString();
    const file = formData.get('file') as File | null;

    if (!itemId || !file) {
      return new Response(JSON.stringify({ error: 'Archivo e itemId son obligatorios.' }), { status: 400 });
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'El archivo excede el tamaño máximo permitido de 5MB.' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getStorageProvider();
    const uploadResult = await storage.uploadFile(buffer, file.name || 'image.png', file.type || 'image/png');

    const [attachment] = await db.insert(attachments).values({
      itemId,
      url: uploadResult.url,
      filename: uploadResult.filename,
      mimeType: uploadResult.mimeType,
    }).returning();

    return new Response(JSON.stringify({ attachment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return new Response(JSON.stringify({ error: 'Error al subir la imagen' }), { status: 500 });
  }
};
