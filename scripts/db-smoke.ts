import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const runId = `smoke-${Date.now()}`;

  // Prepare minimal linked data
  const hotel = await prisma.hotel.create({
    data: {
      name: `Smoke Hotel ${runId}`,
      phone: '010-0000-0000',
      address: 'Seoul',
    },
  });

  const room = await prisma.room.create({
    data: {
      name: `Smoke Room ${runId}`,
      description: 'Test room',
      capacity: 2,
      hotelId: hotel.id,
    },
  });

  const pkg = await prisma.package.create({
    data: {
      name: `Smoke Package ${runId}`,
      description: 'Test package',
      price: 10000,
      roomId: room.id,
    },
  });

  // Inventory for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.inventory.create({
    data: {
      date: today,
      roomId: room.id,
      totalCount: 5,
      packageId: pkg.id,
    },
  });

  // User minimal
  const user = await prisma.user.create({
    data: {
      email: `${runId}@test.local`,
      password: 'hashed',
      name: 'Smoke Tester',
    },
  });

  // Booking with non-null roomId
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      roomId: room.id,
      totalAmount: 20000,
      checkInDate: today,
      checkOutDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      guestName: 'Guest',
      guestPhone: '010-1111-2222',
      bookingItems: {
        create: [
          {
            packageId: pkg.id,
            price: 20000,
            quantity: 1,
          },
        ],
      },
    },
    include: { bookingItems: true },
  });

  // Read
  const readBack = await prisma.booking.findUniqueOrThrow({
    where: { id: booking.id },
    include: { room: true, bookingItems: true },
  });

  // Update
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { notes: 'updated-note' },
  });

  // Delete (cleanup)
  await prisma.bookingItem.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.package.delete({ where: { id: pkg.id } });
  await prisma.room.delete({ where: { id: room.id } });
  await prisma.hotel.delete({ where: { id: hotel.id } });
  await prisma.inventory.deleteMany({ where: { date: today } });

  console.log(
    JSON.stringify(
      {
        ok: true,
        created: { hotel: hotel.id, room: room.id, package: pkg.id, booking: booking.id },
        readBack: { id: readBack.id, items: readBack.bookingItems.length },
        updated: { id: updated.id, notes: updated.notes },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error('SMOKE_TEST_ERROR', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
