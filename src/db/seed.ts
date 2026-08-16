import { db } from './index.ts';
import { users, items, attachments } from './schema.ts';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin & Demo Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const [adminUser] = await db.insert(users).values({
    name: 'Alex Rivera',
    email: 'alex@projecttracker.app',
    passwordHash,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=90',
  }).onConflictDoNothing().returning();

  const [devUser] = await db.insert(users).values({
    name: 'Carlos Mendoza',
    email: 'carlos@projecttracker.app',
    passwordHash,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=90',
  }).onConflictDoNothing().returning();

  const creatorId = adminUser?.id || devUser?.id;
  const assigneeId = devUser?.id || adminUser?.id;

  // 2. Clear existing items
  await db.delete(items);

  // 3. Seed Ideas
  const [ideaItem] = await db.insert(items).values({
    viewType: 'ideas',
    title: 'Implementar vista tipo Kanban alternatoria para tareas urgentes',
    context: 'Los usuarios necesitan cambiar de vista tabla a tablero visual rápidamente',
    location: 'Dashboard Principal / Módulo de Vistas',
    status: 'in_progress',
    notes: 'Priorizar animación fluida entre vistas',
    creatorId,
    assigneeId,
  }).returning();

  await db.insert(items).values([
    {
      viewType: 'ideas',
      title: 'Sistema de notificaciones push en tiempo real para asignaciones',
      context: 'Informar al responsable cuando se le asigna un problema crítico',
      location: 'Módulo de Asignación',
      status: 'backlog',
      notes: 'Usar Web Push API o WebSockets',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'ideas',
      title: 'Exportación instantánea a Excel y PDF con un solo clic',
      context: 'Generar reportes semanales para gerencia',
      location: 'Exportación / Reportes',
      status: 'todo',
      notes: 'Mantener formato limpio y columnas exactas',
      creatorId,
      assigneeId,
    }
  ]);

  // 4. Seed Bugs / Problemas
  const [bugItem] = await db.insert(items).values({
    viewType: 'bugs',
    title: 'Error 500 al subir imágenes PNG superiores a 4MB en Firefox',
    severity: 'Alta',
    location: 'Servicio de Archivos / API Adjuntos',
    status: 'in_progress',
    notes: 'Revisar buffer límite en proveedor de almacenamiento',
    creatorId,
    assigneeId,
  }).returning();

  await db.insert(items).values([
    {
      viewType: 'bugs',
      title: 'Desplazamiento horizontal roto en pantallas móviles pequeñas',
      severity: 'Media',
      location: 'Navbar Liquid Glass / Header',
      status: 'todo',
      notes: 'Ajustar padding responsivo',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'bugs',
      title: 'Sesión expira antes del tiempo configurado de 30 días',
      severity: 'Crítica',
      location: 'Módulo de Sesiones / Validación Auth',
      status: 'backlog',
      notes: 'Verificar cálculo de expiración en cookie',
      creatorId,
      assigneeId,
    }
  ]);

  // 5. Seed Optimizaciones
  await db.insert(items).values([
    {
      viewType: 'optimizaciones',
      title: 'Reducir tamaño del bundle de JavaScript en componentes pesados',
      impact: 'Alto',
      effort: 'Bajo',
      status: 'in_progress',
      notes: 'Diferir carga de modal Masonry hasta abrirlo',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'optimizaciones',
      title: 'Compresión automática WebP en cliente antes del almacenamiento',
      impact: 'Alto',
      effort: 'Medio',
      status: 'todo',
      notes: 'Ahorro de hasta 70% de ancho de banda',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'optimizaciones',
      title: 'Indexación de búsquedas avanzadas en base de datos',
      impact: 'Medio',
      effort: 'Bajo',
      status: 'backlog',
      notes: 'Mejora de velocidad en tablas de >10k filas',
      creatorId,
      assigneeId,
    }
  ]);

  // 6. Seed Implementaciones
  await db.insert(items).values([
    {
      viewType: 'implementaciones',
      title: 'Integración completa con servicio de almacenamiento en la nube',
      priority: 'P1',
      sprint: 'Sprint 1 - Launch',
      status: 'in_progress',
      notes: 'Configurar variables de entorno en servidor',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'implementaciones',
      title: 'Modal Flotante Masonry Grid para previsualizar capturas de pantalla',
      priority: 'P1',
      sprint: 'Sprint 1 - Launch',
      status: 'done',
      notes: 'Soporta zoom y descarga rápida de imágenes',
      creatorId,
      assigneeId,
    },
    {
      viewType: 'implementaciones',
      title: 'Controlador de Autenticación Segura y Hashing de contraseñas',
      priority: 'P1',
      sprint: 'Sprint 1 - Launch',
      status: 'done',
      notes: 'Tokens seguros en cookies HTTP-only',
      creatorId,
      assigneeId,
    }
  ]);

  // 7. Seed sample attachment for Masonry preview demo
  if (ideaItem) {
    await db.insert(attachments).values([
      {
        itemId: ideaItem.id,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        filename: 'liquid-glass-concept.jpg',
        mimeType: 'image/jpeg',
      },
      {
        itemId: ideaItem.id,
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        filename: 'data-grid-dashboard.jpg',
        mimeType: 'image/jpeg',
      }
    ]);
  }

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
