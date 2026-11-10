
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    console.log("CURRENT CLERK ID:", user?.id);
console.log("CURRENT CLERK EMAIL:", user?.emailAddresses);

    if (!user) {
      return null;
    }

    // Get the primary email address
    const email =
      user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("No email address found for Clerk user");
    }

    // Find or create the user in PostgreSQL
    const dbUser = await prisma.user.upsert({
      where: {
        clerkId: user.id,
      },

      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        phone: user.phoneNumbers[0]?.phoneNumber ?? null,
      },

      create: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        phone: user.phoneNumbers[0]?.phoneNumber ?? null,
      },
    });

    console.log("User successfully synced:", dbUser.id);

    return dbUser;

  } catch (error) {
    console.error("Error in syncUser:", error);

    // Don't silently ignore database errors
    throw error;
  }
}
