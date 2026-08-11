import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projectInvitations, projectMembers } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Debes iniciar sesión para aceptar la invitación' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { token, action } = body; // action: 'accept' | 'reject'

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token de invitación requerido' }), { status: 400 });
    }

    const invitation = await db.query.projectInvitations.findFirst({
      where: eq(projectInvitations.token, token),
    });

    if (!invitation || invitation.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'La invitación no es válida o ya ha sido procesada.' }), { status: 400 });
    }

    if (action === 'accept') {
      // Add user as project member
      await db.insert(projectMembers).values({
        projectId: invitation.projectId,
        userId: locals.user.id,
        role: invitation.role,
      }).onConflictDoNothing();

      await db.update(projectInvitations)
        .set({ status: 'accepted' })
        .where(eq(projectInvitations.id, invitation.id));

      return new Response(JSON.stringify({ success: true, message: 'Invitación aceptada con éxito.' }), { status: 200 });
    } else {
      await db.update(projectInvitations)
        .set({ status: 'rejected' })
        .where(eq(projectInvitations.id, invitation.id));

      return new Response(JSON.stringify({ success: true, message: 'Invitación rechazada.' }), { status: 200 });
    }
  } catch (error) {
    console.error('Error processing invitation:', error);
    return new Response(JSON.stringify({ error: 'Error al procesar la invitación' }), { status: 500 });
  }
};
