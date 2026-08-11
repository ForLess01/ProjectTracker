import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { items, users } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const viewType = (url.searchParams.get('view') || 'ideas') as 'ideas' | 'bugs' | 'optimizaciones' | 'implementaciones';

  try {
    const itemList = await db.query.items.findMany({
      where: eq(items.viewType, viewType),
      orderBy: [desc(items.createdAt)],
      with: {
        creator: true,
        assignee: true,
        attachments: true,
      },
    });

    const userList = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return new Response(JSON.stringify({ items: itemList, users: userList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener elementos' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { viewType, title } = body;

    if (!viewType || !title) {
      return new Response(JSON.stringify({ error: 'El título y el tipo de vista son requeridos.' }), { status: 400 });
    }

    const [newItem] = await db.insert(items).values({
      viewType,
      title,
      context: body.context || '',
      location: body.location || '',
      severity: body.severity || 'Media',
      impact: body.impact || 'Medio',
      effort: body.effort || 'Medio',
      priority: body.priority || 'P2',
      sprint: body.sprint || 'Sprint 1',
      status: 'backlog',
      notes: body.notes || '',
      creatorId: locals.user.id,
      assigneeId: body.assigneeId || locals.user.id,
    }).returning();

    return new Response(JSON.stringify({ item: newItem }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return new Response(JSON.stringify({ error: 'Error al crear elemento' }), { status: 500 });
  }
};
