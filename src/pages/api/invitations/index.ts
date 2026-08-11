import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projectInvitations, projects, projectMembers, users } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    // Get pending invitations for the current user's email
    const pendingInvites = await db.query.projectInvitations.findMany({
      where: and(
        eq(projectInvitations.email, locals.user.email),
        eq(projectInvitations.status, 'pending')
      ),
      with: {
        project: true,
      },
    });

    return new Response(JSON.stringify({ invitations: pendingInvites }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener invitaciones' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, email, role = 'member' } = body;

    if (!projectId || !email) {
      return new Response(JSON.stringify({ error: 'El proyecto y el correo son requeridos.' }), { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(24).toString('hex');

    const [invitation] = await db.insert(projectInvitations).values({
      projectId,
      email: cleanEmail,
      token,
      role: role as 'owner' | 'admin' | 'member' | 'viewer',
      status: 'pending',
    }).returning();

    return new Response(JSON.stringify({
      success: true,
      invitation,
      inviteLink: `/invitations/accept?token=${token}`,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return new Response(JSON.stringify({ error: 'Error al crear la invitación' }), { status: 500 });
  }
};
